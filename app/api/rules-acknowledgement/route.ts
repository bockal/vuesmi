import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookingRequests } from "../../../db/schema";
import { escapeHtml, sendMail } from "../../email";
import {
  RULES_VERSION,
  RULE_SECTIONS,
  rulesPlainText,
} from "../../house-rules/rules-content";
import { hashRulesSnapshot, hashRulesToken } from "../../rules-token";

function rulesHtml() {
  return RULE_SECTIONS.map((section) => {
    const body =
      "items" in section
        ? `<ul>${section.items
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}</ul>`
        : `<p>${escapeHtml(section.body)}</p>`;
    return `<h3>${escapeHtml(section.number)}. ${escapeHtml(
      section.title
    )}</h3>${body}`;
  }).join("");
}

export async function POST(request: Request) {
  try {
    const p = (await request.json()) as {
      id?: number;
      token?: string;
      legalName?: string;
      agreement?: boolean;
      website?: string;
    };

    if (p.website?.trim()) {
      return Response.json({ status: "received" });
    }

    const id = Number(p.id);
    const legalName = p.legalName?.trim() ?? "";
    const token = p.token ?? "";

    if (
      !Number.isInteger(id) ||
      id < 1 ||
      !token ||
      !p.agreement ||
      legalName.length < 2 ||
      legalName.length > 120
    ) {
      return Response.json(
        { error: "Please complete the acknowledgement form." },
        { status: 400 }
      );
    }

    const db = getDb();
    const [booking] = await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.id, id))
      .limit(1);

    if (
      !booking ||
      booking.status !== "confirmed" ||
      !booking.rulesTokenHash
    ) {
      return Response.json(
        { error: "This acknowledgement link is not valid for an active reservation." },
        { status: 404 }
      );
    }

    const tokenHash = await hashRulesToken(token);
    if (tokenHash !== booking.rulesTokenHash) {
      return Response.json(
        { error: "This acknowledgement link is invalid or has been replaced." },
        { status: 403 }
      );
    }

    if (booking.rulesAcknowledgedAt) {
      return Response.json({ status: "already-signed" });
    }

    const signedAt = new Date().toISOString();
    const snapshotHash = await hashRulesSnapshot(rulesPlainText());

    await db
      .update(bookingRequests)
      .set({
        rulesAcknowledgedAt: signedAt,
        rulesAcknowledgedName: legalName,
        rulesVersion: RULES_VERSION,
        rulesSnapshotHash: snapshotHash,
      })
      .where(eq(bookingRequests.id, booking.id));

    const record = `<p><strong>Signed by:</strong> ${escapeHtml(
      legalName
    )}<br><strong>Reservation:</strong> ${escapeHtml(
      booking.arrival
    )} through ${escapeHtml(
      booking.departure
    )}<br><strong>Signed:</strong> ${escapeHtml(
      signedAt
    )}<br><strong>Rules version:</strong> ${escapeHtml(
      RULES_VERSION
    )}<br><strong>Record hash:</strong> ${escapeHtml(snapshotHash)}</p>`;

    await Promise.allSettled([
      sendMail({
        to: booking.email,
        subject:
          "Your signed House Rules & Water Safety Agreement — The Vues",
        html: `<div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#222"><h2>Your acknowledgement is recorded</h2><p>Thank you, ${escapeHtml(
          legalName
        )}. This email is your copy of the House Rules & Water Safety Agreement you accepted for The Vues at Klinger Lake.</p>${record}${rulesHtml()}</div>`,
      }),
      sendMail({
        to: ["bockal@gmail.com", "bockda@gmail.com"],
        subject: `Vues booking #${booking.id}: house rules signed`,
        html: `<h2>House rules acknowledged</h2>${record}<p><a href="https://vuesmi.com/owner">View the owner portal</a>.</p>`,
      }),
    ]);

    return Response.json({
      status: "signed",
      signedAt,
      version: RULES_VERSION,
    });
  } catch (error) {
    console.error("rules_acknowledgement_failed", error);
    return Response.json(
      { error: "We could not record your acknowledgement. Please try again." },
      { status: 500 }
    );
  }
}
