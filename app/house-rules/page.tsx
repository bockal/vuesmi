import type {Metadata} from "next";
import "../listing.css";

export const metadata:Metadata={
  title:"Pet, Water Safety & House Rules | The Vues at Klinger Lake",
  description:"Guest pet rules, Klinger Lake water safety requirements, check-in details and house rules for The Vues at Klinger Lake.",
  alternates:{canonical:"https://vuesmi.com/house-rules"},
};

export default function HouseRules(){return <main className="rulesPage">
  <header className="rulesNav"><a className="brand" href="/">THE VUES</a><a href="/#request">Request a stay</a></header>
  <section className="rulesHero"><p className="eyebrow">Know before you go</p><h1>Pet, water safety &amp; house rules</h1><p>Simple expectations that help every guest enjoy the lake safely and preserve our family cottage for future stays.</p></section>
  <div className="rulesGrid">
    <section><span className="ruleNumber">01</span><h2>Pet rules</h2><ul><li>One pet is welcome with advance owner approval and the $99 pet fee.</li><li>Include your pet in the booking request; unregistered pets are not permitted.</li><li>Keep pets supervised, leashed outdoors and away from neighboring properties.</li><li>Please clean up all waste and protect furniture, bedding and the shoreline.</li><li>Guests are responsible for pet-related damage or excessive cleaning.</li></ul></section>
    <section><span className="ruleNumber">02</span><h2>Water safety</h2><ul><li>Children and non-swimmers must wear a properly fitted life jacket near or on the water. Life jackets are recommended for everyone underway.</li><li>An adult must actively supervise children at the shoreline, dock and aboard any watercraft.</li><li>No diving from the dock or shoreline; lake depth and conditions can change.</li><li>Never operate a boat or personal watercraft while impaired, and follow posted lake and Michigan boating rules.</li><li><strong>The Vues requires every operator of a motorized watercraft to hold a valid Michigan Boating Safety Certificate.</strong> Michigan calls this credential a safety certificate rather than a boating license.</li></ul><a className="ruleCta" href="https://www.michigan.gov/dnr/things-to-do/boating/safety-certificate" target="_blank" rel="noreferrer">Get a Michigan boating certificate online ↗</a><p className="finePrint">Complete an approved course and carry proof of certification while operating the watercraft.</p></section>
    <section><span className="ruleNumber">03</span><h2>House rules</h2><ul><li>Maximum occupancy is 12 registered guests. No parties or events without written owner approval.</li><li>Check-in is after 4:00 p.m.; check-out is by 10:00 a.m.</li><li>Quiet hours are 10:00 p.m.–8:00 a.m. Please respect our neighbors and keep outdoor sound low.</li><li>No smoking or vaping indoors.</li><li>Park up to two vehicles in the driveway; use the available off-street parking for additional vehicles and keep access routes clear.</li><li>Use the home, dock and equipment with care, and promptly report damage or safety concerns.</li></ul></section>
  </div>
  <section className="rulesFooter"><h2>Questions before your stay?</h2><p>Include them with your booking request. The owners normally respond within 24 hours.</p><a href="/#request">Request your dates →</a></section>
</main>}

