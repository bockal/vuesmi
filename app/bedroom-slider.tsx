"use client";

import { useState } from "react";

const bedrooms = [
  { src: "/bedrooms/master-bedroom.jpg", name: "Master bedroom", beds: "1 king bed", sleeps: "Sleeps 2" },
  { src: "/bedrooms/bedroom-2.jpg", name: "Bedroom 2", beds: "1 queen bed", sleeps: "Sleeps 2" },
  { src: "/bedrooms/bedroom-3.jpg", name: "Bedroom 3", beds: "1 queen bed", sleeps: "Sleeps 2" },
  { src: "/bedrooms/bedroom-4.jpg", name: "Bedroom 4", beds: "2 twin beds", sleeps: "Sleeps 2" },
  { src: "/bedrooms/bedroom-5.jpg", name: "Loft bedroom", beds: "2 Serta queen blowup mattresses", sleeps: "Sleeps 4" },
];

export default function BedroomSlider() {
  const [active, setActive] = useState(0);
  const bedroom = bedrooms[active];
  const show = (index: number) => setActive((index + bedrooms.length) % bedrooms.length);

  return <section className="bedroomSection" aria-labelledby="bedrooms-heading">
    <div className="bedroomHeading">
      <div><p className="eyebrow">Room for the whole family</p><h2 id="bedrooms-heading">Where you&apos;ll sleep</h2></div>
      <span>5 bedrooms · Sleeps up to 12</span>
    </div>
    <div className="bedroomSlider">
      <figure>
        <img src={bedroom.src} alt={`${bedroom.name} at The Vues`} />
        <figcaption><strong>{bedroom.name}</strong><span>{bedroom.beds} · {bedroom.sleeps}</span></figcaption>
      </figure>
      <button className="bedroomArrow bedroomPrevious" type="button" onClick={() => show(active - 1)} aria-label="Previous bedroom">‹</button>
      <button className="bedroomArrow bedroomNext" type="button" onClick={() => show(active + 1)} aria-label="Next bedroom">›</button>
    </div>
    <div className="bedroomDots" role="tablist" aria-label="Choose a bedroom">
      {bedrooms.map((item, index) => <button key={item.name} type="button" role="tab" aria-selected={index === active} aria-label={`Show ${item.name}`} onClick={() => show(index)} />)}
    </div>
  </section>;
}
