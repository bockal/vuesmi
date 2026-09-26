"use client";

import { FormEvent, useState } from "react";

type Props = {
  bookingId: number;
  token: string;
  guestName: string;
  guestEmail: string;
  version: string;
};

export default function AcknowledgementForm({
  bookingId,
  token,
  guestName,
  guestEmail,
  version,
}: Props) {
  const [name, setName] = useState(guestName);
  const [agreed, setAgreed] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!agreed) {
      setError("Please confirm that you have read and agree to the rules.");
      return;
    }

    setState("working");
    const response = await fetch("/api/rules-acknowledgement", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: bookingId,
        token,
        legalName: name,
        agreement: agreed,
        website,
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "We could not record your acknowledgement.");
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="rulesSigned">
        <strong>✓ House rules acknowledged</strong>
        <p>
          Thank you. Your signed acknowledgement has been recorded and a copy
          was emailed to {guestEmail}.
        </p>
      </div>
    );
  }

  return (
    <form className="rulesAckForm" onSubmit={submit}>
      <p className="eyebrow">Final guest step</p>
      <h2>Acknowledge the house rules</h2>
      <p>
        This acknowledgement is tied to your reservation and will be recorded in
        the owner portal. Rules version: {version}.
      </p>

      <label>
        Full legal name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
        />
      </label>

      <label>
        Reservation email
        <input value={guestEmail} readOnly aria-readonly="true" />
      </label>

      <label className="rulesAgreement">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          required
        />
        <span>
          I have read and agree to the House Rules &amp; Water Safety Agreement.
          I intend my typed name above to serve as my electronic signature.
        </span>
      </label>

      <label className="rulesHoneypot" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>

      {error && <p className="formError">{error}</p>}
      <button type="submit" disabled={state === "working"}>
        {state === "working" ? "Recording…" : "Agree & sign"}
      </button>
      <p className="finePrint">
        The secure link in your confirmation email identifies your reservation.
        For privacy, do not forward that link.
      </p>
    </form>
  );
}
