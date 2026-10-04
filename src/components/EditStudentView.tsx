"use client";

import { useState } from "react";
import { StudentForm } from "@/components/StudentForm";
import { useLanguage } from "@/context/LanguageContext";
import { Download, Loader2 } from "lucide-react";
import type { Student, Language } from "@/generated/prisma/client";

type StudentWithLangs = Student & { languages: Language[] };

interface EditStudentViewProps {
  student: StudentWithLangs;
}

export function EditStudentView({ student }: EditStudentViewProps) {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportPDF() {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: [student.id],
          airlineName: "AMTC Academy",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const sanitizedName = (student.fullName || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `AMTC_${sanitizedName}_Portfolio.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert(t.eligibility.failedToExport || "Failed to export PDF portfolio");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t.studentForm.editTitle}</h1>
          <p className="text-slate-500 dark:text-cockpit-muted mt-1">
            {t.studentForm.editSubtitle.replace("{name}", student.fullName || "")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="btn-gold flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-md hover:shadow-lg transition-all"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin text-amtc-navy" />
          ) : (
            <Download className="h-4 w-4 text-amtc-navy" />
          )}
          <span>{isExporting ? t.studentForm.generatingPdf : t.studentForm.exportPdf}</span>
        </button>
      </div>

      <StudentForm initialData={student} tempId={student.id} />
    </div>
  );
}
