const encoder = new TextEncoder();
const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export async function createRulesToken() {
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
  return { token, hash: await hashRulesToken(token) };
}

export async function hashRulesToken(token: string) {
  return b64url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(token)))
  );
}

export async function hashRulesSnapshot(snapshot: string) {
  return b64url(
    new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(snapshot)))
  );
}
