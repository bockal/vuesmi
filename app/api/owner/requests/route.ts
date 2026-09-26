import { and, desc, eq, lt } from "drizzle-orm";
import { ensureBookingRequestSchema } from "../../../../db/ensure-schema";
import { getDb } from "../../../../db";
import { bookingRequests } from "../../../../db/schema";
import { getAuthorizedOwner } from "../../../owner-auth";
import { calculateQuote, money } from "../../../pricing";
import { escapeHtml, sendMail } from "../../../email";
import { createRulesToken } from "../../../rules-token";

async function ownerOr401(){return await getAuthorizedOwner()}

function depositFor(totalCents:number){
  return Math.min(totalCents,Math.max(25_000,Math.round(totalCents*.30)));
}

function approvalEmailHtml(booking:typeof bookingRequests.$inferSelect){
  const quote=calculateQuote(booking.arrival,booking.departure,booking.adults,booking.children,booking.boatRental,booking.pets);
  const depositCents=depositFor(quote.totalCents);
  return `<h2>Your request is approved</h2><p>Hi ${escapeHtml(booking.name)}, your stay from ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)} has been approved.</p><p><strong>Total: ${money(quote.totalCents)}</strong>, including 6% Michigan lodging tax${booking.boatRental?` and ${money(quote.boatRentalCents)} for pontoon / jet-ski rental`:""}.</p><p>To hold the dates, please send a <strong>${money(depositCents)} deposit</strong>. Your dates are confirmed after the owner verifies receipt.</p><table role="presentation" style="margin:22px 0;border-collapse:separate;border-spacing:10px 0"><tr><td><a href="https://www.venmo.com/u/KlingerLake68109" style="display:inline-block;background:#008CFF;color:#fff;text-decoration:none;padding:13px 18px;border-radius:7px;font-weight:bold">Pay deposit with Venmo</a></td><td><a href="https://vuesmi.com/zelle-payment-qr.png" style="display:inline-block;background:#6d1ed4;color:#fff;text-decoration:none;padding:13px 18px;border-radius:7px;font-weight:bold">Pay deposit with Zelle</a></td></tr></table><p><strong>Zelle:</strong> Aubrey Backscheider · (513) 800-7366. <a href="https://vuesmi.com/zelle-payment-qr.png">Open the Zelle QR code</a>.</p><p>Please include memo <strong>VUES-${booking.id}</strong> with your payment.</p><p><strong>Cancellation policy:</strong> Email bockal@gmail.com at least seven full days before check-in for a full refund. Requests received fewer than seven days before check-in are not eligible for a full refund.</p>`;
}

function confirmationEmailHtml(booking:typeof bookingRequests.$inferSelect,token:string){
  const quote=calculateQuote(booking.arrival,booking.departure,booking.adults,booking.children,booking.boatRental,booking.pets);
  const depositCents=depositFor(quote.totalCents);
  const balanceCents=Math.max(0,quote.totalCents-depositCents);
  const rulesUrl=`https://vuesmi.com/house-rules?id=${booking.id}&token=${encodeURIComponent(token)}`;
  return `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#222"><h2>Your stay at The Vues is confirmed</h2><p>Hi ${escapeHtml(booking.name)}, we received your deposit and confirmed your stay from ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)}.</p><p><strong>One guest step remains:</strong> please review and electronically sign the House Rules & Water Safety Agreement.</p><p><a href="${rulesUrl}" style="display:inline-block;background:#173f3a;color:white;text-decoration:none;padding:13px 18px;border-radius:7px;font-weight:bold">Review & sign the guest agreement</a></p><p>Based on the requested deposit, your remaining balance is <strong>${money(balanceCents)}</strong>. You may use Venmo @KlingerLake68109 or reply for Zelle instructions and include memo <strong>VUES-${booking.id}</strong>.</p><p><strong>Cancellation policy:</strong> Email bockal@gmail.com at least seven full days before check-in for a full refund. Requests received fewer than seven days before check-in are not eligible for a full refund.</p><p>Arrival and access information can be coordinated with the owners after the guest agreement is complete.</p><p>We’re looking forward to having you at the lake.</p><p>David & Aubrey<br>The Vues at Klinger Lake</p></div>`;
}

