import { getChatGPTUser } from "./chatgpt-auth";

const OWNER_EMAILS = new Set([
  "bockal@gmail.com",
  "bockda@gmail.com",
]);

export async function getAuthorizedOwner() {
  const user = await getChatGPTUser();
  if (!user) return null;
  return OWNER_EMAILS.has(user.email.trim().toLowerCase()) ? user : null;
}
