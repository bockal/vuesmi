import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookingRequests } from "../../../../db/schema";
import { escapeHtml, sendMail } from "../../../email";
import { getAuthorizedOwner } from "../../../owner-auth";
import { calculateQuote, money } from "../../../pricing";

export async function GET(request:Request){
  if(!await getAuthorizedOwner())return Response.json({error:"Unauthorized"},{status:401});
  const id=Number(new URL(request.url).searchParams.get("id"));
  if(!Number.isInteger(id))return Response.json({error:"Invalid request."},{status:400});
  const [booking]=await getDb().select().from(bookingRequests).where(eq(bookingRequests.id,id)).limit(1);
  if(!booking||booking.status!=="approved")return Response.json({error:"Approved request not found."},{status:404});
  const quote=calculateQuote(booking.arrival,booking.departure,booking.adults,booking.children,booking.boatRental,booking.pets);
  const depositCents=Math.min(quote.totalCents,Math.max(25_000,Math.round(quote.totalCents*.30)));
  const html=`<h2>Your request is approved</h2><p>Hi ${escapeHtml(booking.name)}, your stay from ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)} has been approved.</p><p><strong>Total: ${money(quote.totalCents)}</strong>, including 6% Michigan lodging tax${booking.boatRental?` and ${money(quote.boatRentalCents)} for pontoon / jet-ski rental`:""}.</p><p>To hold the dates, please send a <strong>${money(depositCents)} deposit</strong> using <a href="https://venmo.com/u/KlingerLake68109">Venmo @KlingerLake68109</a>, or reply for Zelle instructions. Include memo <strong>VUES-${booking.id}</strong>. Your dates are confirmed after the owner verifies receipt.</p><p><strong>Cancellation policy:</strong> Email bockal@gmail.com at least seven full days before check-in for a full refund. Requests received fewer than seven days before check-in are not eligible for a full refund.</p>`;
  await sendMail({to:booking.email,subject:"Your stay at The Vues is approved",html});
  return Response.json({sent:true,to:booking.email});
}

