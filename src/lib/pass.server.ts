import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPass(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password.normalize("NFKC").trim(), salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPass(password: string, stored: string) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password.normalize("NFKC").trim(), salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

export function genMemberPass() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(8);
  let out = "Sg-";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
