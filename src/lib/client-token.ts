import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

function getKey(): Buffer {
  const hex = process.env.CLIENT_TOKEN_SECRET;
  if (!hex) throw new Error("CLIENT_TOKEN_SECRET env var is not set");
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 32) throw new Error("CLIENT_TOKEN_SECRET must be 64 hex chars (32 bytes)");
  return buf;
}

export function encryptUserId(userId: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(userId, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptUserId(token: string): string | null {
  try {
    const key = getKey();
    const combined = Buffer.from(token, "base64url");
    if (combined.length < 29) return null; // iv(12) + tag(16) + min 1 byte
    const iv = combined.subarray(0, 12);
    const tag = combined.subarray(12, 28);
    const encrypted = combined.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
