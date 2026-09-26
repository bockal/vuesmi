import { env } from "cloudflare:workers";

let schemaReady: Promise<void> | null = null;

const bookingRequestColumns: Array<[string,string]> = [
  ["cancel_token_hash", "text"],
  ["review_sent_at", "text"],
  ["rules_token_hash", "text"],
  ["rules_acknowledged_at", "text"],
  ["rules_acknowledged_name", "text"],
  ["rules_version", "text"],
  ["rules_snapshot_hash", "text"],
];

async function ensureBookingRequestColumnsNow() {
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  const info = await env.DB.prepare("PRAGMA table_info(booking_requests)").all<{name:string}>();
  const existing = new Set((info.results ?? []).map(row => row.name));
  for (const [name,type] of bookingRequestColumns) {
    if (existing.has(name)) continue;
    try {
      await env.DB.prepare(`ALTER TABLE booking_requests ADD COLUMN ${name} ${type}`).run();
      existing.add(name);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/duplicate column name/i.test(message)) throw error;
    }
  }
}

export function ensureBookingRequestSchema() {
  if (!schemaReady) {
    schemaReady = ensureBookingRequestColumnsNow().catch(error => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}
