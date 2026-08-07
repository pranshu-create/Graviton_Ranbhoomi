export async function verifyTurnstileToken(token, ip) {
  // Turnstile is not integrated on the client-side yet, so we bypass verification for now.
  return true;
}
