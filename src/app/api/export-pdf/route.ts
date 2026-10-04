import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import { PortfolioPDF } from "@/components/PortfolioPDF";
import type { PDFLabels } from "@/components/PortfolioPDF";
import { verifySessionToken } from "@/lib/auth";
import { en } from "@/locales/en";
import { fr } from "@/locales/fr";

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get("amtc_admin_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired session." }, { status: 401 });
    }

    const { studentIds, airlineName } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: "Missing student IDs" }, { status: 400 });
    }

    // Read user's language preference from cookie
    const lang = req.cookies.get("amtc-lang")?.value;
    const dict = lang === "fr" ? fr : en;
    const labels: PDFLabels = dict.pdf;

    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      include: { languages: true },
      orderBy: { fullName: "asc" }
    });

    const element = React.createElement(PortfolioPDF, {
      students,
      airlineName: airlineName || "Airline",
      labels,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(element as any);

    const filename = students.length === 1 && students[0].fullName
      ? `AMTC_${students[0].fullName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Portfolio.pdf`
      : `AMTC_${airlineName ? airlineName.replace(/[^a-zA-Z0-9_-]/g, "_") : "Candidates"}.pdf`;

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF Export Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
