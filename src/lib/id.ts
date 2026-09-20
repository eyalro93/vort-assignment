import { randomBytes } from "crypto";

const URL_ALPHABET =
  "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/l/i
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // uppercase-only, no 0/O/1/I

function randomString(length: number, alphabet: string): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/** Short id used in shareable URLs (/r/[token]/...). */
export function createToken(): string {
  return randomString(10, URL_ALPHABET);
}

/** Human-typeable code for the self-serve deletion flow: XXXX-XXXX. */
export function createDeleteCode(): string {
  return `${randomString(4, CODE_ALPHABET)}-${randomString(4, CODE_ALPHABET)}`;
}

export function normalizeDeleteCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
