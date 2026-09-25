"use server";

import { createSessionToken, setSessionCookie, clearSessionCookie, timingSafeEqual } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface RateLimitRecord {
  attempts: number;
  lastAttempt: number;
  lockUntil?: number;
}

// In-memory rate limiting map for brute force mitigation
const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout

function getClientIdentifier(email: string): string {
  try {
    const forwarded = headers().get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "local";
    return `${ip}:${email}`;
  } catch {
    return email;
  }
}

function checkRateLimit(key: string): { isLocked: boolean; remainingSeconds: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) {
    return { isLocked: false, remainingSeconds: 0 };
  }

  if (record.lockUntil && record.lockUntil > now) {
    return {
      isLocked: true,
      remainingSeconds: Math.ceil((record.lockUntil - now) / 1000),
    };
  }

  // Clear stale attempts after lockout or timeout
  if (now - record.lastAttempt > LOCKOUT_DURATION_MS) {
    loginAttempts.delete(key);
    return { isLocked: false, remainingSeconds: 0 };
  }

  return { isLocked: false, remainingSeconds: 0 };
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const record = loginAttempts.get(key) || { attempts: 0, lastAttempt: now };
  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockUntil = now + LOCKOUT_DURATION_MS;
  }

  loginAttempts.set(key, record);
}

function clearRateLimit(key: string) {
  loginAttempts.delete(key);
}

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const normalizedInputEmail = email.trim().replace(/\.+$/, "").toLowerCase();
  const rateLimitKey = getClientIdentifier(normalizedInputEmail);

  // 1. Check rate limit
  const { isLocked, remainingSeconds } = checkRateLimit(rateLimitKey);
  if (isLocked) {
    const minutes = Math.ceil(remainingSeconds / 60);
    return {
      error: `Security Alert: Too many failed login attempts. Access temporarily locked for ${minutes} minute${minutes > 1 ? "s" : ""}. Please try again later.`,
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().replace(/\.+$/, "");
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    console.error("Admin credentials are not configured in environment variables.");
    return { error: "Authentication is not configured on this server." };
  }

  const normalizedAdminEmail = adminEmail.toLowerCase();

  // 2. Timing-safe credential comparison
  const isEmailValid = timingSafeEqual(normalizedInputEmail, normalizedAdminEmail);
  const isPasswordValid = timingSafeEqual(password.trim(), adminPassword);

  if (!isEmailValid || !isPasswordValid) {
    recordFailedAttempt(rateLimitKey);
    // Anti-automation small artificial delay (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { error: "Invalid email or password." };
  }

  // 3. Clear failed attempts upon successful login
  clearRateLimit(rateLimitKey);

  // 4. Create session and set cookie
  const token = await createSessionToken(email);
  setSessionCookie(token);

  redirect("/admin");
}

export async function logout() {
  clearSessionCookie();
  redirect("/admin/login");
}
