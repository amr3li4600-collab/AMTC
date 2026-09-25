import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate BMI from height (cm) and weight (kg).
 * Formula: weight / (height_m)²
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Evaluate CEMPN certificate status based on expiration date.
 * - EXPIRED: past expiration
 * - EXPIRING_SOON: within 30 days of expiration
 * - VALID: more than 30 days until expiration
 */
export function evaluateCEMPNStatus(expirationDate: Date | null): "EXPIRED" | "EXPIRING_SOON" | "VALID" {
  if (!expirationDate) return "EXPIRED";

  const now = new Date();
  const expDate = new Date(expirationDate);
  const diffMs = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "EXPIRED";
  if (diffDays <= 30) return "EXPIRING_SOON";
  return "VALID";
}

/**
 * Evaluate Passport status based on expiration date.
 * - EXPIRED: past expiration (<= 0 days)
 * - EXPIRING_SOON: within 180 days (6 months) of expiration
 * - VALID: more than 180 days until expiration
 */
export function evaluatePassportStatus(
  expirationDate: Date | string | null | undefined
): "EXPIRED" | "EXPIRING_SOON" | "VALID" {
  if (!expirationDate) return "EXPIRED";

  const now = new Date();
  const expDate = new Date(expirationDate);
  if (isNaN(expDate.getTime())) return "EXPIRED";

  const diffMs = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "EXPIRED";
  if (diffDays <= 180) return "EXPIRING_SOON";
  return "VALID";
}

/**
 * Calculate days until a date.
 * Returns negative if the date is in the past.
 */
export function daysUntil(date: Date): number {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate age from date of birth.
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format a number with locale-aware formatting.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Status badge color mapping.
 */
export function getStatusColor(
  status: string
): { bg: string; text: string; dot: string } {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    VALID: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    EXPIRING_SOON: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    EXPIRED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    PASSED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    FAILED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    ENROLLED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    WRITTEN_PASSED: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
    PRACTICAL_PASSED: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
    CERTIFIED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    APPLIED: { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-500" },
    ASSESSMENT_DAY: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
    FINAL_INTERVIEW: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    HIRED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  };
  return colors[status] ?? { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" };
}
