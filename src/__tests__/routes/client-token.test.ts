import { createCipheriv, randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

const TEST_SECRET = "a".repeat(64); // 32 bytes of 0xaa

beforeAll(() => {
  process.env.CLIENT_TOKEN_SECRET = TEST_SECRET;
});

// Import after env is set so getKey() can read the secret on first call.
async function loadModule() {
  return await import("@/lib/client-token");
}

// Encrypt an arbitrary plaintext payload with the same AES-256-GCM layout used
// by the production encoder. Used to forge legacy `userId:expiresAt` tokens.
function encryptRaw(payload: string): string {
  const key = Buffer.from(TEST_SECRET, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(payload, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

describe("client-token", () => {
  it("round-trips a userId through encrypt/decrypt", async () => {
    const { encryptUserId, decryptUserId } = await loadModule();
    const token = encryptUserId("user_abc123");
    expect(decryptUserId(token)).toBe("user_abc123");
  });

  it("produces a different ciphertext on each call (random IV)", async () => {
    const { encryptUserId } = await loadModule();
    const a = encryptUserId("user_abc123");
    const b = encryptUserId("user_abc123");
    expect(a).not.toBe(b);
  });

  it("decodes legacy `userId:expiresAt` tokens regardless of the expiry", async () => {
    const { decryptUserId } = await loadModule();
    const longExpired = encryptRaw("user_legacy:1");
    const farFuture = encryptRaw(
      `user_future:${Date.now() + 365 * 24 * 60 * 60 * 1000}`,
    );
    expect(decryptUserId(longExpired)).toBe("user_legacy");
    expect(decryptUserId(farFuture)).toBe("user_future");
  });

  it("returns null for a tampered token", async () => {
    const { encryptUserId, decryptUserId } = await loadModule();
    const token = encryptUserId("user_abc123");
    // Flip the last character to break the GCM auth tag.
    const tampered = `${token.slice(0, -1)}${token.at(-1) === "A" ? "B" : "A"}`;
    expect(decryptUserId(tampered)).toBeNull();
  });

  it("returns null for garbage input", async () => {
    const { decryptUserId } = await loadModule();
    expect(decryptUserId("not-a-real-token")).toBeNull();
    expect(decryptUserId("")).toBeNull();
  });
});
