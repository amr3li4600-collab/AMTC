"use client";

import { useState } from "react";
import { StudentForm } from "@/components/StudentForm";
import { useLanguage } from "@/context/LanguageContext";

export default function NewStudentPage() {
  const { t } = useLanguage();
  // Generate a temporary ID for photo uploads before the student is actually created
  const [tempId] = useState(() => `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="page-title">{t.studentForm.addTitle}</h1>
        <p className="text-slate-500 dark:text-cockpit-muted mt-1">{t.studentForm.addSubtitle}</p>
      </div>

      <StudentForm tempId={tempId} />
    </div>
  );
}
