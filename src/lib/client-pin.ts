import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(pin, salt, 32)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  try {
    const [salt, storedHex] = hash.split(":");
    if (!salt || !storedHex) return false;
    const derived = (await scryptAsync(pin, salt, 32)) as Buffer;
    const stored = Buffer.from(storedHex, "hex");
    if (derived.length !== stored.length) return false;
    return timingSafeEqual(derived, stored);
  } catch {
    return false;
  }
}
