"use client";

import { useRef,useState } from "react";
import {trackEvent} from "./analytics";

const rooms = [
  { src: "/bedrooms/master-bedroom.jpg", name: "Master bedroom", details: "1 king bed · Sleeps 2" },
  { src: "/bedrooms/bedroom-2.jpg", name: "Bedroom 2", details: "1 queen bed · Sleeps 2" },
  { src: "/bedrooms/bedroom-3.jpg", name: "Bedroom 3", details: "1 queen bed · Sleeps 2" },
  { src: "/bedrooms/bedroom-4.jpg", name: "Bedroom 4", details: "2 twin beds · Sleeps 2" },
  { src: "/bedrooms/bedroom-5.jpg", name: "Loft bedroom", details: "2 Serta queen blowup mattresses · Sleeps 4" },
  { src: "/property/bathroom-1.jpg", name: "Bathroom 1", details: "Vanity and bathtub" },
  { src: "/property/bathroom-2.jpg", name: "Bathroom 2", details: "Walk-in shower" },
  { src: "/property/open-living-dining.jpg", name: "Open living and dining area", details: "Gather together around the table" },
];

export default function BedroomSlider() {
  const [active, setActive] = useState(0);
  const opened=useRef(false);
  const room = rooms[active];
  const show = (index: number) => {
    if(!opened.current){opened.current=true;trackEvent("photo_gallery_open",{gallery:"bedrooms"})}
    setActive((index + rooms.length) % rooms.length);
  };

  return <section className="bedroomSection" aria-labelledby="bedrooms-heading">
    <div className="bedroomHeading">
      <div><p className="eyebrow">Room for the whole family</p><h2 id="bedrooms-heading">Explore the rooms</h2></div>
      <span>Bedrooms · Bathrooms · Living spaces</span>
    </div>
    <div className="bedroomSlider">
      <figure>
        <img src={room.src} alt={`${room.name} at The Vues on Klinger Lake`} />
        <figcaption><strong>{room.name}</strong><span>{room.details}</span></figcaption>
      </figure>
      <button className="bedroomArrow bedroomPrevious" type="button" onClick={() => show(active - 1)} aria-label="Previous room photo">‹</button>
      <button className="bedroomArrow bedroomNext" type="button" onClick={() => show(active + 1)} aria-label="Next room photo">›</button>
    </div>
    <div className="bedroomDots" role="tablist" aria-label="Choose a room photo">
      {rooms.map((item, index) => <button key={item.name} type="button" role="tab" aria-selected={index === active} aria-label={`Show ${item.name}`} onClick={() => show(index)} />)}
    </div>
  </section>;
}
