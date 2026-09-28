import { inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookingRequests,dateBlocks } from "../../../db/schema";

export const dynamic="force-dynamic";

export async function GET(){
  try{
    const db=getDb();
    const [blocks,reserved]=await Promise.all([
      db.select({id:dateBlocks.id,start:dateBlocks.startDate,end:dateBlocks.endDate,label:dateBlocks.label}).from(dateBlocks),
      db.select({id:bookingRequests.id,start:bookingRequests.arrival,end:bookingRequests.departure,status:bookingRequests.status}).from(bookingRequests).where(inArray(bookingRequests.status,["approved","confirmed"])),
    ]);
    return Response.json(
      {ok:true,ranges:[...blocks.map(b=>({...b,type:"blocked"})),...reserved.map(b=>({id:b.id,start:b.start,end:b.end,label:"Reserved",type:"reserved"}))]},
      {headers:{"cache-control":"no-store, no-cache, must-revalidate, max-age=0","cdn-cache-control":"no-store"}}
    );
  }catch(error){
    console.error("availability_failed",error);
    return Response.json({ok:false,error:"Availability is temporarily unavailable."},{status:503,headers:{"cache-control":"no-store"}});
  }
}
