import { inArray } from "drizzle-orm";
import { getDb } from "../../db";
import { bookingRequests, dateBlocks } from "../../db/schema";

function icsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function icsDate(value: string) {
  return value.replaceAll("-", "");
}

export async function GET() {
  const db = getDb();
  const [blocks, reserved] = await Promise.all([
    db.select().from(dateBlocks),
    db.select().from(bookingRequests).where(inArray(bookingRequests.status, ["approved", "confirmed"])),
  ]);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const events = [
    ...reserved.map(booking => [
      "BEGIN:VEVENT",
      `UID:booking-${booking.id}@vuesmi.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(booking.arrival)}`,
      `DTEND;VALUE=DATE:${icsDate(booking.departure)}`,
      `SUMMARY:The Vues — ${booking.status === "confirmed" ? "Confirmed" : "Approved"} stay`,
      `DESCRIPTION:${booking.status === "confirmed" ? "Confirmed" : "Approved"} reservation at The Vues at Klinger Lake.`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ].join("\r\n")),
    ...blocks.map(block => [
      "BEGIN:VEVENT",
      `UID:block-${block.id}@vuesmi.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(block.startDate)}`,
      `DTEND;VALUE=DATE:${icsDate(block.endDate)}`,
      `SUMMARY:${icsText(`The Vues — ${block.label}`)}`,
      "DESCRIPTION:Owner-blocked dates at The Vues at Klinger Lake.",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ].join("\r\n")),
  ].join("\r\n");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Vues at Klinger Lake//Owner Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:The Vues at Klinger Lake",
    "X-PUBLISHED-TTL:PT15M",
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
    events,
    "END:VCALENDAR",
    "",
  ].filter(Boolean).join("\r\n");
  return new Response(calendar, { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": "inline; filename=the-vues-calendar.ics", "cache-control": "public, max-age=300" } });
}

