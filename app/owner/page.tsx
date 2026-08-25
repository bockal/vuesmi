import { requireChatGPTUser } from "../chatgpt-auth";
import { getAuthorizedOwner } from "../owner-auth";
import OwnerCalendar from "./owner-calendar";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function OwnerPage(){await requireChatGPTUser("/owner");const owner=await getAuthorizedOwner();if(!owner)return <main className="ownerShell"><div className="ownerDenied"><h1>Owner access isn’t configured</h1><p>This signed-in email is not yet on The Vues owner list. Add it to the site’s owner access setting before managing dates.</p><Link href="/">Return to listing</Link></div></main>;return <main className="ownerShell"><header className="ownerHeader"><div><Link href="/" className="brand">THE VUES</Link><p>Bookings & calendar</p></div><a href="/signout-with-chatgpt?return_to=/">Sign out</a></header><OwnerCalendar /></main>}
