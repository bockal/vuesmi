const encoder=new TextEncoder();
const b64url=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
export async function createCancellationToken(){const token=b64url(crypto.getRandomValues(new Uint8Array(32)));return {token,hash:await hashCancellationToken(token)}}
export async function hashCancellationToken(token:string){return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(token))))}

