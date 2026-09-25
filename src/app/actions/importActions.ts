"use server";

import { prisma } from "@/lib/prisma";
import { calculateBMI, evaluateCEMPNStatus } from "@/lib/utils";
import type { SwimmingStatus, DGACStatus, PlacementStatus, Gender } from "@/generated/prisma/client";
import * as XLSX from "xlsx";

// ─── Types ───────────────────────────────────────────────

interface ImportRow {
  fullName?: string;
  cin?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  armReach?: number;
  hasTattoos?: string;
  tattoosDescription?: string;
  hasScars?: string;
  scarsDescription?: string;
  cempnIssueDate?: string;
  cempnExpirationDate?: string;
  passportNumber?: string;
  passportExpirationDate?: string;
  heldVisas?: string;
  swimmingStatus?: string;
  dgacStatus?: string;
  placementStatus?: string;
  languages?: string; // "French:B2,English:B1,Arabic:C1"
}

interface ImportResult {
  succeeded: number;
  failed: { row: number; reason: string }[];
  total: number;
}

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

// ─── Helpers ─────────────────────────────────────────────

function normalizeRow(rawRow: Record<string, unknown>): ImportRow {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawRow)) {
    if (value === undefined || value === null) continue;
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Full Name
    if (["fullname", "name", "nom", "nomcomplet", "studentname", "student"].includes(cleanKey)) {
      normalized.fullName = String(value);
    }
    // 2. CIN / National ID
    else if (["cin", "nationalid", "idcard", "cne", "id"].includes(cleanKey)) {
      normalized.cin = String(value);
    }
    // 3. Phone
    else if (["phone", "phonenumber", "tel", "telephone", "mobile", "contact", "gsm"].includes(cleanKey)) {
      normalized.phone = String(value);
    }
    // 4. Email
    else if (["email", "mail", "courriel", "adresseemail"].includes(cleanKey)) {
      normalized.email = String(value);
    }
    // 5. Date of Birth
    else if (["dateofbirth", "dob", "birthdate", "datedenaissance", "birth"].includes(cleanKey)) {
      normalized.dateOfBirth = value;
    }
    // 6. Gender
    else if (["gender", "sexe", "sex"].includes(cleanKey)) {
      normalized.gender = String(value);
    }
    // 7. Height
    else if (["height", "taille", "heightcm"].includes(cleanKey)) {
      normalized.height = Number(value);
    }
    // 8. Weight
    else if (["weight", "poids", "weightkg"].includes(cleanKey)) {
      normalized.weight = Number(value);
    }
    // 9. Arm Reach
    else if (["armreach", "reach", "verticalreach", "portee", "porteebras"].includes(cleanKey)) {
      normalized.armReach = Number(value);
    }
    // 10. Tattoos
    else if (["hastattoos", "tattoos", "tatouage", "tatouages", "tattoo"].includes(cleanKey)) {
      normalized.hasTattoos = String(value);
    }
    // 11. Tattoos Description
    else if (["tattoosdescription", "tattoodescription", "tattoodetails", "descriptiontatouage"].includes(cleanKey)) {
      normalized.tattoosDescription = String(value);
    }
    // 12. Scars
    else if (["hasscars", "scars", "cicatrice", "cicatrices", "scar"].includes(cleanKey)) {
      normalized.hasScars = String(value);
    }
    // 13. Scars Description
    else if (["scarsdescription", "scardescription", "scardetails", "descriptioncicatrice"].includes(cleanKey)) {
      normalized.scarsDescription = String(value);
    }
    // 14. CEMPN Issue Date
    else if (["cempnissuedate", "cempnissue", "medicalissuedate", "cempndateemission"].includes(cleanKey)) {
      normalized.cempnIssueDate = value;
    }
    // 15. CEMPN Expiration Date
    else if (["cempnexpirationdate", "cempnexpiration", "cempnexpiry", "cempnexp", "cempnexpirydate", "medicalexpirationdate", "cempndateexpiration"].includes(cleanKey)) {
      normalized.cempnExpirationDate = value;
    }
    // 16. Passport Number
    else if (
      [
        "passportnumber",
        "passport",
        "passportno",
        "passportnum",
        "passportid",
        "passportcode",
        "numpasseport",
        "numeropasseport",
        "numerodepasseport",
        "npasseport",
        "passnum",
        "passno",
        "passeport",
        "passeportnumber",
        "passeportnum",
        "passeportno"
      ].includes(cleanKey) ||
      (cleanKey.startsWith("passport") && (cleanKey.includes("num") || cleanKey.includes("no") || cleanKey.includes("id"))) ||
      (cleanKey.startsWith("passeport") && (cleanKey.includes("num") || cleanKey.includes("no") || cleanKey.includes("id")))
    ) {
      normalized.passportNumber = String(value);
    }
    // 17. Passport Expiration Date
    else if (
      [
        "passportexpirationdate",
        "passportexpiration",
        "passportexpiry",
        "passportexpirydate",
        "passportexpdate",
        "passportexp",
        "passportexpire",
        "passportdate",
        "passeportexpirationdate",
        "passeportexpiration",
        "passeportexpiry",
        "passeportexpirydate",
        "passeportexpdate",
        "passeportexp",
        "passeportdate",
        "dateexpirationpasseport",
        "dateexpiration",
        "dateexpire",
        "datepasseport",
        "datepassport"
      ].includes(cleanKey) ||
      (cleanKey.startsWith("passport") && (cleanKey.includes("exp") || cleanKey.includes("date") || cleanKey.includes("valid"))) ||
      (cleanKey.startsWith("passeport") && (cleanKey.includes("exp") || cleanKey.includes("date") || cleanKey.includes("valid")))
    ) {
      normalized.passportExpirationDate = value;
    }
    // 18. Held Visas
    else if (["heldvisas", "visas", "visa"].includes(cleanKey)) {
      normalized.heldVisas = String(value);
    }
    // 19. Swimming Status
    else if (["swimmingstatus", "swimming", "natation", "testnatation"].includes(cleanKey)) {
      normalized.swimmingStatus = String(value);
    }
    // 20. DGAC Status
    else if (["dgacstatus", "dgac", "cssstatus", "dgaccss", "css"].includes(cleanKey)) {
      normalized.dgacStatus = String(value);
    }
    // 21. Placement Status
    else if (["placementstatus", "placement", "recruitmentstatus", "statutplacement"].includes(cleanKey)) {
      normalized.placementStatus = String(value);
    }
    // 22. Languages
    else if (["languages", "langues", "spokenlanguages", "language"].includes(cleanKey)) {
      normalized.languages = String(value);
    }
    else {
      normalized[key] = value;
    }
  }

  return normalized as ImportRow;
}

