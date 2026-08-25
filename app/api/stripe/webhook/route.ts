import { env } from "cloudflare:workers";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookingRequests } from "../../../../db/schema";
import { sendMail } from "../../../email";
import { getStripe } from "../../../stripe";

export async function POST(request:Request){
  const signature=request.headers.get("stripe-signature");
  const secret=(env as unknown as {STRIPE_WEBHOOK_SECRET?:string}).STRIPE_WEBHOOK_SECRET;
  if(!signature||!secret)return new Response("Webhook not configured",{status:400});
  try{
    const stripe=getStripe();
    const event=await stripe.webhooks.constructEventAsync(await request.text(),signature,secret,undefined,Stripe.createSubtleCryptoProvider());
    if(event.type==="checkout.session.completed"){
      const session=event.data.object;
      const id=Number(session.metadata?.booking_request_id);
      if(Number.isInteger(id)&&session.payment_status==="paid"){
        const db=getDb();
        const [booking]=await db.select().from(bookingRequests).where(eq(bookingRequests.id,id)).limit(1);
        if(booking&&booking.status!=="confirmed"){
          await db.update(bookingRequests).set({status:"confirmed"}).where(eq(bookingRequests.id,id));
          await Promise.allSettled([
            sendMail({to:booking.email,subject:"Your booking at The Vues is confirmed",html:`<h2>You’re booked.</h2><p>Your stay from ${booking.arrival} through ${booking.departure} is confirmed. We’ll follow up with arrival details before your trip.</p>`}),
            sendMail({to:"bockal@gmail.com",subject:`Paid and confirmed: Vues booking #${id}`,html:`<p>${booking.name} paid for ${booking.arrival} through ${booking.departure}. The dates are now blocked on the website calendar.</p>`})
          ]);
        }
      }
    }
    return Response.json({received:true});
  }catch{return new Response("Invalid webhook",{status:400});}
}
