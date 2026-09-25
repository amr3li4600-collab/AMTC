"use client";

import { StudentTable } from "@/components/StudentTable";
import Link from "next/link";
import { Users, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Student, Language } from "@/generated/prisma/client";

type StudentWithLangs = Student & { languages: Language[] };

interface StudentsViewProps {
  students: StudentWithLangs[];
  isArchivedView: boolean;
}

export function StudentsView({ students, isArchivedView }: StudentsViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{isArchivedView ? t.students.archivedTitle : t.students.title}</h1>
          <p className="text-slate-500 dark:text-cockpit-muted mt-1">
            {isArchivedView 
              ? t.students.archivedSubtitle 
              : t.students.subtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-cockpit-surface p-1 rounded-xl w-full sm:w-auto border border-transparent dark:border-cockpit-border">
          <Link 
            href="/admin/students"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${!isArchivedView ? 'bg-white dark:bg-cockpit-canvas shadow-xs text-amtc-navy dark:text-amtc-sky font-semibold' : 'text-slate-500 dark:text-cockpit-muted hover:text-amtc-navy dark:hover:text-white'}`}
          >
            <Users className="h-4 w-4" />
            {t.students.active}
          </Link>
          <Link 
            href="/admin/students?view=archived"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isArchivedView ? 'bg-white dark:bg-cockpit-canvas shadow-xs text-amtc-navy dark:text-amtc-sky font-semibold' : 'text-slate-500 dark:text-cockpit-muted hover:text-amtc-navy dark:hover:text-white'}`}
          >
            <Trash2 className="h-4 w-4" />
            {t.students.trash}
          </Link>
        </div>
      </div>

      <StudentTable initialStudents={students} isArchivedView={isArchivedView} />
    </div>
  );
}
