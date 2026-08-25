import { env } from "cloudflare:workers";

type Mail = { to: string | string[]; subject: string; html: string };

export async function sendMail(message: Mail) {
  const runtime = env as unknown as { RESEND_API_KEY?: string; MAIL_FROM?: string };
  if (!runtime.RESEND_API_KEY || !runtime.MAIL_FROM) return { sent: false, reason: "not_configured" } as const;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${runtime.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: runtime.MAIL_FROM, ...message }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return { sent: true } as const;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}
