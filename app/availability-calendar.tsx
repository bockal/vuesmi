"use client";
import { useEffect,useMemo,useState } from "react";

type Range={id:number;start:string;end:string;label:string;type:string};
const fmt=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const same=(a:Date,b:Date)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
function Month({base,ranges}:{base:Date;ranges:Range[]}){
  const y=base.getFullYear(),m=base.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),cells:Array<Date|null>=Array(first.getDay()).fill(null);
  for(let d=1;d<=days;d++)cells.push(new Date(y,m,d));
  return <div className="month"><h3>{base.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</h3><div className="weekdays">{"SMTWTFS".split("").map((v,i)=><span key={i}>{v}</span>)}</div><div className="days">{cells.map((day,i)=>{
    if(!day)return <span key={`e${i}`}/>;
    const iso=fmt(day),range=ranges.find(r=>iso>=r.start&&iso<r.end),past=day<new Date(new Date().setHours(0,0,0,0));
    return <span key={iso} className={range?`busy ${range.type}`:past?"past":same(day,new Date())?"today":""} title={range?"Unavailable":"Available"} aria-label={`${iso}: ${range?"Unavailable":"Available"}`}>{day.getDate()}</span>;
  })}</div></div>;
}
export default function AvailabilityCalendar(){
  const [ranges,setRanges]=useState<Range[]>([]),[offset,setOffset]=useState(0);
  useEffect(()=>{fetch("/api/availability",{cache:"no-store"}).then(r=>r.json()).then(d=>setRanges(d.ranges??[])).catch(()=>setRanges([]))},[]);
  const months=useMemo(()=>[0,1].map(n=>new Date(new Date().getFullYear(),new Date().getMonth()+offset+n,1)),[offset]);
  return <div className="calendarWrap"><div className="calendarTop"><div><h2>Check availability</h2><p>Crossed-out dates—including confirmed bookings—are unavailable. Available dates may be requested, not instantly booked.</p></div><div className="calendarNav"><button onClick={()=>setOffset(v=>Math.max(0,v-1))} disabled={offset===0} aria-label="Previous months">‹</button><button onClick={()=>setOffset(v=>v+1)} aria-label="Next months">›</button></div></div><div className="months">{months.map(m=><Month key={m.toISOString()} base={m} ranges={ranges}/>)}</div><div className="legend"><span><i/>Available</span><span><i className="unavailable"/>Unavailable / booked</span></div></div>;
}
