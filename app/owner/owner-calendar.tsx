"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Block={id:number;startDate:string;endDate:string;label:string};
type Booking={id:number;arrival:string;departure:string;adults:number;children:number;boatRental:boolean;name:string;email:string;phone:string;note:string;status:string;quoteCents:number|null};
type Action="approve"|"decline"|"confirm"|"cancel";
const usd=(c:number|null)=>c==null?"Quote pending":new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(c/100);

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
  async function remove(id:number){await fetch(`/owner/api/blocks?id=${id}`,{method:"DELETE"});load()}
  async function review(id:number,action:Action){
    setWorking(id);setError("");
    const r=await fetch("/owner/api/requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,action})});
    const d=await r.json() as {error?:string};
    if(!r.ok)setError(d.error??"Could not update request");
    await load();setWorking(null);
  }
  async function cancelReservation(id:number){
    if(!window.confirm("Cancel this reservation and release its dates on the calendar?"))return;
    await review(id,"cancel");
  }

  return <>
    <section className="requestPanel">
      <div><p className="eyebrow">Request inbox</p><h1>Booking requests</h1><p>Approve a request to email the quote and Zelle/Venmo options. Mark the deposit received to confirm the stay and block its dates.</p></div>
      {error&&<p className="formError">{error}</p>}
      <div className="requestList">{requests.length===0?<p>No requests yet.</p>:requests.map(r=><article className="requestCard" key={r.id}>
        <div className="requestDates"><strong>{r.arrival} → {r.departure}</strong><span className={`status status-${r.status}`}>{r.status}</span></div>
        <h3>{r.name}</h3><p>{r.adults+r.children} guests · {usd(r.quoteCents)}{r.boatRental?" · Boat rental requested":""}</p>
        <p><a href={`mailto:${r.email}`}>{r.email}</a> · <a href={`tel:${r.phone}`}>{r.phone}</a></p>{r.note&&<p className="requestNote">“{r.note}”</p>}
        {r.status==="requested"&&<div className="reviewActions"><button disabled={working===r.id} onClick={()=>review(r.id,"approve")}>{working===r.id?"Working…":"Approve & email payment options"}</button><button className="secondary" disabled={working===r.id} onClick={()=>review(r.id,"decline")}>Decline</button></div>}
        {r.status==="approved"&&<div className="reviewActions"><button disabled={working===r.id} onClick={()=>review(r.id,"confirm")}>{working===r.id?"Working…":"Mark deposit received"}</button><button className="secondary" disabled={working===r.id} onClick={()=>cancelReservation(r.id)}>Cancel reservation</button></div>}
        {r.status==="confirmed"&&<div className="reviewActions"><button className="secondary" disabled={working===r.id} onClick={()=>cancelReservation(r.id)}>{working===r.id?"Working…":"Cancel reservation"}</button></div>}
      </article>)}</div>
    </section>
    <div className="ownerGrid">
      <section><p className="eyebrow">Availability controls</p><h2>Block dates</h2><p>Add personal stays, maintenance windows, or any period guests should see as unavailable.</p><form onSubmit={add} className="blockForm"><label>From<input type="date" name="start" required/></label><label>Through<input type="date" name="end" required/></label><label className="full">Reason<input name="label" placeholder="Family stay, maintenance…"/></label><button className="full">Block these dates</button></form></section>
      <section className="blockList"><h2>Upcoming blocked dates</h2>{blocks.length===0?<p>No owner blocks yet.</p>:blocks.sort((a,b)=>a.startDate.localeCompare(b.startDate)).map(b=><article key={b.id}><div><strong>{b.label}</strong><span>{new Date(`${b.startDate}T12:00:00`).toLocaleDateString()} – {new Date(`${b.endDate}T12:00:00`).toLocaleDateString()}</span></div><button onClick={()=>remove(b.id)}>Remove</button></article>)}</section>
    </div>
  </>;
}

