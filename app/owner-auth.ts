import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";
import { getDb } from "../db";
import { ownerAuthTokens } from "../db/schema";

export const OWNER_EMAILS = new Set([
  "bockal@gmail.com",
  "bockda@gmail.com",
]);

export const OWNER_SESSION_COOKIE = "vues_owner_session";

function normalize(email:string){return email.trim().toLowerCase()}

export function isOwnerEmail(email:string){return OWNER_EMAILS.has(normalize(email))}

export async function hashOwnerToken(token:string){
  const bytes=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

export function createOwnerToken(){
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

export async function getAuthorizedOwner():Promise<ChatGPTUser|null> {
  const user = await getChatGPTUser();
  if (user && isOwnerEmail(user.email)) return user;

  const cookieStore=await cookies();
  const session=cookieStore.get(OWNER_SESSION_COOKIE)?.value;
  if(!session)return null;

  try{
    const tokenHash=await hashOwnerToken(session);
    const now=new Date().toISOString();
    const db=getDb();
    const [row]=await db.select().from(ownerAuthTokens).where(and(
      eq(ownerAuthTokens.tokenHash,tokenHash),
      eq(ownerAuthTokens.kind,"session"),
      gt(ownerAuthTokens.expiresAt,now),
      isNull(ownerAuthTokens.usedAt),
    )).limit(1);
    if(!row||!isOwnerEmail(row.email))return null;
    return {displayName:row.email,email:row.email,fullName:null};
  }catch{
    return null;
  }
}