function parsePassportNumber(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (!str || ["N/A", "NONE", "NULL", "UNDEFINED", "AUCUN", "PAS DE PASSEPORT", "-", "—"].includes(str.toUpperCase())) {
    return null;
  }
  return str.toUpperCase();
}

function parseDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;

  // If already a Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Handle Excel serial date numbers (e.g. 45000)
  if (typeof value === "number") {
    if (value > 10000 && value < 100000) {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return new Date(date.y, date.m - 1, date.d);
      }
    }
    return null;
  }

  const str = String(value).trim();
  if (!str) return null;

  // Ignore textual non-dates gracefully
  const upper = str.toUpperCase();
  if ([
    "NO EXPIRY",
    "NO EXPIRATION",
    "NO EXPIRY DATE",
    "NO DATE",
    "N/A",
    "NONE",
    "NULL",
    "UNDEFINED",
    "AUCUNE",
    "PAS D'EXPIRATION",
    "SANS DATE",
    "SANS",
    "—",
    "-"
  ].includes(upper)) {
    return null;
  }

  // Check if string represents an Excel serial date number
  const numVal = Number(str);
  if (!isNaN(numVal) && numVal > 10000 && numVal < 100000 && !str.includes("-") && !str.includes("/") && !str.includes(".")) {
    const date = XLSX.SSF.parse_date_code(numVal);
    if (date) {
      return new Date(date.y, date.m - 1, date.d);
    }
  }

  // Try standard ISO (e.g. 2028-10-15 or 2028/10/15 or 2028.10.15)
  const isoMatch = str.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    if (!isNaN(dateObj.getTime())) return dateObj;
  }

  // Try DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
  const parts = str.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [p1, p2, p3] = parts.map(p => p.trim());
    if (p3.length === 4) {
      const n1 = parseInt(p1, 10);
      const n2 = parseInt(p2, 10);
      const n3 = parseInt(p3, 10);
      if (n1 > 0 && n1 <= 31 && n2 > 0 && n2 <= 12) {
        const d = new Date(n3, n2 - 1, n1);
        if (!isNaN(d.getTime())) return d;
      }
    } else if (p1.length === 4) {
      const d = new Date(parseInt(p1, 10), parseInt(p2, 10) - 1, parseInt(p3, 10));
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Fallback try Date constructor
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed;
  } catch {
    return null;
  }

  return null;
}

