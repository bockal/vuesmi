import { getAuthorizedOwner } from "../../owner-auth";
import { redirect } from "next/navigation";

export const dynamic="force-dynamic";

export default async function OwnerLoginPage({searchParams}:{searchParams:Promise<{sent?:string;error?:string}>}){
  if(await getAuthorizedOwner())redirect("/owner");
  const p=await searchParams;
  return <main className="ownerShell"><div className="ownerDenied">
    <a href="/" className="brand">THE VUES</a>
    <h1>Owner sign in</h1>
    <p>Enter an authorized owner email. We’ll send a fresh secure sign-in link that works on this device.</p>
    {p.sent&&<p>Check your email for the new sign-in link. It expires in 15 minutes.</p>}
    {p.error&&<p className="formError">{p.error}</p>}
    <form method="post" action="/owner/api/login" className="blockForm">
      <label className="full">Owner email<input type="email" name="email" autoComplete="email" required placeholder="you@example.com"/></label>
      <button className="full" type="submit">Email me a sign-in link</button>
    </form>
  </div></main>;
}
