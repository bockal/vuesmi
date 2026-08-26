import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookingRequests, dateBlocks } from "../../../db/schema";
import { calculateQuote, MAX_GUESTS, MIN_NIGHTS, money } from "../../pricing";
import { escapeHtml, sendMail } from "../../email";

export async function POST(request:Request){
  try{
    const p=await request.json() as Record<string,string>;
    const required=["arrival","departure","name","email","phone","agreement"];
    if(required.some(k=>!p[k]?.trim()))return Response.json({error:"Please complete every required field."},{status:400});
    if(p.departure<=p.arrival)return Response.json({error:"Departure must be after arrival."},{status:400});
    const adults=Number(p.adults),children=Number(p.children??0),pets=Number(p.pets??0),boatRental=p.boatRental==="yes";
    if(!Number.isInteger(adults)||adults<1||!Number.isInteger(children)||children<0)return Response.json({error:"Please enter a valid guest count."},{status:400});
    if(!Number.isInteger(pets)||pets<0||pets>1)return Response.json({error:"Please select whether you are bringing a pet."},{status:400});
    const quote=calculateQuote(p.arrival,p.departure,adults,children,boatRental,pets);
    if(quote.guests>MAX_GUESTS)return Response.json({error:`The Vues accommodates up to ${MAX_GUESTS} guests.`},{status:400});
    if(quote.nights<MIN_NIGHTS)return Response.json({error:`Please select at least ${MIN_NIGHTS} nights.`},{status:400});
    const db=getDb();
    const [blocks,reserved]=await Promise.all([
      db.select({id:dateBlocks.id}).from(dateBlocks).where(and(lt(dateBlocks.startDate,p.departure),gt(dateBlocks.endDate,p.arrival))).limit(1),
      db.select({id:bookingRequests.id}).from(bookingRequests).where(and(eq(bookingRequests.status,"confirmed"),lt(bookingRequests.arrival,p.departure),gt(bookingRequests.departure,p.arrival))).limit(1),
    ]);
    if(blocks.length||reserved.length)return Response.json({error:"Those dates are no longer available. Please choose another stay."},{status:409});
    const [booking]=await db.insert(bookingRequests).values({arrival:p.arrival,departure:p.departure,adults,children,boatRental,pets,name:p.name.trim(),email:p.email.trim().toLowerCase(),phone:p.phone.trim(),note:p.note?.trim()??"",quoteCents:quote.totalCents}).returning({id:bookingRequests.id});
    const detail=`${quote.guests} guests · ${quote.nights} nights${pets?" · pet included":""}${boatRental?" · boat rental requested":""} · ${money(quote.totalCents)} including 6% Michigan lodging tax`;
    const safeName=escapeHtml(p.name.trim());
    await Promise.allSettled([
      sendMail({to:"bockal@gmail.com",subject:`New Vues request: ${p.arrival}–${p.departure}`,html:`<h2>New booking request</h2><p><strong>${safeName}</strong> requested ${escapeHtml(p.arrival)} through ${escapeHtml(p.departure)}.</p><p>${escapeHtml(detail)}</p><p>Review and approve it in the <a href="https://vuesmi.com/owner">owner dashboard</a>.</p>`}),
      sendMail({to:p.email.trim().toLowerCase(),subject:"We received your request for The Vues",html:`<h2>Thanks, ${safeName}.</h2><p>We received your request for ${escapeHtml(p.arrival)} through ${escapeHtml(p.departure)}.</p><p>${escapeHtml(detail)}, including a ${money(quote.cleaningCents)} cleaning fee${pets?`, ${money(quote.petCents)} pet fee`:""}${boatRental?`, ${money(quote.boatRentalCents)} boat rental`:""}, and ${money(quote.taxCents)} Michigan lodging tax.</p><p>Nothing has been charged. If the owners approve your stay, we’ll email Zelle and Venmo payment options.</p>`}),
    ]);
    return Response.json({id:booking.id,quote},{status:201});
  }catch{return Response.json({error:"We couldn’t save your request. Please try again."},{status:500});}
}
