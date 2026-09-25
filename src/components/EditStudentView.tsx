"use client";

import { StudentForm } from "@/components/StudentForm";
import { useLanguage } from "@/context/LanguageContext";
import type { Student, Language } from "@/generated/prisma/client";

type StudentWithLangs = Student & { languages: Language[] };

interface EditStudentViewProps {
  student: StudentWithLangs;
}

export function EditStudentView({ student }: EditStudentViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="page-title">{t.studentForm.editTitle}</h1>
        <p className="text-slate-500 dark:text-cockpit-muted mt-1">
          {t.studentForm.editSubtitle.replace("{name}", student.fullName || "")}
        </p>
      </div>

      <StudentForm initialData={student} tempId={student.id} />
    </div>
  );
}
