"use client";
import { useEffect,useState } from "react";

const decodeKey=(value:string)=>{const raw=atob(value.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-value.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0))};

export default function PushNotifications(){
  const [state,setState]=useState<"checking"|"available"|"enabled"|"working"|"unsupported"|"error">("checking");
  const [message,setMessage]=useState("");

  useEffect(()=>{
    if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){setState("unsupported");return}
    navigator.serviceWorker.register("/sw.js").then(()=>navigator.serviceWorker.ready).then(registration=>registration.pushManager.getSubscription()).then(subscription=>setState(subscription?"enabled":"available")).catch(()=>setState("error"));
  },[]);

  async function enable(){
    setState("working");setMessage("");
    try{
      const permission=await Notification.requestPermission();
      if(permission!=="granted"){setMessage("Notifications were not allowed. Enable them in your phone settings and try again.");setState("error");return}
      const keyResponse=await fetch("/api/push");
      const keyData=await keyResponse.json() as {publicKey?:string;error?:string};
      if(!keyResponse.ok||!keyData.publicKey)throw new Error(keyData.error??"Push is unavailable.");
      const registration=await navigator.serviceWorker.ready;
      const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodeKey(keyData.publicKey)});
      const response=await fetch("/api/push",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(subscription)});
      if(!response.ok)throw new Error("Your phone could not be registered.");
      setState("enabled");
    }catch(error){setMessage(error instanceof Error?error.message:"Could not enable notifications.");setState("error")}
  }

  async function disable(){
    setState("working");
    const registration=await navigator.serviceWorker.ready;
    const subscription=await registration.pushManager.getSubscription();
    if(subscription){await fetch("/api/push",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({endpoint:subscription.endpoint})});await subscription.unsubscribe()}
    setState("available");
  }

  return <section className="pushPanel">
    <div><p className="eyebrow">Phone alerts</p><h2>Booking notifications</h2><p>Receive a notification with a direct link to approve or decline every new request.</p></div>
    {state==="enabled"?<button className="secondary" onClick={disable}>Notifications enabled ✓</button>:<button onClick={enable} disabled={state==="checking"||state==="working"||state==="unsupported"}>{state==="working"?"Enabling…":state==="unsupported"?"Not supported on this device":"Enable notifications on this phone"}</button>}
    {message&&<p className="formError">{message}</p>}
    <small>On iPhone, open the installed The Vues app—not Safari—to enable alerts.</small>
  </section>;
}
