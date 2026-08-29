import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { pushSubscriptions } from "../db/schema";

type Subscription={endpoint:string;p256dh:string;auth:string};
type BookingPush={id:number;name:string;arrival:string;departure:string;detail:string};

const encoder=new TextEncoder();
const b64url=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const decode=(value:string)=>{const normalized=value.replace(/-/g,"+").replace(/_/g,"/");const raw=atob(normalized+"=".repeat((4-normalized.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0))};
const concat=(...parts:Uint8Array[])=>{const result=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length}return result};
async function hmac(key:Uint8Array,data:Uint8Array){const cryptoKey=await crypto.subtle.importKey("raw",key,{name:"HMAC",hash:"SHA-256"},false,["sign"]);return new Uint8Array(await crypto.subtle.sign("HMAC",cryptoKey,data))}
async function hkdfExpand(prk:Uint8Array,info:Uint8Array,length:number){return (await hmac(prk,concat(info,new Uint8Array([1])))).slice(0,length)}

function runtime(){
  return env as unknown as {VAPID_PUBLIC_KEY?:string;VAPID_PRIVATE_JWK?:string};
}

export function getVapidPublicKey(){return runtime().VAPID_PUBLIC_KEY??""}

async function vapidHeaders(endpoint:string){
  const settings=runtime();
  if(!settings.VAPID_PUBLIC_KEY||!settings.VAPID_PRIVATE_JWK)throw new Error("Push is not configured");
  const origin=new URL(endpoint).origin;
  const now=Math.floor(Date.now()/1000);
  const encodeJson=(value:unknown)=>b64url(encoder.encode(JSON.stringify(value)));
  const unsigned=`${encodeJson({typ:"JWT",alg:"ES256"})}.${encodeJson({aud:origin,exp:now+43200,sub:"mailto:bockal@gmail.com"})}`;
  const key=await crypto.subtle.importKey("jwk",JSON.parse(settings.VAPID_PRIVATE_JWK),{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);
  const signature=new Uint8Array(await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},key,encoder.encode(unsigned)));
  return {authorization:`vapid t=${unsigned}.${b64url(signature)}, k=${settings.VAPID_PUBLIC_KEY}`};
}

async function encrypt(subscription:Subscription,payload:string){
  const clientPublic=decode(subscription.p256dh);
  const clientAuth=decode(subscription.auth);
  const clientKey=await crypto.subtle.importKey("raw",clientPublic,{name:"ECDH",namedCurve:"P-256"},false,[]);
  const serverKeys=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
  const shared=new Uint8Array(await crypto.subtle.deriveBits({name:"ECDH",public:clientKey},serverKeys.privateKey,256));
  const serverPublic=new Uint8Array(await crypto.subtle.exportKey("raw",serverKeys.publicKey));
  const prkKey=await hmac(clientAuth,shared);
  const ikm=await hkdfExpand(prkKey,concat(encoder.encode("WebPush: info"),new Uint8Array([0]),clientPublic,serverPublic),32);
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const prk=await hmac(salt,ikm);
  const cek=await hkdfExpand(prk,concat(encoder.encode("Content-Encoding: aes128gcm"),new Uint8Array([0])),16);
  const nonce=await hkdfExpand(prk,concat(encoder.encode("Content-Encoding: nonce"),new Uint8Array([0])),12);
  const plaintext=concat(encoder.encode(payload),new Uint8Array([2]));
  const aesKey=await crypto.subtle.importKey("raw",cek,"AES-GCM",false,["encrypt"]);
  const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:nonce},aesKey,plaintext));
  const recordSize=new Uint8Array([0,0,16,0]);
  return concat(salt,recordSize,new Uint8Array([serverPublic.length]),serverPublic,ciphertext);
}

async function send(subscription:Subscription,payload:string){
  const body=await encrypt(subscription,payload);
  const headers=await vapidHeaders(subscription.endpoint);
  return fetch(subscription.endpoint,{method:"POST",headers:{...headers,"content-encoding":"aes128gcm","content-type":"application/octet-stream",ttl:"86400"},body});
}

export async function sendBookingPush(booking:BookingPush){
  if(!getVapidPublicKey())return;
  const db=getDb();
  const subscriptions=await db.select().from(pushSubscriptions);
  const payload=JSON.stringify({title:"New Vues booking request",body:`${booking.name}: ${booking.arrival}–${booking.departure} · ${booking.detail}`,url:"/owner",tag:`vues-booking-${booking.id}`});
  await Promise.all(subscriptions.map(async subscription=>{
    try{
      const response=await send(subscription,payload);
      if(response.status===404||response.status===410)await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint,subscription.endpoint));
      else if(!response.ok)console.error(JSON.stringify({event:"push_failed",status:response.status,endpointHost:new URL(subscription.endpoint).host}));
    }catch(error){console.error(JSON.stringify({event:"push_error",message:error instanceof Error?error.message:"unknown"}))}
  }));
}
