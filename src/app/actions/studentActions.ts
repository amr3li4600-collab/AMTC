"use server";

import { prisma } from "@/lib/prisma";
import { calculateBMI, evaluateCEMPNStatus, daysUntil } from "@/lib/utils";
import type { Student, Language, CEFRLevel, Gender, SwimmingStatus, DGACStatus, PlacementStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

// ─── Types ───────────────────────────────────────────────

export type StudentWithLanguages = Student & { languages: Language[] };

export interface CreateStudentInput {
  fullName: string;
  cin: string;
  phone: string;
  email?: string;
  dateOfBirth: string; // ISO string
  gender: Gender;
  photoUrl?: string;
  height: number;
  weight: number;
  armReach: number;
  hasTattoos?: boolean;
  tattoosDescription?: string;
  hasScars?: boolean;
  scarsDescription?: string;
  cempnIssueDate?: string;
  cempnExpirationDate?: string;
  passportNumber?: string;
  passportExpirationDate?: string;
  heldVisas?: string;
  swimmingStatus?: SwimmingStatus;
  dgacStatus?: DGACStatus;
  placementStatus?: PlacementStatus;
  languages?: { name: string; level: CEFRLevel }[];
}

// ─── CREATE ──────────────────────────────────────────────

export async function createStudent(input: CreateStudentInput) {
  await requireAdminSession();
  const bmi = calculateBMI(input.height, input.weight);
  const cempnStatus = evaluateCEMPNStatus(
    input.cempnExpirationDate ? new Date(input.cempnExpirationDate) : null
  );

  const student = await prisma.student.create({
    data: {
      fullName: input.fullName,
      cin: input.cin,
      phone: input.phone,
      email: input.email || null,
      dateOfBirth: new Date(input.dateOfBirth),
      gender: input.gender,
      photoUrl: input.photoUrl || null,
      height: input.height,
      weight: input.weight,
      bmi,
      armReach: input.armReach,
      hasTattoos: input.hasTattoos ?? false,
      tattoosDescription: input.tattoosDescription || null,
      hasScars: input.hasScars ?? false,
      scarsDescription: input.scarsDescription || null,
      cempnIssueDate: input.cempnIssueDate ? new Date(input.cempnIssueDate) : null,
      cempnExpirationDate: input.cempnExpirationDate ? new Date(input.cempnExpirationDate) : null,
      cempnStatus,
      passportNumber: input.passportNumber || null,
      passportExpirationDate: input.passportExpirationDate ? new Date(input.passportExpirationDate) : null,
      heldVisas: input.heldVisas || null,
      swimmingStatus: input.swimmingStatus ?? "PENDING",
      dgacStatus: input.dgacStatus ?? "ENROLLED",
      placementStatus: input.placementStatus ?? "APPLIED",
      languages: input.languages
        ? {
            create: input.languages.map((l) => ({
              name: l.name,
              level: l.level,
            })),
          }
        : undefined,
    },
    include: { languages: true },
  });

  return student;
}

// ─── READ ────────────────────────────────────────────────

export async function getStudents(search?: string) {
  const students = await prisma.student.findMany({
    where: {
      isDeleted: false,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { cin: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    include: { languages: true },
    orderBy: { createdAt: "desc" },
  });

  return students;
}

export async function getStudent(id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { languages: true },
  });
  return student;
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateStudent(id: string, input: Partial<CreateStudentInput>) {
  await requireAdminSession();
  // Recalculate BMI if height or weight changed
  let bmi: number | undefined;
  if (input.height !== undefined && input.weight !== undefined) {
    bmi = calculateBMI(input.height, input.weight);
  } else if (input.height !== undefined || input.weight !== undefined) {
    const existing = await prisma.student.findUnique({ where: { id } });
    if (existing) {
      bmi = calculateBMI(
        input.height ?? existing.height,
        input.weight ?? existing.weight
      );
    }
  }

  // Recalculate CEMPN status if expiration date changed
  const cempnStatus = input.cempnExpirationDate
    ? evaluateCEMPNStatus(new Date(input.cempnExpirationDate))
    : undefined;

  // Handle languages update: delete existing, create new
  if (input.languages) {
    await prisma.language.deleteMany({ where: { studentId: id } });
  }

  const student = await prisma.student.update({
    where: { id },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.cin !== undefined && { cin: input.cin }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.dateOfBirth !== undefined && { dateOfBirth: new Date(input.dateOfBirth) }),
      ...(input.gender !== undefined && { gender: input.gender }),
      ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl || null }),
      ...(input.height !== undefined && { height: input.height }),
      ...(input.weight !== undefined && { weight: input.weight }),
      ...(bmi !== undefined && { bmi }),
      ...(input.armReach !== undefined && { armReach: input.armReach }),
      ...(input.hasTattoos !== undefined && { hasTattoos: input.hasTattoos }),
      ...(input.tattoosDescription !== undefined && { tattoosDescription: input.tattoosDescription || null }),
      ...(input.hasScars !== undefined && { hasScars: input.hasScars }),
      ...(input.scarsDescription !== undefined && { scarsDescription: input.scarsDescription || null }),
      ...(input.cempnIssueDate !== undefined && { cempnIssueDate: input.cempnIssueDate ? new Date(input.cempnIssueDate) : null }),
      ...(input.cempnExpirationDate !== undefined && { cempnExpirationDate: input.cempnExpirationDate ? new Date(input.cempnExpirationDate) : null }),
      ...(cempnStatus !== undefined && { cempnStatus }),
      ...(input.passportNumber !== undefined && { passportNumber: input.passportNumber || null }),
      ...(input.passportExpirationDate !== undefined && { passportExpirationDate: input.passportExpirationDate ? new Date(input.passportExpirationDate) : null }),
      ...(input.heldVisas !== undefined && { heldVisas: input.heldVisas || null }),
      ...(input.swimmingStatus !== undefined && { swimmingStatus: input.swimmingStatus }),
      ...(input.dgacStatus !== undefined && { dgacStatus: input.dgacStatus }),
      ...(input.placementStatus !== undefined && { placementStatus: input.placementStatus }),
      ...(input.languages && {
        languages: {
          create: input.languages.map((l) => ({
            name: l.name,
            level: l.level,
          })),
        },
      }),
    },
    include: { languages: true },
  });

  return student;
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteStudent(id: string) {
  await requireAdminSession();
  await prisma.student.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
  
  revalidatePath('/admin/students');
  revalidatePath('/admin');
  revalidatePath('/admin/eligibility');
  
  return { success: true };
}

