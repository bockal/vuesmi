import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { dateBlocks } from "../../../../db/schema";
import { getAuthorizedOwner } from "../../../owner-auth";

export async function GET(){if(!await getAuthorizedOwner())return Response.json({error:"Unauthorized"},{status:401});const blocks=await getDb().select().from(dateBlocks);return Response.json({blocks});}
export async function POST(request:Request){if(!await getAuthorizedOwner())return Response.json({error:"Unauthorized"},{status:401});const p=await request.json() as {start?:string;end?:string;label?:string};if(!p.start||!p.end||p.end<=p.start)return Response.json({error:"Choose a valid start and end date."},{status:400});const [block]=await getDb().insert(dateBlocks).values({startDate:p.start,endDate:p.end,label:p.label?.trim()||"Owner blocked"}).returning();return Response.json({block},{status:201});}
export async function DELETE(request:Request){if(!await getAuthorizedOwner())return Response.json({error:"Unauthorized"},{status:401});const id=Number(new URL(request.url).searchParams.get("id"));if(!Number.isInteger(id))return Response.json({error:"Invalid block"},{status:400});await getDb().delete(dateBlocks).where(eq(dateBlocks.id,id));return Response.json({ok:true});}
