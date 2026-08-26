import { getAuthorizedOwner } from "../owner-auth";
import OwnerCalendar from "./owner-calendar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OwnerPage() {
  const owner = await getAuthorizedOwner();
  if (!owner) {
    return (
      <main className="ownerShell">
        <div className="ownerDenied">
          <h1>Owner access isn’t configured</h1>
          <p>
            Sign in through Cloudflare Access using bockal@gmail.com or
            bockda@gmail.com.
          </p>
          <Link href="/">Return to listing</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ownerShell">
      <header className="ownerHeader">
        <div>
          <Link href="/" className="brand">THE VUES</Link>
          <p>Bookings &amp; calendar</p>
        </div>
        <a href="/cdn-cgi/access/logout">Sign out</a>
      </header>
      <OwnerCalendar />
    </main>
  );
}
