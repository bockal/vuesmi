import { getDb } from "../../../../db";
import { ownerAuthTokens } from "../../../../db/schema";
import { createOwnerToken, hashOwnerToken, isOwnerEmail } from "../../../owner-auth";
import { sendMail } from "../../../email";

export async function POST(request:Request){
  const form=await request.formData();
  const email=String(form.get("email")??"").trim().toLowerCase();
  // Always return the same result so this endpoint does not disclose owner addresses.
  if(isOwnerEmail(email)){
    const token=createOwnerToken();
    const tokenHash=await hashOwnerToken(token);
    const expiresAt=new Date(Date.now()+15*60_000).toISOString();
    await getDb().insert(ownerAuthTokens).values({email,tokenHash,kind:"magic",expiresAt});
    const url=`https://vuesmi.com/owner/verify?token=${encodeURIComponent(token)}`;
    await sendMail({to:email,subject:"Sign in to The Vues owner dashboard",html:`<h2>Owner sign in</h2><p>Use this fresh secure link to open the owner dashboard on your device.</p><p style="margin:28px 0"><a href="${url}" style="display:inline-block;background:#173f3a;color:white;text-decoration:none;padding:13px 18px;border-radius:7px;font-weight:bold">Open owner dashboard</a></p><p>This link expires in 15 minutes and can be used once. After sign-in, this device stays signed in for 30 days.</p>`});
  }
  return Response.redirect(new URL("/owner/login?sent=1",request.url),303);
}