export async function restoreStudent(id: string) {
  await requireAdminSession();
  await prisma.student.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
    },
  });
  
  revalidatePath('/admin/students');
  revalidatePath('/admin');
  revalidatePath('/admin/eligibility');
  
  return { success: true };
}

export async function permanentlyDeleteStudent(id: string) {
  await requireAdminSession();
  await prisma.student.delete({ where: { id } });
  
  revalidatePath('/admin/students');
  revalidatePath('/admin');
  revalidatePath('/admin/eligibility');
  
  return { success: true };
}

// ─── EXPIRING DOCUMENTS & ALERTS ─────────────────────────

export interface ExpiringDocumentAlert {
  id: string; // student id
  alertId: string; // unique alert key e.g. `${student.id}-${type}`
  studentId: string;
  fullName: string;
  cin: string;
  phone: string;
  email?: string | null;
  photoUrl?: string | null;
  type: "cempn" | "passport";
  expirationDate: Date;
  daysRemaining: number;
  status: "EXPIRED" | "EXPIRING_SOON";
}

export interface GetPaginatedExpiringDocumentsParams {
  page?: number;
  limit?: number;
  docType?: "ALL" | "PASSPORT" | "CEMPN";
  status?: "ALL" | "EXPIRED" | "EXPIRING_SOON";
  search?: string;
}

export interface PaginatedExpiringDocumentsResult {
  data: ExpiringDocumentAlert[];
  totalCount: number;
  page: number;
  totalPages: number;
  limit: number;
  summary: {
    totalUrgent: number;
    expiredCount: number;
    expiringSoonCount: number;
    passportCount: number;
    cempnCount: number;
  };
}

