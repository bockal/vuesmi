import { env } from "cloudflare:workers";

export type Mail = { to: string | string[]; subject: string; html: string };
export type MailRuntime = { RESEND_API_KEY?: string; MAIL_FROM?: string };

const brandedHeader = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:14px 0 24px;background:#ffffff">
        <a href="https://vuesmi.com" style="text-decoration:none">
          <img src="https://vuesmi.com/vues-farm-bell.svg" width="112" height="112" alt="Gold Purdue bell and yoke for The Vues at Klinger Lake" style="display:block;width:112px;height:112px;margin:0 auto;border:0;background:#ffffff">
        </a>
      </td>
    </tr>
  </table>`;

const brandedFooter = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #dfd8c8">
    <tr>
      <td align="center" style="padding:24px 12px 8px">
        <a href="https://vuesmi.com" style="text-decoration:none">
          <img src="https://vuesmi.com/property/klinger-house-sketch-bw.webp" width="520" alt="Lakeside sketch of The Vues at Klinger Lake" style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 18px;border:0">
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
      ${brandedHeader}
      ${content}
      ${brandedFooter}
    </div>
  </div>`;
}

function brandSubject(subject: string) {
  if (subject.includes("The Vues at Klinger Lake")) return subject;
  return subject
    .replace("Paid and confirmed: Vues booking", "Paid and confirmed: The Vues at Klinger Lake booking")
    .replace("New Vues request", "New request for The Vues at Klinger Lake")
    .replace("Vues booking", "The Vues at Klinger Lake booking")
    .replace("Vues request", "The Vues at Klinger Lake request")
    .replaceAll("The Vues", "The Vues at Klinger Lake");
}

export async function sendMail(message: Mail) {
  return sendMailWithRuntime(message,env as unknown as MailRuntime);
}

export async function sendMailWithRuntime(message:Mail,runtime:MailRuntime){
  if (!runtime.RESEND_API_KEY || !runtime.MAIL_FROM) return { sent: false, reason: "not_configured" } as const;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${runtime.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: runtime.MAIL_FROM, ...message, subject: brandSubject(message.subject), html: brandEmail(message.html) }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return { sent: true } as const;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}