function parseGender(value: string | undefined): "MALE" | "FEMALE" {
  if (!value) return "MALE";
  const v = value.toUpperCase().trim();
  if (v === "F" || v === "FEMALE" || v === "FEMME" || v === "FÉMININ") return "FEMALE";
  return "MALE";
}

function parseBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const v = value.toString().toUpperCase().trim();
  return ["TRUE", "YES", "OUI", "1", "Y", "O"].includes(v);
}

function parseLanguages(value: string | undefined): { name: string; level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" }[] {
  if (!value) return [];
  // Format: "French:B2,English:B1,Arabic:C1"
  return value.split(",").map((entry) => {
    const [name, level] = entry.split(":").map((s) => s.trim());
    const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const safeLevel = validLevels.includes(level?.toUpperCase()) ? level.toUpperCase() as "A1" | "A2" | "B1" | "B2" | "C1" | "C2" : "A1";
    return { name: name || "Unknown", level: safeLevel };
  }).filter((l) => l.name !== "Unknown" || l.level !== "A1");
}

function validateEnum<T extends string>(value: string | undefined, validValues: T[], defaultValue: T): T {
  if (!value) return defaultValue;
  const v = value.toUpperCase().trim();
  return validValues.includes(v as T) ? (v as T) : defaultValue;
}

// ─── Main Import Action ──────────────────────────────────

function isValidSpreadsheet(buffer: Buffer, fileName: string): boolean {
  if (buffer.length < 4) return false;

  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  
  if (fileName.toLowerCase().endsWith(".xlsx")) {
    return isZip;
  }

  if (fileName.toLowerCase().endsWith(".csv")) {
    const isExe = buffer[0] === 0x4d && buffer[1] === 0x5a; // MZ
    const isElf = buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46; // ELF
    return !isZip && !isExe && !isElf;
  }

  return false;
}

