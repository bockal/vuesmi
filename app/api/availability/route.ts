import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookingRequests,dateBlocks } from "../../../db/schema";

export async function GET(){
  try{
    const db=getDb();
    const [blocks,confirmed]=await Promise.all([
      db.select({id:dateBlocks.id,start:dateBlocks.startDate,end:dateBlocks.endDate,label:dateBlocks.label}).from(dateBlocks),
      db.select({id:bookingRequests.id,start:bookingRequests.arrival,end:bookingRequests.departure}).from(bookingRequests).where(eq(bookingRequests.status,"confirmed")),
    ]);
    return Response.json({ranges:[...blocks.map(b=>({...b,type:"blocked"})),...confirmed.map(b=>({...b,label:"Reserved",type:"reserved"}))]},{headers:{"cache-control":"no-store"}});
  }catch{return Response.json({ranges:[]});}
}
