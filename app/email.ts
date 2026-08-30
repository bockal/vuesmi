import { env } from "cloudflare:workers";

type Mail = { to: string | string[]; subject: string; html: string };

const brandedFooter = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #dfd8c8">
    <tr>
      <td align="center" style="padding:24px 12px 8px">
        <a href="https://vuesmi.com" style="text-decoration:none">
          <img src="https://vuesmi.com/vues-farm-bell-192.png" width="88" height="88" alt="The Vues at Klinger Lake — Purdue bell and yoke" style="display:block;width:88px;height:88px;margin:0 auto 12px;border:0">
        </a>
        <p style="margin:0;color:#173f3a;font-family:Georgia,Times New Roman,serif;font-size:18px;font-weight:bold;line-height:1.35">The Vues at Klinger Lake</p>
        <p style="margin:5px 0 0;color:#6b6559;font-family:Arial,sans-serif;font-size:12px;line-height:1.5">
          <a href="https://vuesmi.com" style="color:#6b6559;text-decoration:underline">vuesmi.com</a>
        </p>
      </td>
    </tr>
  </table>`;

function brandEmail(content: string) {
  return `<div style="margin:0;background:#f6f3eb;padding:24px 12px">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6dfd0;border-radius:12px;padding:28px;color:#222222;font-family:Arial,sans-serif;line-height:1.55">
      ${content}
      ${brandedFooter}
    </div>
  </div>`;
}

export async function sendMail(message: Mail) {
  const runtime = env as unknown as { RESEND_API_KEY?: string; MAIL_FROM?: string };
  if (!runtime.RESEND_API_KEY || !runtime.MAIL_FROM) return { sent: false, reason: "not_configured" } as const;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${runtime.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: runtime.MAIL_FROM, ...message, html: brandEmail(message.html) }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return { sent: true } as const;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}

