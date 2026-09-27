"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { calculateQuote, MAX_GUESTS, MIN_NIGHTS, money } from "./pricing";
import { trackEvent } from "./analytics";
import TrackedLink from "./tracked-link";

type Range={id:number;start:string;end:string;label:string;type:string};
const iso=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayIso=()=>iso(new Date());
const addDays=(value:string,days:number)=>{const [y,m,d]=value.split("-").map(Number);return iso(new Date(y,m-1,d+days))};
const unavailable=(value:string,ranges:Range[])=>ranges.some(r=>value>=r.start&&value<r.end);
const stayUnavailable=(arrival:string,departure:string,ranges:Range[])=>{
  if(!arrival||!departure||departure<=arrival)return false;
  for(let d=arrival;d<departure;d=addDays(d,1))if(unavailable(d,ranges))return true;
  return false;
};

export default function BookingForm() {
  const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle");
  const [message,setMessage]=useState("");
  const [arrival,setArrival]=useState(""),[departure,setDeparture]=useState("");
  const [ranges,setRanges]=useState<Range[]>([]),[availabilityLoaded,setAvailabilityLoaded]=useState(false);
  const [adults,setAdults]=useState(1),[children,setChildren]=useState(0);
  const [boatRental,setBoatRental]=useState(false),[pet,setPet]=useState(false);
  const quote=useMemo(()=>calculateQuote(arrival,departure,adults,children,boatRental,pet?1:0),[arrival,departure,adults,children,boatRental,pet]);
  const conflict=useMemo(()=>stayUnavailable(arrival,departure,ranges),[arrival,departure,ranges]);
  const started=useRef(false),displayedQuote=useRef("");
  const startForm=()=>{if(started.current)return;started.current=true;trackEvent("booking_start",{form_name:"booking_request"});trackEvent("form_started",{form_name:"booking_request"})};
  useEffect(()=>{fetch("/api/availability",{cache:"no-store"}).then(r=>r.json()).then(d=>setRanges(d.ranges??[])).catch(()=>setRanges([])).finally(()=>setAvailabilityLoaded(true))},[]);
  useEffect(()=>{if(quote.nights<MIN_NIGHTS||quote.guests>MAX_GUESTS||conflict)return;const key=`${arrival}:${departure}:${adults}:${children}:${boatRental}:${pet}`;if(displayedQuote.current===key)return;displayedQuote.current=key;trackEvent("quote_displayed",{currency:"USD",value:quote.totalCents/100,nights:quote.nights,guests:quote.guests})},[quote,arrival,departure,adults,children,boatRental,pet,conflict]);
  function changeArrival(value:string){setArrival(value);setMessage("");if(departure&&departure<=value)setDeparture("")}
  function changeDeparture(value:string){setDeparture(value);setMessage("")}
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(conflict){setMessage("Those dates include an unavailable night. Please choose another stay.");setState("error");return;}setState("sending");const form=new FormData(event.currentTarget);const response=await fetch("/api/booking-requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(form.entries()))});const result=await response.json() as {id?:number;error?:string};if(!response.ok){setMessage(result.error??"Please try again.");setState("error");return;}trackEvent("request_submitted",{currency:"USD",value:quote.totalCents/100,nights:quote.nights,guests:quote.guests,request_id:result.id??0});setState("sent");}
  if(state==="sent")return <div className="success"><span>✓</span><h3>Your request is in.</h3><p>We emailed your quote and sent it to the owners for review. Nothing has been charged. If approved, you’ll receive confirmed dates, the amount due and your choice of payment options.</p><button onClick={()=>setState("idle")}>Request different dates</button></div>;
  return <form className="bookingForm" onSubmit={submit} onFocusCapture={startForm}>
    <div className="two"><label>Arrival<input name="arrival" type="date" min={todayIso()} value={arrival} onChange={e=>changeArrival(e.target.value)} required/></label><label>Departure<input name="departure" type="date" min={arrival?addDays(arrival,MIN_NIGHTS):todayIso()} value={departure} onChange={e=>changeDeparture(e.target.value)} required/></label></div>
    <p className="fine">{availabilityLoaded?"Booked and owner-blocked dates are checked automatically when you choose your stay.":"Checking current availability…"}</p>
    {conflict&&<p className="formError">Part of that stay is unavailable. Please choose different arrival or departure dates.</p>}
    <div className="two"><label>Adults (13+)<input name="adults" type="number" min="1" max={MAX_GUESTS} value={adults} onChange={e=>setAdults(Number(e.target.value))} required/></label><label>Children (ages 0–12)<input name="children" type="number" min="0" max={MAX_GUESTS-1} value={children} onChange={e=>setChildren(Number(e.target.value))} required/></label></div>
    <label className="check addOn"><input name="boatRental" type="checkbox" value="yes" checked={boatRental} onChange={e=>setBoatRental(e.target.checked)}/><span><strong>Add pontoon / jet-ski rental</strong><small>$100 per day · Kayaks are included at no charge</small></span></label>
    <label className="check addOn"><input name="pets" type="checkbox" value="1" checked={pet} onChange={e=>setPet(e.target.checked)}/><span><strong>Bringing a pet</strong><small>$99 flat pet fee per stay</small></span></label>
    {!conflict&&quote.nights>=MIN_NIGHTS&&quote.guests<=MAX_GUESTS&&<div className="quoteBox"><div><span>Lodging · {quote.nights} nights</span><strong>{money(quote.lodgingCents)}</strong></div><div><span>Cleaning fee</span><strong>{money(quote.cleaningCents)}</strong></div>{boatRental&&<div><span>Boat rental · {quote.nights} days</span><strong>{money(quote.boatRentalCents)}</strong></div>}{pet&&<div><span>Flat pet fee</span><strong>{money(quote.petCents)}</strong></div>}<div><span>Michigan lodging tax (6%)</span><strong>{money(quote.taxCents)}</strong></div><div className="quoteTotal"><span>Estimated total</span><strong>{money(quote.totalCents)}</strong></div><small>Estimate based on the stay details entered above. Final approval is required.</small></div>}
    <label>Your name<input name="name" autoComplete="name" required/></label><div className="two"><label>Email<input name="email" type="email" autoComplete="email" required/></label><label>Phone<input name="phone" type="tel" autoComplete="tel" required/></label></div><label>Tell us about your stay<textarea name="note" rows={4} placeholder="What brings you to Klinger Lake?"/></label>
    <div className="cancellationPolicy"><strong>Flexible 7-day cancellation</strong><p>Email your cancellation request to <TrackedLink href="mailto:bockal@gmail.com" eventName="email_host" eventParameters={{link_location:"booking_form"}}>bockal@gmail.com</TrackedLink> at least seven full days before check-in for a full refund. Requests received fewer than seven days before check-in are not eligible for a full refund.</p></div>
    <label className="check"><input name="agreement" type="checkbox" value="yes" required/><span>I understand this is a request, not a confirmed reservation, and I have reviewed the cancellation policy.</span></label>{state==="error"&&message&&<p className="formError">{message}</p>}<button className="submit" disabled={state==="sending"||conflict||!availabilityLoaded}>{state==="sending"?"Sending…":"Request these dates"}</button>
    <p className="fine">Two-night minimum · 12 guests maximum · Final pricing subject to owner approval.</p><div className="paymentOptions" aria-label="Payment options available after approval"><span className="zelleLogo">Zelle<sup>®</sup></span><a className="venmoLogo" href="https://venmo.com/u/KlingerLake68109" target="_blank" rel="noreferrer">Venmo</a></div><p className="paymentCaption">Zelle or Venmo details are provided after your dates are approved.</p>
  </form>;
}
