"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Block={id:number;startDate:string;endDate:string;label:string};
type Booking={
  id:number;arrival:string;departure:string;adults:number;children:number;boatRental:boolean;
  name:string;email:string;phone:string;note:string;status:string;quoteCents:number|null;
  rulesAcknowledgedAt:string|null;rulesAcknowledgedName:string|null;rulesVersion:string|null;
  finalPaymentReceivedAt:string|null;finalPaymentReminderSentAt:string|null;checkInInstructions:string|null;
};
type Action="approve"|"decline"|"confirm"|"cancel"|"send-rules"|"send-payment-reminder"|"final-payment-received";
const usd=(c:number|null)=>c==null?"Quote pending":new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(c/100);
const requestedDeposit=(total:number|null)=>total==null?null:Math.min(total,Math.max(25_000,Math.round(total*.30)));

export default function OwnerCalendar(){
  const [blocks,setBlocks]=useState<Block[]>([]);
  const [requests,setRequests]=useState<Booking[]>([]);
  const [error,setError]=useState("");
  const [working,setWorking]=useState<number|null>(null);
  const load=useCallback(()=>Promise.all([fetch("/owner/api/blocks").then(r=>r.json()),fetch("/owner/api/requests").then(r=>r.json())]).then(([b,q])=>{setBlocks(b.blocks??[]);setRequests(q.requests??[])}),[]);
  useEffect(()=>{load()},[load]);

  async function add(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    const f=new FormData(e.currentTarget);
    const r=await fetch("/owner/api/blocks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(f.entries()))});
    const d=await r.json() as {error?:string};
    if(!r.ok){setError(d.error??"Could not block dates");return}
    e.currentTarget.reset();load();
  }
  async function remove(id:number){
    if(!window.confirm("Remove this blocked date and make it available to guests?"))return;
    setError("");
    const r=await fetch("/owner/api/blocks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"remove",id})});
    const d=await r.json() as {error?:string};
    if(!r.ok){setError(d.error??"Could not remove blocked dates");return}
    await load();
  }
  async function review(id:number,action:Action,extra:Record<string,unknown>={}){
    setWorking(id);setError("");
    const r=await fetch("/owner/api/requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,action,...extra})});
    const d=await r.json() as {error?:string};
    if(!r.ok)setError(d.error??"Could not update request");
    await load();setWorking(null);
  }
  async function cancelReservation(id:number){
    if(!window.confirm("Cancel this reservation and release its dates on the calendar?"))return;
    setWorking(id);setError("");
    try{
      const r=await fetch("/owner/api/requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,action:"cancel"})});
      const d=await r.json() as {error?:string};
      if(!r.ok){setError(d.error??"Could not cancel reservation");return}
      setRequests(current=>current.map(item=>item.id===id?{...item,status:"canceled"}:item));
      await load();
    }catch{
      setError("Could not cancel reservation. Please try again.");
    }finally{
      setWorking(null);
    }
  }

  return <>
    <section className="requestPanel">
      <div>
        <p className="eyebrow">Request inbox</p>
        <h1>Booking requests</h1>
        <p>Approve a request to email the quote and Zelle/Venmo options. Mark the deposit received to confirm the stay, block its dates, and automatically send the secure guest-agreement link.</p>
      </div>
      {error&&<p className="formError">{error}</p>}
      <div className="requestList">
        {requests.length===0?<p>No requests yet.</p>:requests.map(r=>{
          const deposit=requestedDeposit(r.quoteCents);
          const balance=r.quoteCents==null||deposit==null?null:Math.max(0,r.quoteCents-deposit);
          return <article className="requestCard" key={r.id}>
            <div className="requestDates">
              <strong>{r.arrival} → {r.departure}</strong>
              <span className={`status status-${r.status}`}>{r.status}</span>
            </div>
            <h3>{r.name}</h3>
            <p>{r.adults+r.children} guests · {usd(r.quoteCents)}{r.boatRental?" · Boat rental requested":""}</p>
            <p><a href={`mailto:${r.email}`}>{r.email}</a> · <a href={`tel:${r.phone}`}>{r.phone}</a></p>
            {r.note&&<p className="requestNote">“{r.note}”</p>}

            {r.status==="confirmed"&&
              <div className="bookingChecklist">
                <span>Deposit <strong>✓ received</strong></span>
                <span>House rules <strong className={r.rulesAcknowledgedAt?"done":"pending"}>{r.rulesAcknowledgedAt?`✓ signed ${new Date(r.rulesAcknowledgedAt).toLocaleDateString()}`:"⏳ awaiting signature"}</strong></span>
                {r.rulesAcknowledgedName&&<small>Signed by {r.rulesAcknowledgedName}{r.rulesVersion?` · version ${r.rulesVersion}`:""}</small>}
                <span>Balance after requested deposit <strong>{usd(balance)}</strong></span>
                <span>Final payment <strong className={r.finalPaymentReceivedAt?"done":"pending"}>{r.finalPaymentReceivedAt?`✓ received ${new Date(r.finalPaymentReceivedAt).toLocaleDateString()}`:"⏳ outstanding"}</strong></span>
                {!r.finalPaymentReceivedAt&&r.finalPaymentReminderSentAt&&<small>Reminder sent {new Date(r.finalPaymentReminderSentAt).toLocaleDateString()}</small>}
              </div>}

            {r.status==="requested"&&
              <div className="reviewActions">
                <button disabled={working===r.id} onClick={()=>review(r.id,"approve")}>{working===r.id?"Working…":"Approve & email payment options"}</button>
                <button className="secondary" disabled={working===r.id} onClick={()=>review(r.id,"decline")}>Decline</button>
              </div>}

            {r.status==="approved"&&
              <div className="reviewActions">
                <button disabled={working===r.id} onClick={()=>review(r.id,"confirm")}>{working===r.id?"Working…":"Mark deposit received"}</button>
                <button className="secondary" disabled={working===r.id} onClick={()=>cancelReservation(r.id)}>Cancel reservation</button>
              </div>}

            {r.status==="confirmed"&&
              <div className="reviewActions">
                {!r.rulesAcknowledgedAt&&<button disabled={working===r.id} onClick={()=>review(r.id,"send-rules")}>{working===r.id?"Sending…":"Send / resend rules link"}</button>}
                {r.rulesAcknowledgedAt&&!r.finalPaymentReceivedAt&&<button disabled={working===r.id} onClick={()=>review(r.id,"send-payment-reminder")}>{working===r.id?"Sending…":"Send final payment reminder"}</button>}
                {r.rulesAcknowledgedAt&&!r.finalPaymentReceivedAt&&<CheckInSender booking={r} working={working===r.id} onSend={(instructions)=>review(r.id,"final-payment-received",{instructions})}/>}
                <button className="secondary" disabled={working===r.id} onClick={()=>cancelReservation(r.id)}>{working===r.id?"Working…":"Cancel reservation"}</button>
              </div>}
          </article>
        })}
      </div>
    </section>

    <div className="ownerGrid">
      <section>
        <p className="eyebrow">Availability controls</p>
        <h2>Block dates</h2>
        <p>Add personal stays, maintenance windows, or any period guests should see as unavailable.</p>
        <form onSubmit={add} className="blockForm">
          <label>From<input type="date" name="start" required/></label>
          <label>Through<input type="date" name="end" required/></label>
          <label className="full">Reason<input name="label" placeholder="Family stay, maintenance…"/></label>
          <button className="full">Block these dates</button>
        </form>
      </section>
      <section className="blockList">
        <h2>Upcoming blocked dates</h2>
        {blocks.length===0?<p>No owner blocks yet.</p>:blocks.sort((a,b)=>a.startDate.localeCompare(b.startDate)).map(b=><article key={b.id}><div><strong>{b.label}</strong><span>{new Date(`${b.startDate}T12:00:00`).toLocaleDateString()} – {new Date(`${b.endDate}T12:00:00`).toLocaleDateString()}</span></div><button onClick={()=>remove(b.id)}>Remove</button></article>)}
      </section>
    </div>
  </>;
}


function CheckInSender({booking,working,onSend}:{booking:Booking;working:boolean;onSend:(instructions:string)=>void}){
  const [instructions,setInstructions]=useState(booking.checkInInstructions??"");
  return <div className="checkInSender">
    <textarea rows={5} value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="Paste guest check-in instructions, access code, Wi-Fi details, parking notes, etc."/>
    <button disabled={working||!instructions.trim()} onClick={()=>onSend(instructions.trim())}>{working?"Sending…":"Mark final payment received & send check-in"}</button>
  </div>;
}
