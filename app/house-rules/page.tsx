import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import "../listing.css";
import { getDb } from "../../db";
import { bookingRequests } from "../../db/schema";
import AcknowledgementForm from "./acknowledgement-form";
import { RULES_VERSION, RULE_SECTIONS } from "./rules-content";
import { hashRulesToken } from "../rules-token";

export const dynamic = "force-dynamic";

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

type SearchParams = Promise<{ id?: string; token?: string }>;

export default async function HouseRules({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const id = Number(params.id);
  const token = params.token ?? "";

  let acknowledgement:
    | {
        id: number;
        name: string;
        email: string;
        signedAt: string | null;
        signedName: string | null;
        version: string | null;
      }
    | null = null;
  let invalidAcknowledgementLink = false;

  if (Number.isInteger(id) && id > 0 && token) {
    const db = getDb();
    const [booking] = await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.id, id))
      .limit(1);

    const tokenHash = await hashRulesToken(token);
    if (
      booking &&
      booking.status === "confirmed" &&
      booking.rulesTokenHash &&
      booking.rulesTokenHash === tokenHash
    ) {
      acknowledgement = {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        signedAt: booking.rulesAcknowledgedAt,
        signedName: booking.rulesAcknowledgedName,
        version: booking.rulesVersion,
      };
    } else {
      invalidAcknowledgementLink = true;
    }
  }

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
        {RULE_SECTIONS.map((section) => (
          <section key={section.number}>
            <span className="ruleNumber">{section.number}</span>
            <h2>{section.title}</h2>
            {"items" in section ? (
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p>{section.body}</p>
            )}

            {section.number === "03" && (
              <a
                className="ruleCta"
                href="https://www.michigan.gov/dnr/things-to-do/boating/safety-certificate"
                target="_blank"
                rel="noreferrer"
              >
                Michigan boating safety information ↗
              </a>
            )}
          </section>
        ))}
      </div>

      {acknowledgement && (
        <section className="rulesAcknowledgement">
          {acknowledgement.signedAt ? (
            <div className="rulesSigned">
              <strong>✓ House rules already acknowledged</strong>
              <p>
                {acknowledgement.signedName ?? acknowledgement.name} signed rules
                version {acknowledgement.version ?? RULES_VERSION} on{" "}
                {new Date(acknowledgement.signedAt).toLocaleString("en-US")}.
              </p>
            </div>
          ) : (
            <AcknowledgementForm
              bookingId={acknowledgement.id}
              token={token}
              guestName={acknowledgement.name}
              guestEmail={acknowledgement.email}
              version={RULES_VERSION}
            />
          )}
        </section>
      )}

      {invalidAcknowledgementLink && (
        <section className="rulesAcknowledgement">
          <div className="rulesSigned rulesLinkError">
            <strong>This acknowledgement link is invalid or has been replaced.</strong>
            <p>Please use the latest confirmation email or contact the owners.</p>
          </div>
        </section>
      )}

      {!acknowledgement && !invalidAcknowledgementLink && (
        <section className="rulesFooter">
          <h2>Questions before your stay?</h2>
          <p>
            Include them with your booking request. We personally review every
            stay and normally respond within 24 hours.
          </p>
          <a href="/#request">Request your dates →</a>
        </section>
      )}
    </main>
  );
}
