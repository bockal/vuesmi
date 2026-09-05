import { OWNER_SESSION_COOKIE } from "../../owner-auth";

export async function GET(request:Request){
  const response=Response.redirect(new URL("/",request.url),303);
  response.headers.append("Set-Cookie",`${OWNER_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return response;
}
