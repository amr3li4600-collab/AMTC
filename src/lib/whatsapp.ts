/**
 * WhatsApp Click-to-Chat URL & Message Builder
 * Generates native wa.me URLs for zero-cost reminders.
 * Opens WhatsApp Web/App directly — $0 API cost.
 */

export type DocumentType = "CEMPN" | "PASSPORT" | "cempn" | "passport";

export interface CandidateData {
  fullName?: string | null;
  name?: string | null;
  phone?: string | null;
  cempnExpirationDate?: Date | string | null;
  cempnStatus?: string | null;
  passportExpirationDate?: Date | string | null;
  passportStatus?: string | null;
  expirationDate?: Date | string | null;
  daysRemaining?: number | null;
  status?: string | null;
}

/**
 * Normalizes a Moroccan phone number to international format.
 * Handles: +212XXX, 0XXX, 212XXX → 212XXX
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Moroccan numbers starting with 0 → replace with 212
  if (cleaned.startsWith("0")) {
    cleaned = "212" + cleaned.substring(1);
  }

  // If no country code, assume Morocco
  if (cleaned.length === 9) {
    cleaned = "212" + cleaned;
  }

  return cleaned;
}

/**
 * Formats a Date object or date string to DD/MM/YYYY for French locale.
 */
export function formatDateFR(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Calculates remaining days until target date.
 */
function getDaysUntil(date: Date | string): number {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generates a context-aware dynamic WhatsApp reminder message for CEMPN or Passport documents.
 * 
 * Rules:
 * 1. For CEMPN Medical (CEMPN):
 *    - EXPIRED (daysRemaining <= 0 or status === 'EXPIRED'):
 *      "Bonjour [Name], votre visite médicale CEMPN est EXPIRÉE depuis le [Date]. Merci de contacter l'administration AMTC en urgence pour programmer votre renouvellement."
 *    - EXPIRING SOON (daysRemaining > 0 and <= 30 days):
 *      "Bonjour [Name], votre visite médicale CEMPN EXPIRE BIENTÔT (dans [X] jours, le [Date]). Merci de contacter l'administration AMTC pour planifier votre visite de renouvellement."
 * 
 * 2. For Passport (PASSPORT):
 *    - EXPIRED (daysRemaining <= 0 or status === 'EXPIRED'):
 *      "Bonjour [Name], votre passeport est EXPIRÉ depuis le [Date]. Merci de contacter l'administration AMTC pour fournir votre nouveau passeport."
 *    - EXPIRING SOON (daysRemaining > 0 and <= 180 days):
 *      "Bonjour [Name], votre passeport EXPIRE BIENTÔT (dans [X] jours, le [Date]). Conformément aux exigences des compagnies aériennes (validité > 6 mois), merci de lancer son renouvellement."
 */
export function generateWhatsAppMessage(
  candidate: CandidateData | string,
  documentType: DocumentType = "CEMPN"
): string {
  const candidateObj: CandidateData = typeof candidate === "string" ? { fullName: candidate } : candidate;
  const name = candidateObj.fullName || candidateObj.name || "Candidat";
  const docType = documentType.toUpperCase() as "CEMPN" | "PASSPORT";

  if (docType === "PASSPORT") {
    const rawDate = candidateObj.passportExpirationDate ?? candidateObj.expirationDate;
    const dateObj = rawDate ? new Date(rawDate) : null;
    const hasValidDate = dateObj ? !isNaN(dateObj.getTime()) : false;

    const daysRemaining = candidateObj.daysRemaining !== undefined && candidateObj.daysRemaining !== null
      ? candidateObj.daysRemaining
      : (hasValidDate && dateObj ? getDaysUntil(dateObj) : null);

    const explicitStatus = candidateObj.status || candidateObj.passportStatus;
    const isExpired = daysRemaining !== null 
      ? daysRemaining <= 0 
      : explicitStatus === "EXPIRED";

    const formattedDate = hasValidDate && dateObj ? formatDateFR(dateObj) : "";

    if (isExpired) {
      return formattedDate
        ? `Bonjour ${name}, votre passeport est EXPIRÉ depuis le ${formattedDate}. Merci de contacter l'administration AMTC pour fournir votre nouveau passeport.`
        : `Bonjour ${name}, votre passeport est EXPIRÉ. Merci de contacter l'administration AMTC pour fournir votre nouveau passeport.`;
    }

    const days = daysRemaining ?? 0;
    return formattedDate
      ? `Bonjour ${name}, votre passeport EXPIRE BIENTÔT (dans ${days} jours, le ${formattedDate}). Conformément aux exigences des compagnies aériennes (validité > 6 mois), merci de lancer son renouvellement.`
      : `Bonjour ${name}, votre passeport EXPIRE BIENTÔT. Conformément aux exigences des compagnies aériennes (validité > 6 mois), merci de lancer son renouvellement.`;
  }

  // Default: CEMPN
  const rawDate = candidateObj.cempnExpirationDate ?? candidateObj.expirationDate;
  const dateObj = rawDate ? new Date(rawDate) : null;
  const hasValidDate = dateObj ? !isNaN(dateObj.getTime()) : false;

  const daysRemaining = candidateObj.daysRemaining !== undefined && candidateObj.daysRemaining !== null
    ? candidateObj.daysRemaining
    : (hasValidDate && dateObj ? getDaysUntil(dateObj) : null);

  const explicitStatus = candidateObj.status || candidateObj.cempnStatus;
  const isExpired = daysRemaining !== null 
    ? daysRemaining <= 0 
    : explicitStatus === "EXPIRED";

  const formattedDate = hasValidDate && dateObj ? formatDateFR(dateObj) : "";

  if (isExpired) {
    return formattedDate
      ? `Bonjour ${name}, votre visite médicale CEMPN est EXPIRÉE depuis le ${formattedDate}. Merci de contacter l'administration AMTC en urgence pour programmer votre renouvellement.`
      : `Bonjour ${name}, votre visite médicale CEMPN est EXPIRÉE. Merci de contacter l'administration AMTC en urgence pour programmer votre renouvellement.`;
  }

  const days = daysRemaining ?? 0;
  return formattedDate
    ? `Bonjour ${name}, votre visite médicale CEMPN EXPIRE BIENTÔT (dans ${days} jours, le ${formattedDate}). Merci de contacter l'administration AMTC pour planifier votre visite de renouvellement.`
    : `Bonjour ${name}, votre visite médicale CEMPN EXPIRE BIENTÔT. Merci de contacter l'administration AMTC pour planifier votre visite de renouvellement.`;
}

/**
 * Generates a WhatsApp click-to-chat URL with dynamic reminder text.
 */
export function generateWhatsAppURL(
  phone: string,
  candidate: CandidateData | string,
  documentType: DocumentType = "CEMPN",
  legacyType?: DocumentType
): string {
  const normalizedPhone = normalizePhone(phone);

  let message = "";
  if (typeof candidate === "string" && typeof documentType === "string" && legacyType) {
    message = generateWhatsAppMessage(
      { fullName: candidate, expirationDate: documentType },
      legacyType
    );
  } else {
    message = generateWhatsAppMessage(candidate, documentType);
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}
