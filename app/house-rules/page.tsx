import type { Metadata } from "next";
import "../listing.css";

export const metadata: Metadata = {
  title: "House Rules & Water Safety | The Vues at Klinger Lake",
  description:
    "House rules, Klinger Lake water safety, boating requirements, pet policies and cancellation terms for guests staying at The Vues at Klinger Lake.",
  alternates: { canonical: "https://vuesmi.com/house-rules" },
  openGraph: {
    title: "House Rules & Water Safety | The Vues at Klinger Lake",
    description:
      "Guest house rules, water safety, boating requirements and stay policies for The Vues at Klinger Lake.",
    type: "website",
    url: "https://vuesmi.com/house-rules",
    images: [
      {
        url: "/property/klinger-house-sketch-bw.webp",
        width: 1536,
        height: 1024,
        alt: "Architectural sketch of The Vues at Klinger Lake",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "House Rules & Water Safety | The Vues at Klinger Lake",
    description:
      "Guest house rules, water safety, boating requirements and stay policies for The Vues at Klinger Lake.",
    images: ["/property/klinger-house-sketch-bw.webp"],
  },
};

export default function HouseRules() {
  return (
    <main className="rulesPage">
      <header className="rulesNav">
        <a className="brand" href="/">THE VUES</a>
        <a href="/#request">Request a stay</a>
      </header>

      <section className="rulesHero">
        <p className="eyebrow">Know before you go</p>
        <h1>House Rules &amp; Water Safety</h1>
        <p>
          These expectations help keep guests safe, protect Klinger Lake and our
          neighbors, and preserve our family cottage for future stays.
        </p>
      </section>

      <div className="rulesGrid">
        <section>
          <span className="ruleNumber">01</span>
          <h2>Your stay</h2>
          <ul>
            <li>Maximum occupancy is 12 registered guests.</li>
            <li>No parties or events without written owner approval.</li>
            <li>Check-in is after 4:00 p.m.; check-out is by 10:00 a.m.</li>
            <li>
              Quiet hours are 10:00 p.m.–8:00 a.m. Please respect our neighbors
              and keep outdoor sound low.
            </li>
            <li>No smoking or vaping indoors.</li>
            <li>
              Park up to two vehicles in the driveway. Additional off-street
              parking is available; please keep access routes clear.
            </li>
            <li>
              Any exception to these policies must be approved by the owners in
              writing in advance.
            </li>
          </ul>
        </section>

        <section>
          <span className="ruleNumber">02</span>
          <h2>Inside the home</h2>
          <ul>
            <li>
              Please treat the home, furnishings, appliances, linens and
              equipment with care.
            </li>
            <li>Promptly report any damage or safety concern.</li>
            <li>No daily housekeeping service is provided.</li>
            <li>
              Before departure, place soiled dishes in the dishwasher and run
              it, dispose of rubbish and recycling as instructed, and leave the
              home secured.
            </li>
            <li>
              Guests are responsible for damage beyond normal wear and tear and
              for unpaid charges associated with their stay.
            </li>
          </ul>
        </section>

        <section>
          <span className="ruleNumber">03</span>
          <h2>Dock, lake &amp; water safety</h2>
          <ul>
            <li>
              An adult must actively supervise children at the shoreline, dock
              and aboard any watercraft.
            </li>
            <li>
              Children and non-swimmers must wear a properly fitted life jacket
              near or on the water. Life jackets are recommended for everyone
              underway.
            </li>
            <li>
              No diving from the dock or shoreline; lake depth and conditions
              can change.
            </li>
            <li>
              Never operate a boat or personal watercraft while impaired.
            </li>
            <li>
              Follow all posted lake rules and applicable Michigan boating laws.
            </li>
            <li>
              <strong>
                Every operator of a motorized watercraft provided with the
                property must meet applicable Michigan boating-safety
                requirements and carry any required certification.
              </strong>
            </li>
            <li>
              Guests use the dock, shoreline, kayaks, pontoon and other
              recreational equipment at their own risk.
            </li>
          </ul>
          <a
            className="ruleCta"
            href="https://www.michigan.gov/dnr/things-to-do/boating/safety-certificate"
            target="_blank"
            rel="noreferrer"
          >
            Michigan boating safety information ↗
          </a>
        </section>

        <section>
          <span className="ruleNumber">04</span>
          <h2>Pets</h2>
          <ul>
            <li>Pets are permitted only with advance owner approval.</li>
            <li>
              Approved pets must be included on the reservation and the
              applicable pet fee paid.
            </li>
            <li>
              Keep pets supervised, leashed outdoors and away from neighboring
              properties.
            </li>
            <li>
              Please clean up all waste and protect furniture, bedding and the
              shoreline.
            </li>
            <li>
              Guests are responsible for pet-related damage or excessive
              cleaning.
            </li>
          </ul>
        </section>

        <section>
          <span className="ruleNumber">05</span>
          <h2>Cancellation</h2>
          <p>
            Cancellations received by email at least seven full days before
            check-in qualify for a full refund. Cancellations received fewer
            than seven full days before check-in are not eligible for a full
            refund.
          </p>
        </section>

        <section>
          <span className="ruleNumber">06</span>
          <h2>Personal property &amp; assumption of risk</h2>
          <p>
            The property is privately owned. Guests are responsible for their
            own belongings and acknowledge the inherent risks associated with
            use of a waterfront property, dock, boats, watercraft and
            recreational equipment.
          </p>
        </section>
      </div>

      <section className="rulesFooter">
        <h2>Questions before your stay?</h2>
        <p>
          Include them with your booking request. We personally review every
          stay and normally respond within 24 hours.
        </p>
        <a href="/#request">Request your dates →</a>
      </section>
    </main>
  );
}
