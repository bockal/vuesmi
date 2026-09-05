import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { ownerAuthTokens } from "../../../db/schema";
import { createOwnerToken, hashOwnerToken, isOwnerEmail, OWNER_SESSION_COOKIE } from "../../owner-auth";

export async function GET(request:Request){
  const url=new URL(request.url);
  const token=url.searchParams.get("token")??"";
  if(!token)return Response.redirect(new URL("/owner/login?error=Missing+sign-in+link",request.url),303);
  const db=getDb();
  const tokenHash=await hashOwnerToken(token);
  const now=new Date().toISOString();
  const [row]=await db.select().from(ownerAuthTokens).where(and(eq(ownerAuthTokens.tokenHash,tokenHash),eq(ownerAuthTokens.kind,"magic"),gt(ownerAuthTokens.expiresAt,now),isNull(ownerAuthTokens.usedAt))).limit(1);
  if(!row||!isOwnerEmail(row.email))return Response.redirect(new URL("/owner/login?error=That+link+has+expired+or+already+been+used.+Request+a+fresh+one.",request.url),303);

  await db.update(ownerAuthTokens).set({usedAt:now}).where(eq(ownerAuthTokens.id,row.id));
  const session=createOwnerToken();
  const sessionHash=await hashOwnerToken(session);
  const expiresAt=new Date(Date.now()+30*86_400_000).toISOString();
  await db.insert(ownerAuthTokens).values({email:row.email,tokenHash:sessionHash,kind:"session",expiresAt});

  const response=Response.redirect(new URL("/owner",request.url),303);
  response.headers.append("Set-Cookie",`${OWNER_SESSION_COOKIE}=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30*86_400}`);
  return response;
}