export async function GET(){
  await ensureBookingRequestSchema();
  if(!await ownerOr401())return Response.json({error:"Unauthorized"},{status:401});
  const db=getDb();
  const cutoff=new Date(Date.now()-86_400_000).toISOString().slice(0,19).replace("T"," ");
  await db.delete(bookingRequests).where(and(eq(bookingRequests.status,"declined"),lt(bookingRequests.createdAt,cutoff)));
  const rows=await db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt));
  return Response.json({requests:rows});
}

export async function POST(request:Request){
  await ensureBookingRequestSchema();
  const owner=await ownerOr401();if(!owner)return Response.json({error:"Unauthorized"},{status:401});
  try{
    const body=await request.json() as {id?:number;action?:"approve"|"decline"|"confirm"|"cancel"|"send-rules"};
    if(!body.id||!body.action)return Response.json({error:"Missing request or action."},{status:400});
    const db=getDb();const [booking]=await db.select().from(bookingRequests).where(eq(bookingRequests.id,body.id)).limit(1);
    if(!booking)return Response.json({error:"Request not found."},{status:404});

    if(body.action==="cancel"){
      if(booking.status!=="approved"&&booking.status!=="confirmed")return Response.json({error:"Only an approved or confirmed reservation can be canceled."},{status:409});
      await db.update(bookingRequests).set({status:"canceled"}).where(eq(bookingRequests.id,booking.id));
      return Response.json({status:"canceled"});
    }

    if(body.action==="send-rules"){
      if(booking.status!=="confirmed")return Response.json({error:"Rules links are only sent for confirmed reservations."},{status:409});
      if(booking.rulesAcknowledgedAt)return Response.json({error:"This guest has already acknowledged the rules."},{status:409});
      const rules=await createRulesToken();
      await db.update(bookingRequests).set({rulesTokenHash:rules.hash}).where(eq(bookingRequests.id,booking.id));
      await sendMail({to:booking.email,subject:"Action requested: House Rules & Water Safety — The Vues",html:confirmationEmailHtml(booking,rules.token)});
      return Response.json({status:"rules-sent"});
    }

    if(body.action==="confirm"){
      if(booking.status!=="approved")return Response.json({error:"Only an approved request can be confirmed."},{status:409});
      const rules=await createRulesToken();
      await db.update(bookingRequests).set({status:"confirmed",rulesTokenHash:rules.hash}).where(eq(bookingRequests.id,booking.id));
      await Promise.allSettled([
        sendMail({to:booking.email,subject:"Your stay at The Vues is confirmed — one final step",html:confirmationEmailHtml(booking,rules.token)}),
        sendMail({to:["bockal@gmail.com","bockda@gmail.com"],subject:`Vues booking #${booking.id} confirmed`,html:`<p>${escapeHtml(owner.email)} marked the deposit received for ${escapeHtml(booking.name)}. The dates ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)} are now blocked on the website.</p><p>The guest was emailed a secure House Rules & Water Safety acknowledgement link.</p>`})
      ]);
      return Response.json({status:"confirmed"});
    }

    if(booking.status!=="requested")return Response.json({error:"This request has already been reviewed."},{status:409});

    if(body.action==="decline"){
      const declinedAt=new Date().toISOString().slice(0,19).replace("T"," ");
      await db.update(bookingRequests).set({status:"declined",createdAt:declinedAt}).where(eq(bookingRequests.id,booking.id));
      await sendMail({to:booking.email,subject:"An update on your request for The Vues",html:`<p>Hi ${escapeHtml(booking.name)},</p><p>Unfortunately, we can’t approve your requested stay from ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)}. No payment was taken.</p>`});
      return Response.json({status:"declined"});
    }

    const quote=calculateQuote(booking.arrival,booking.departure,booking.adults,booking.children,booking.boatRental,booking.pets);
    const depositCents=depositFor(quote.totalCents);
    await db.update(bookingRequests).set({status:"approved",quoteCents:quote.totalCents,stripeSessionId:null,paymentUrl:null}).where(eq(bookingRequests.id,booking.id));

    await Promise.allSettled([
      sendMail({to:booking.email,subject:"Your stay at The Vues is approved",html:approvalEmailHtml(booking)}),
      sendMail({to:["bockal@gmail.com","bockda@gmail.com"],subject:`Vues request #${booking.id} approved`,html:`<p>${escapeHtml(owner.email)} approved ${escapeHtml(booking.name)} for ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)}.</p><p>Total: ${money(quote.totalCents)}. Requested deposit: ${money(depositCents)}. Payment options were emailed to the guest.</p>`})
    ]);

    return Response.json({status:"approved"});
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"Could not update request."},{status:500});
  }
}