export async function getPaginatedExpiringDocuments(
  params: GetPaginatedExpiringDocumentsParams = {}
): Promise<PaginatedExpiringDocumentsResult> {
  const {
    page = 1,
    limit = 10,
    docType = "ALL",
    status = "ALL",
    search = "",
  } = params;

  const now = new Date();
  const cempnThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const passportThreshold = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  // Search filter across candidate identifiers
  const searchCondition = search.trim()
    ? {
        OR: [
          { fullName: { contains: search.trim(), mode: "insensitive" as const } },
          { cin: { contains: search.trim(), mode: "insensitive" as const } },
          { phone: { contains: search.trim() } },
          { email: { contains: search.trim(), mode: "insensitive" as const } },
        ],
      }
    : {};

  // Construct efficient DB query targeting indexed date fields
  let docDateCondition: Record<string, unknown> = {};

  if (docType === "CEMPN") {
    if (status === "EXPIRED") {
      docDateCondition = { cempnExpirationDate: { not: null, lte: now } };
    } else if (status === "EXPIRING_SOON") {
      docDateCondition = { cempnExpirationDate: { gt: now, lte: cempnThreshold } };
    } else {
      docDateCondition = { cempnExpirationDate: { not: null, lte: cempnThreshold } };
    }
  } else if (docType === "PASSPORT") {
    if (status === "EXPIRED") {
      docDateCondition = { passportExpirationDate: { not: null, lte: now } };
    } else if (status === "EXPIRING_SOON") {
      docDateCondition = { passportExpirationDate: { gt: now, lte: passportThreshold } };
    } else {
      docDateCondition = { passportExpirationDate: { not: null, lte: passportThreshold } };
    }
  } else {
    // docType === "ALL"
    if (status === "EXPIRED") {
      docDateCondition = {
        OR: [
          { cempnExpirationDate: { not: null, lte: now } },
          { passportExpirationDate: { not: null, lte: now } },
        ],
      };
    } else if (status === "EXPIRING_SOON") {
      docDateCondition = {
        OR: [
          { cempnExpirationDate: { gt: now, lte: cempnThreshold } },
          { passportExpirationDate: { gt: now, lte: passportThreshold } },
        ],
      };
    } else {
      docDateCondition = {
        OR: [
          { cempnExpirationDate: { not: null, lte: cempnThreshold } },
          { passportExpirationDate: { not: null, lte: passportThreshold } },
        ],
      };
    }
  }

  // Fetch only matching candidate records from DB using indexes
  const candidates = await prisma.student.findMany({
    where: {
      isDeleted: false,
      ...searchCondition,
      ...docDateCondition,
    },
    select: {
      id: true,
      fullName: true,
      cin: true,
      phone: true,
      email: true,
      photoUrl: true,
      cempnExpirationDate: true,
      passportExpirationDate: true,
    },
  });

  // Transform candidates into discrete alerts & evaluate exact thresholds
  const allAlerts: ExpiringDocumentAlert[] = [];
  let expiredCount = 0;
  let expiringSoonCount = 0;
  let passportCount = 0;
  let cempnCount = 0;

  for (const s of candidates) {
    // Check CEMPN
    if (s.cempnExpirationDate && (docType === "ALL" || docType === "CEMPN")) {
      const days = daysUntil(s.cempnExpirationDate);
      const isDocExpired = days <= 0;
      const isDocExpiringSoon = days > 0 && days <= 30;

      let includeCempn = false;
      if (status === "EXPIRED" && isDocExpired) includeCempn = true;
      else if (status === "EXPIRING_SOON" && isDocExpiringSoon) includeCempn = true;
      else if (status === "ALL" && (isDocExpired || isDocExpiringSoon)) includeCempn = true;

      if (includeCempn) {
        cempnCount++;
        if (isDocExpired) expiredCount++;
        else expiringSoonCount++;

        allAlerts.push({
          id: s.id,
          alertId: `${s.id}-cempn`,
          studentId: s.id,
          fullName: s.fullName,
          cin: s.cin,
          phone: s.phone,
          email: s.email,
          photoUrl: s.photoUrl,
          type: "cempn",
          expirationDate: s.cempnExpirationDate,
          daysRemaining: days,
          status: isDocExpired ? "EXPIRED" : "EXPIRING_SOON",
        });
      }
    }

    // Check Passport
    if (s.passportExpirationDate && (docType === "ALL" || docType === "PASSPORT")) {
      const days = daysUntil(s.passportExpirationDate);
      const isDocExpired = days <= 0;
      const isDocExpiringSoon = days > 0 && days <= 180;

      let includePassport = false;
      if (status === "EXPIRED" && isDocExpired) includePassport = true;
      else if (status === "EXPIRING_SOON" && isDocExpiringSoon) includePassport = true;
      else if (status === "ALL" && (isDocExpired || isDocExpiringSoon)) includePassport = true;

      if (includePassport) {
        passportCount++;
        if (isDocExpired) expiredCount++;
        else expiringSoonCount++;

        allAlerts.push({
          id: s.id,
          alertId: `${s.id}-passport`,
          studentId: s.id,
          fullName: s.fullName,
          cin: s.cin,
          phone: s.phone,
          email: s.email,
          photoUrl: s.photoUrl,
          type: "passport",
          expirationDate: s.passportExpirationDate,
          daysRemaining: days,
          status: isDocExpired ? "EXPIRED" : "EXPIRING_SOON",
        });
      }
    }
  }

  // Sort by urgency: documents near to an expiry date (daysRemaining >= 0) first in ascending order,
  // followed by expired documents in descending order (most recently expired first)
  allAlerts.sort((a, b) => {
    const aIsUpcoming = a.daysRemaining >= 0;
    const bIsUpcoming = b.daysRemaining >= 0;

    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;

    if (aIsUpcoming && bIsUpcoming) {
      return a.daysRemaining - b.daysRemaining; // Closest upcoming deadline first (0, 1, 2, 5, 30...)
    } else {
      return b.daysRemaining - a.daysRemaining; // Most recently expired first (-1, -2, -10...)
    }
  });

  const totalCount = allAlerts.length;
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * safeLimit;
  const paginatedData = allAlerts.slice(startIndex, startIndex + safeLimit);

  return {
    data: paginatedData,
    totalCount,
    page: validPage,
    totalPages,
    limit: safeLimit,
    summary: {
      totalUrgent: totalCount,
      expiredCount,
      expiringSoonCount,
      passportCount,
      cempnCount,
    },
  };
}

