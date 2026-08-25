import { env } from "cloudflare:workers";
import { getChatGPTUser } from "./chatgpt-auth";

export async function getAuthorizedOwner(){
  const user=await getChatGPTUser();
  if(!user)return null;
  const configured=((env as unknown as {OWNER_EMAILS?:string}).OWNER_EMAILS??"").split(",").map(v=>v.trim().toLowerCase()).filter(Boolean);
  return configured.includes(user.email.toLowerCase())?user:null;
}