export async function importStudentsFromExcel(formData: FormData): Promise<ImportResult> {
  await requireAdminSession();

  const file = formData.get("file") as File;
  if (!file) {
    return { succeeded: 0, failed: [{ row: 0, reason: "No file provided" }], total: 0 };
  }

  // 1. Strict Size Check (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { succeeded: 0, failed: [{ row: 0, reason: "File exceeds 5MB limit" }], total: 0 };
  }

  // 2. Read and Validate Magic Bytes
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!isValidSpreadsheet(buffer, file.name)) {
    return { succeeded: 0, failed: [{ row: 0, reason: "Invalid file format. Only valid XLSX or CSV files are allowed." }], total: 0 };
  }

  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  } catch {
    return { succeeded: 0, failed: [{ row: 0, reason: "Failed to parse spreadsheet. The file might be corrupted." }], total: 0 };
  }
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

  const result: ImportResult = { succeeded: 0, failed: [], total: rawRows.length };

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 2; // +2 because row 1 is header, data starts at row 2
    const row = normalizeRow(rawRows[i]);

    try {
      // Validate required fields
      if (!row.fullName?.trim()) {
        result.failed.push({ row: rowNumber, reason: "Missing required field: fullName" });
        continue;
      }
      if (!row.cin?.toString().trim()) {
        result.failed.push({ row: rowNumber, reason: "Missing required field: cin" });
        continue;
      }
      if (!row.phone?.toString().trim()) {
        result.failed.push({ row: rowNumber, reason: "Missing required field: phone" });
        continue;
      }

      const height = Number(row.height) || 0;
      const weight = Number(row.weight) || 0;
      const armReach = Number(row.armReach) || 0;

      if (height <= 0 || weight <= 0) {
        result.failed.push({ row: rowNumber, reason: "Height and weight must be positive numbers" });
        continue;
      }

      const dob = parseDate(row.dateOfBirth);
      if (!dob) {
        result.failed.push({ row: rowNumber, reason: "Invalid or missing dateOfBirth" });
        continue;
      }

      const bmi = calculateBMI(height, weight);
      const cempnExpDate = parseDate(row.cempnExpirationDate);
      const cempnStatus = evaluateCEMPNStatus(cempnExpDate);
      const passportExpDate = parseDate(row.passportExpirationDate);
      const passportNumber = parsePassportNumber(row.passportNumber);
      const languages = parseLanguages(row.languages);

      // Check for existing student with same CIN
      const existingStudent = await prisma.student.findUnique({
        where: { cin: row.cin.toString().trim() },
      });

      if (existingStudent) {
        // Update existing record (including passport info) to support re-import
        await prisma.student.update({
          where: { id: existingStudent.id },
          data: {
            isDeleted: false,
            deletedAt: null,
            fullName: row.fullName.trim(),
            phone: row.phone.toString().trim(),
            email: row.email?.trim() || null,
            dateOfBirth: dob,
            gender: parseGender(row.gender) as Gender,
            height,
            weight,
            bmi,
            armReach,
            hasTattoos: parseBoolean(row.hasTattoos),
            tattoosDescription: row.tattoosDescription?.trim() || null,
            hasScars: parseBoolean(row.hasScars),
            scarsDescription: row.scarsDescription?.trim() || null,
            cempnIssueDate: parseDate(row.cempnIssueDate),
            cempnExpirationDate: cempnExpDate,
            cempnStatus,
            passportNumber,
            passportExpirationDate: passportExpDate,
            heldVisas: row.heldVisas?.trim() || null,
            swimmingStatus: validateEnum(row.swimmingStatus, ["PASSED", "PENDING", "FAILED"], "PENDING") as SwimmingStatus,
            dgacStatus: validateEnum(row.dgacStatus, ["ENROLLED", "WRITTEN_PASSED", "PRACTICAL_PASSED", "CERTIFIED"], "ENROLLED") as DGACStatus,
            placementStatus: validateEnum(row.placementStatus, ["APPLIED", "ASSESSMENT_DAY", "FINAL_INTERVIEW", "HIRED"], "APPLIED") as PlacementStatus,
          },
        });
      } else {
        // Create new student
        await prisma.student.create({
          data: {
            fullName: row.fullName.trim(),
            cin: row.cin.toString().trim(),
            phone: row.phone.toString().trim(),
            email: row.email?.trim() || null,
            dateOfBirth: dob,
            gender: parseGender(row.gender) as Gender,
            height,
            weight,
            bmi,
            armReach,
            hasTattoos: parseBoolean(row.hasTattoos),
            tattoosDescription: row.tattoosDescription?.trim() || null,
            hasScars: parseBoolean(row.hasScars),
            scarsDescription: row.scarsDescription?.trim() || null,
            cempnIssueDate: parseDate(row.cempnIssueDate),
            cempnExpirationDate: cempnExpDate,
            cempnStatus,
            passportNumber,
            passportExpirationDate: passportExpDate,
            heldVisas: row.heldVisas?.trim() || null,
            swimmingStatus: validateEnum(row.swimmingStatus, ["PASSED", "PENDING", "FAILED"], "PENDING") as SwimmingStatus,
            dgacStatus: validateEnum(row.dgacStatus, ["ENROLLED", "WRITTEN_PASSED", "PRACTICAL_PASSED", "CERTIFIED"], "ENROLLED") as DGACStatus,
            placementStatus: validateEnum(row.placementStatus, ["APPLIED", "ASSESSMENT_DAY", "FINAL_INTERVIEW", "HIRED"], "APPLIED") as PlacementStatus,
            languages: languages.length > 0
              ? { create: languages }
              : undefined,
          },
        });
      }

      result.succeeded++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      result.failed.push({ row: rowNumber, reason: message });
    }
  }

  // Invalidate Next.js router cache
  revalidatePath('/admin/students');
  revalidatePath('/admin');
  revalidatePath('/admin/eligibility');

  return result;
}

// ─── Download Template ───────────────────────────────────

export async function generateImportTemplate(): Promise<string> {
  const headers = [
    "fullName",
    "cin",
    "phone",
    "email",
    "dateOfBirth",
    "gender",
    "height",
    "weight",
    "armReach",
    "hasTattoos",
    "tattoosDescription",
    "hasScars",
    "scarsDescription",
    "cempnIssueDate",
    "cempnExpirationDate",
    "passportNumber",
    "passportExpirationDate",
    "heldVisas",
    "swimmingStatus",
    "dgacStatus",
    "placementStatus",
    "languages",
  ];

  const sampleRow = {
    fullName: "Fatima Zahra El Idrissi",
    cin: "BK123456",
    phone: "+212612345678",
    email: "fatima@example.com",
    dateOfBirth: "1998-05-15",
    gender: "FEMALE",
    height: 168,
    weight: 58,
    armReach: 214,
    hasTattoos: "FALSE",
    tattoosDescription: "",
    hasScars: "FALSE",
    scarsDescription: "",
    cempnIssueDate: "2026-01-15",
    cempnExpirationDate: "2027-01-15",
    passportNumber: "MA1234567",
    passportExpirationDate: "2030-06-01",
    heldVisas: "Schengen,UAE",
    swimmingStatus: "PASSED",
    dgacStatus: "ENROLLED",
    placementStatus: "APPLIED",
    languages: "French:C1,English:B2,Arabic:C2",
  };

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });

  // Set column widths
  ws["!cols"] = headers.map(() => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(wb, ws, "Students");
  const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  return base64;
}
