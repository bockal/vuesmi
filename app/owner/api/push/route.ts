import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { pushSubscriptions } from "../../../../db/schema";
import { getAuthorizedOwner } from "../../../owner-auth";
import { getVapidPublicKey } from "../../../push";

type PushBody={endpoint?:string;keys?:{p256dh?:string;auth?:string}};

export async function GET(){
  const owner=await getAuthorizedOwner();
  if(!owner)return Response.json({error:"Unauthorized"},{status:401});
  const publicKey=getVapidPublicKey();
  if(!publicKey)return Response.json({error:"Push notifications are not configured."},{status:503});
  return Response.json({publicKey});
}

export async function POST(request:Request){
  const owner=await getAuthorizedOwner();
  if(!owner)return Response.json({error:"Unauthorized"},{status:401});
  const body=await request.json() as PushBody;
  const endpoint=body.endpoint?.trim(),p256dh=body.keys?.p256dh?.trim(),auth=body.keys?.auth?.trim();
  if(!endpoint||!p256dh||!auth)return Response.json({error:"Invalid push subscription."},{status:400});
  if(new URL(endpoint).protocol!=="https:")return Response.json({error:"Invalid push endpoint."},{status:400});
  const email=owner.email.trim().toLowerCase();
  await getDb().insert(pushSubscriptions).values({ownerEmail:email,endpoint,p256dh,auth}).onConflictDoUpdate({target:pushSubscriptions.endpoint,set:{ownerEmail:email,p256dh,auth}});
  return Response.json({subscribed:true});
}

export async function DELETE(request:Request){
  const owner=await getAuthorizedOwner();
  if(!owner)return Response.json({error:"Unauthorized"},{status:401});
  const body=await request.json() as {endpoint?:string};
  if(body.endpoint)await getDb().delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint,body.endpoint));
  return Response.json({subscribed:false});
}

