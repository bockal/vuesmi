"use client";
import { useState } from "react";
export default function CancelRequest({id,token}:{id:number;token:string}){
  const [state,setState]=useState<"ready"|"working"|"done"|"error">("ready"),[message,setMessage]=useState("");
  async function cancel(){setState("working");const response=await fetch("/api/booking-requests/cancel",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,token})});const result=await response.json() as {error?:string;arrival?:string;departure?:string};if(!response.ok){setMessage(result.error??"We could not cancel this request.");setState("error");return}setMessage(`Your request for ${result.arrival} through ${result.departure} has been canceled.`);setState("done")}
  if(state==="done")return <div className="cancelSuccess"><span>✓</span><h2>Request canceled</h2><p>{message}</p><a href="/">Return to The Vues</a></div>;
  return <div className="cancelCard"><p className="eyebrow">The Vues at Klinger Lake</p><h1>Cancel your date request?</h1><p>This will withdraw your request. The owners will no longer review these dates for your stay.</p>{state==="error"&&<p className="formError">{message}</p>}<button onClick={cancel} disabled={state==="working"}>{state==="working"?"Canceling…":"Yes, cancel my request"}</button><a href="/">No, keep my request</a></div>;
}

