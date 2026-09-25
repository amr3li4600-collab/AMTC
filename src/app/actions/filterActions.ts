"use server";

import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/utils";
import type { Student, Language, AirlineCriteria } from "@/generated/prisma/client";

// ─── Types ───────────────────────────────────────────────

export interface EligibilityCriteria {
  airlineName?: string;
  minHeightFemale?: number;
  minHeightMale?: number;
  minArmReach?: number;
  maxBMI?: number;
  maxAge?: number;
  requiredCempnValidityMonths?: number;
  requiredSwimming?: boolean;
  requiredLanguages?: { name: string; minLevel: string }[];
}

export interface MatchResult {
  student: Student & { languages: Language[] };
  matchPercentage: number;
  criteria: CriterionResult[];
  isEligible: boolean;
}

export interface CriterionResult {
  criterion: string;
  passed: boolean;
  detail: string;
}

// ─── CEFR Level Ordering ─────────────────────────────────

const CEFR_ORDER: Record<string, number> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6,
};

function meetsLanguageLevel(studentLevel: string, requiredLevel: string): boolean {
  return (CEFR_ORDER[studentLevel] || 0) >= (CEFR_ORDER[requiredLevel] || 0);
}

// ─── Get Airline Criteria ────────────────────────────────

export async function getAirlineCriteria(): Promise<AirlineCriteria[]> {
  return prisma.airlineCriteria.findMany({
    orderBy: { airlineName: "asc" },
  });
}

export async function getAirlineCriteriaByName(name: string): Promise<AirlineCriteria | null> {
  return prisma.airlineCriteria.findUnique({
    where: { airlineName: name },
  });
}

// ─── Eligibility Matching Engine ─────────────────────────

export async function filterEligibleStudents(
  criteria: EligibilityCriteria
): Promise<MatchResult[]> {
  // Fetch all active students with languages
  const students = await prisma.student.findMany({
    where: { isDeleted: false },
    include: { languages: true },
  });

  // Evaluate each student
  const results: MatchResult[] = students.map((student) => {
    const criteriaResults = evaluateStudent(student, criteria);
    const passed = criteriaResults.filter((c) => c.passed).length;
    const total = criteriaResults.length;
    const matchPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      student,
      matchPercentage,
      criteria: criteriaResults,
      isEligible: matchPercentage === 100,
    };
  });

  // Sort by match percentage descending
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return results;
}

// ─── Per-Student Evaluation ──────────────────────────────

function evaluateStudent(
  student: Student & { languages: Language[] },
  criteria: EligibilityCriteria
): CriterionResult[] {
  const results: CriterionResult[] = [];

  // Height check (gender-specific)
  if (student.gender === "FEMALE" && criteria.minHeightFemale) {
    results.push({
      criterion: "Minimum Height (Female)",
      passed: student.height >= criteria.minHeightFemale,
      detail: `${student.height}cm / ${criteria.minHeightFemale}cm required`,
    });
  } else if (student.gender === "MALE" && criteria.minHeightMale) {
    results.push({
      criterion: "Minimum Height (Male)",
      passed: student.height >= criteria.minHeightMale,
      detail: `${student.height}cm / ${criteria.minHeightMale}cm required`,
    });
  }

  // Arm Reach
  if (criteria.minArmReach) {
    results.push({
      criterion: "Arm Reach",
      passed: student.armReach >= criteria.minArmReach,
      detail: `${student.armReach}cm / ${criteria.minArmReach}cm required`,
    });
  }

  // BMI
  if (criteria.maxBMI) {
    results.push({
      criterion: "BMI",
      passed: student.bmi <= criteria.maxBMI,
      detail: `${student.bmi} / max ${criteria.maxBMI}`,
    });
  }

  // Age
  if (criteria.maxAge) {
    const age = calculateAge(student.dateOfBirth);
    results.push({
      criterion: "Maximum Age",
      passed: age <= criteria.maxAge,
      detail: `${age} years / max ${criteria.maxAge}`,
    });
  }

  // CEMPN Validity
  if (criteria.requiredCempnValidityMonths) {
    let cempnValid = false;
    if (student.cempnExpirationDate) {
      const now = new Date();
      const requiredUntil = new Date(now);
      requiredUntil.setMonth(requiredUntil.getMonth() + criteria.requiredCempnValidityMonths);
      cempnValid = student.cempnExpirationDate >= requiredUntil;
    }
    results.push({
      criterion: "CEMPN Validity",
      passed: cempnValid,
      detail: cempnValid
        ? `Valid for ${criteria.requiredCempnValidityMonths}+ months`
        : `Expires too soon or missing`,
    });
  }

  // Swimming
  if (criteria.requiredSwimming) {
    results.push({
      criterion: "Swimming Test",
      passed: student.swimmingStatus === "PASSED",
      detail: student.swimmingStatus,
    });
  }

  // Languages
  if (criteria.requiredLanguages && criteria.requiredLanguages.length > 0) {
    for (const req of criteria.requiredLanguages) {
      const studentLang = student.languages.find(
        (l) => l.name.toLowerCase() === req.name.toLowerCase()
      );
      const passed = studentLang ? meetsLanguageLevel(studentLang.level, req.minLevel) : false;
      results.push({
        criterion: `Language: ${req.name} (${req.minLevel}+)`,
        passed,
        detail: studentLang
          ? `Level: ${studentLang.level}`
          : "Not declared",
      });
    }
  }

  // Tattoos / Scars (most airlines prefer no visible tattoos)
  if (student.hasTattoos) {
    results.push({
      criterion: "No Visible Tattoos",
      passed: false,
      detail: student.tattoosDescription || "Has tattoos",
    });
  }

  return results;
}
