import { getAuthorizedOwner } from "../owner-auth";
import OwnerCalendar from "./owner-calendar";
import Link from "next/link";
import PushNotifications from "./push-notifications";

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

  const feed = "https://vuesmi.com/calendar.ics";
  const googleCalendar = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feed)}`;

  return (
    <main className="ownerShell">
      <header className="ownerHeader">
        <div>
          <Link href="/" className="brand">THE VUES</Link>
          <p>Bookings &amp; calendar</p>
        </div>
        <a href="/cdn-cgi/access/logout">Sign out</a>
      </header>
      <PushNotifications />
      <section className="calendarSync">
        <div>
          <p className="eyebrow">Calendar sync</p>
          <h2>Keep Google Calendar up to date</h2>
          <p>Subscribe once to automatically see confirmed stays and owner-blocked dates.</p>
        </div>
        <a href={googleCalendar} target="_blank" rel="noreferrer">＋ Add to Google Calendar</a>
      </section>
      <OwnerCalendar />
    </main>
  );
}

