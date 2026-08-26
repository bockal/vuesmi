import { headers } from "next/headers";

export type ChatGPTUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

const CLOUDFLARE_EMAIL_HEADER = "cf-access-authenticated-user-email";
const OPENAI_EMAIL_HEADER = "oai-authenticated-user-email";
const OPENAI_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const OPENAI_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const email =
    requestHeaders.get(CLOUDFLARE_EMAIL_HEADER) ??
    requestHeaders.get(OPENAI_EMAIL_HEADER);
  if (!email) return null;

  const encodedFullName = requestHeaders.get(OPENAI_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(OPENAI_FULL_NAME_ENCODING_HEADER) ===
      PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
