import { and,eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookingRequests } from "../../../../db/schema";
import { hashCancellationToken } from "../../../cancel-token";
export async function POST(request:Request){
  const body=await request.json() as {id?:number;token?:string};const id=Number(body.id),token=body.token?.trim();
  if(!Number.isInteger(id)||id<1||!token)return Response.json({error:"This cancellation link is invalid."},{status:400});
  const hash=await hashCancellationToken(token),db=getDb();
  const [booking]=await db.select({status:bookingRequests.status,arrival:bookingRequests.arrival,departure:bookingRequests.departure}).from(bookingRequests).where(and(eq(bookingRequests.id,id),eq(bookingRequests.cancelTokenHash,hash))).limit(1);
  if(!booking)return Response.json({error:"This cancellation link is invalid or has expired."},{status:404});
  if(booking.status==="canceled")return Response.json({canceled:true,alreadyCanceled:true,arrival:booking.arrival,departure:booking.departure});
  if(booking.status!=="requested"&&booking.status!=="approved")return Response.json({error:"This reservation can no longer be canceled online. Please contact the owners."},{status:409});
  await db.update(bookingRequests).set({status:"canceled"}).where(and(eq(bookingRequests.id,id),eq(bookingRequests.cancelTokenHash,hash)));
  return Response.json({canceled:true,arrival:booking.arrival,departure:booking.departure});
}