// ─── DASHBOARD STATS ─────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const cempnThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const passportThreshold = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  const [total, certified, hired, urgentCandidates] = await Promise.all([
    prisma.student.count({ where: { isDeleted: false } }),
    prisma.student.count({ where: { isDeleted: false, dgacStatus: "CERTIFIED" } }),
    prisma.student.count({ where: { isDeleted: false, placementStatus: "HIRED" } }),
    // Targeted query fetching ONLY records within alert windows (indexed scan)
    prisma.student.findMany({
      where: {
        isDeleted: false,
        OR: [
          { cempnExpirationDate: { not: null, lte: cempnThreshold } },
          { passportExpirationDate: { not: null, lte: passportThreshold } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        cempnExpirationDate: true,
        passportExpirationDate: true,
      },
    }),
  ]);

  // Extract alerts
  const expiring: {
    id: string;
    fullName: string;
    phone: string;
    type: "cempn" | "passport";
    expirationDate: Date;
    daysRemaining: number;
  }[] = [];

  for (const s of urgentCandidates) {
    if (s.cempnExpirationDate) {
      const days = daysUntil(s.cempnExpirationDate);
      if (days <= 30) {
        expiring.push({
          id: s.id,
          fullName: s.fullName,
          phone: s.phone,
          type: "cempn",
          expirationDate: s.cempnExpirationDate,
          daysRemaining: days,
        });
      }
    }
    if (s.passportExpirationDate) {
      const days = daysUntil(s.passportExpirationDate);
      if (days <= 180) {
        expiring.push({
          id: s.id,
          fullName: s.fullName,
          phone: s.phone,
          type: "passport",
          expirationDate: s.passportExpirationDate,
          daysRemaining: days,
        });
      }
    }
  }

  // Sort by urgency: upcoming expirations first (closest to 0d), then recently expired
  expiring.sort((a, b) => {
    const aIsUpcoming = a.daysRemaining >= 0;
    const bIsUpcoming = b.daysRemaining >= 0;

    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;

    if (aIsUpcoming && bIsUpcoming) {
      return a.daysRemaining - b.daysRemaining;
    } else {
      return b.daysRemaining - a.daysRemaining;
    }
  });

  return {
    total,
    certified,
    hired,
    expiringSoon: expiring.length,
    // Top 5 most urgent alerts for dashboard widget performance
    expiringDocuments: expiring.slice(0, 5),
  };
}

export async function getRecentStudents() {
  return prisma.student.findMany({
    where: { isDeleted: false },
    include: { languages: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

// ─── TRASH / ARCHIVE ───────────────────────────────────────

export async function getArchivedStudents() {
  const students = await prisma.student.findMany({
    where: { isDeleted: true },
    include: { languages: true },
    orderBy: { deletedAt: "desc" },
  });

  return students;
}
