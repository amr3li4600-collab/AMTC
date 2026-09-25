import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "amtc_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// Fallback secret for local development only if env var is missing
const DEFAULT_SECRET = "fallback_insecure_secret_do_not_use_in_production";

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SECURITY ERROR: ADMIN_SESSION_SECRET environment variable must be configured in production.");
    }
    return new TextEncoder().encode(DEFAULT_SECRET);
  }
  if (secret.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error("SECURITY ERROR: ADMIN_SESSION_SECRET must be at least 32 characters long in production.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Timing-safe string comparison to prevent side-channel timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = new TextEncoder().encode(a);
  const bufB = new TextEncoder().encode(b);
  
  if (bufA.byteLength !== bufB.byteLength) {
    return false;
  }
  
  let mismatch = 0;
  for (let i = 0; i < bufA.byteLength; i++) {
    mismatch |= bufA[i] ^ bufB[i];
  }
  return mismatch === 0;
}

// Convert ArrayBuffer to Base64URL string
function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert Base64URL string to Uint8Array
function base64UrlToBuffer(base64Url: string): Uint8Array {
  const base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Pad with '=' to make length a multiple of 4
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function createSessionToken(email: string): Promise<string> {
  const payload = {
    email,
    role: "ADMIN",
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    getSecretKey() as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign) as unknown as BufferSource
  );

  const signatureB64 = bufferToBase64Url(signature);
  return `${dataToSign}.${signatureB64}`;
}

export async function verifySessionToken(token: string): Promise<{ email: string; role: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
      "raw",
      getSecretKey() as unknown as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = base64UrlToBuffer(signatureB64);
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer as unknown as BufferSource,
      new TextEncoder().encode(dataToSign) as unknown as BufferSource
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlToBuffer(payloadB64));
    const payload = JSON.parse(payloadJson);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    return {
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export function getSessionCookie(): string | undefined {
  return cookies().get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Server-side guard to verify that an incoming request has a valid admin session
 */
export async function requireAdminSession(): Promise<{ email: string; role: string }> {
  const token = getSessionCookie();
  if (!token) {
    throw new Error("Unauthorized: Admin session required.");
  }
  const session = await verifySessionToken(token);
  if (!session) {
    throw new Error("Unauthorized: Invalid or expired session.");
  }
  return session;
}
