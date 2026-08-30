import { and, desc, eq, lt } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookingRequests } from "../../../../db/schema";
import { getAuthorizedOwner } from "../../../owner-auth";
import { calculateQuote, money } from "../../../pricing";
import { escapeHtml, sendMail } from "../../../email";

async function ownerOr401(){return await getAuthorizedOwner()}
function approvalEmailHtml(booking:typeof bookingRequests.$inferSelect){
  const quote=calculateQuote(booking.arrival,booking.departure,booking.adults,booking.children,booking.boatRental,booking.pets);
  const depositCents=Math.min(quote.totalCents,Math.max(25_000,Math.round(quote.totalCents*.30)));
  return `<h2>Your request is approved</h2><p>Hi ${escapeHtml(booking.name)}, your stay from ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)} has been approved.</p><p><strong>Total: ${money(quote.totalCents)}</strong>, including 6% Michigan lodging tax${booking.boatRental?` and ${money(quote.boatRentalCents)} for pontoon / jet-ski rental`:""}.</p><p>To hold the dates, please send a <strong>${money(depositCents)} deposit</strong> using <a href="https://venmo.com/u/KlingerLake68109">Venmo @KlingerLake68109</a>, or reply for Zelle instructions. Include memo <strong>VUES-${booking.id}</strong>. Your dates are confirmed after the owner verifies receipt.</p><p><strong>Cancellation policy:</strong> Email bockal@gmail.com at least seven full days before check-in for a full refund. Requests received fewer than seven days before check-in are not eligible for a full refund.</p>`;
}
export async function GET(){
  if(!await ownerOr401())return Response.json({error:"Unauthorized"},{status:401});
  const db=getDb();
  const cutoff=new Date(Date.now()-86_400_000).toISOString().slice(0,19).replace("T"," ");
  await db.delete(bookingRequests).where(and(eq(bookingRequests.status,"declined"),lt(bookingRequests.createdAt,cutoff)));
  const rows=await db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt));
  return Response.json({requests:rows});
}

export async function POST(request:Request){
  const owner=await ownerOr401();if(!owner)return Response.json({error:"Unauthorized"},{status:401});
  try{
    const body=await request.json() as {id?:number;action?:"approve"|"decline"|"confirm"|"cancel"};
    if(!body.id||!body.action)return Response.json({error:"Missing request or action."},{status:400});
    const db=getDb();const [booking]=await db.select().from(bookingRequests).where(eq(bookingRequests.id,body.id)).limit(1);
    if(!booking)return Response.json({error:"Request not found."},{status:404});
    if(body.action==="cancel"){
      if(booking.status!=="approved"&&booking.status!=="confirmed")return Response.json({error:"Only an approved or confirmed reservation can be canceled."},{status:409});
      await db.update(bookingRequests).set({status:"canceled"}).where(eq(bookingRequests.id,booking.id));
      return Response.json({status:"canceled"});
    }
    if(body.action==="confirm"){
      if(booking.status!=="approved")return Response.json({error:"Only an approved request can be confirmed."},{status:409});
      await db.update(bookingRequests).set({status:"confirmed"}).where(eq(bookingRequests.id,booking.id));
      await Promise.allSettled([sendMail({to:booking.email,subject:"Your stay at The Vues is confirmed",html:`<h2>Your dates are confirmed</h2><p>Hi ${escapeHtml(booking.name)}, we received your deposit and confirmed your stay from ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)}.</p>`}),sendMail({to:"bockal@gmail.com",subject:`Vues booking #${booking.id} confirmed`,html:`<p>${escapeHtml(owner.email)} marked the deposit received for ${escapeHtml(booking.name)}. The dates ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)} are now blocked on the website.</p>`})]);
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
    const depositCents=Math.min(quote.totalCents,Math.max(25_000,Math.round(quote.totalCents*.30)));
    await db.update(bookingRequests).set({status:"approved",quoteCents:quote.totalCents,stripeSessionId:null,paymentUrl:null}).where(eq(bookingRequests.id,booking.id));
    const memo=`VUES-${booking.id}`;
    await Promise.allSettled([
      sendMail({to:booking.email,subject:"Your stay at The Vues is approved",html:approvalEmailHtml(booking)}),
      sendMail({to:"bockal@gmail.com",subject:`Vues request #${booking.id} approved`,html:`<p>${escapeHtml(owner.email)} approved ${escapeHtml(booking.name)} for ${escapeHtml(booking.arrival)} through ${escapeHtml(booking.departure)}.</p><p>Total: ${money(quote.totalCents)}. Requested deposit: ${money(depositCents)}. Payment options were emailed to the guest.</p>`})
    ]);
    return Response.json({status:"approved"});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Could not update request."},{status:500});}
}

