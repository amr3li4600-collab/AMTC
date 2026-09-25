"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Edit2, Trash2, RefreshCcw, AlertTriangle, MessageSquare } from "lucide-react";
import { getStatusColor, evaluatePassportStatus } from "@/lib/utils";
import { deleteStudent, restoreStudent, permanentlyDeleteStudent } from "@/app/actions/studentActions";
import { DGACBadge } from "@/components/DGACBadge";
import { generateWhatsAppURL } from "@/lib/whatsapp";
import { motion, AnimatePresence } from "framer-motion";
import type { Student, Language } from "@/generated/prisma/client";
import { useLanguage } from "@/context/LanguageContext";

type StudentWithLangs = Student & { languages: Language[] };

interface StudentTableProps {
  initialStudents: StudentWithLangs[];
  isArchivedView?: boolean;
}

export function StudentTable({ initialStudents, isArchivedView = false }: StudentTableProps) {
  const { t } = useLanguage();
  const [students, setStudents] = useState<StudentWithLangs[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    studentId: string | null;
    mode: 'soft' | 'permanent' | null;
    studentName: string | null;
  }>({ isOpen: false, studentId: null, mode: null, studentName: null });

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Client-side filtering with defensive null checks
  const filteredStudents = (students || []).filter((s) => {
    if (!s) return false;
    const query = search.toLowerCase();
    const name = (s.fullName || "").toLowerCase();
    const cin = (s.cin || "").toLowerCase();
    const phone = (s.phone || "").toLowerCase();
    return name.includes(query) || cin.includes(query) || phone.includes(query);
  });

  function promptDelete(student: StudentWithLangs, mode: 'soft' | 'permanent') {
    setDeleteModal({
      isOpen: true,
      studentId: student.id,
      mode,
      studentName: student.fullName || "Unnamed Candidate"
    });
  }

  async function confirmDeleteAction() {
    if (!deleteModal.studentId || !deleteModal.mode) return;
    
    const id = deleteModal.studentId;
    const mode = deleteModal.mode;
    
    setIsProcessing(id);
    setDeleteModal({ isOpen: false, studentId: null, mode: null, studentName: null });
    
    try {
      if (mode === 'soft') {
        await deleteStudent(id);
      } else {
        await permanentlyDeleteStudent(id);
      }
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      alert(`Failed to ${mode === 'soft' ? 'delete' : 'permanently delete'} student`);
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  }

  async function handleRestore(id: string) {
    setIsProcessing(id);
    try {
      await restoreStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      alert("Failed to restore student");
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-cockpit-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-cockpit-surface">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-cockpit-muted" />
          <input
            type="text"
            placeholder={t.students.searchPlaceholder}
            className="input pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!isArchivedView && (
          <Link href="/admin/students/new" className="btn-primary text-center justify-center shrink-0 inline-flex items-center">
            {t.students.addStudent}
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-cockpit-canvas/60 border-b border-slate-100 dark:border-cockpit-border text-xs font-semibold text-slate-500 dark:text-cockpit-muted uppercase tracking-wider">
              <th className="px-6 py-4">{t.students.thStudent}</th>
              <th className="px-6 py-4">{t.students.thMetrics}</th>
              <th className="px-6 py-4">{t.students.thCempn}</th>
              <th className="px-6 py-4">{t.students.thPassport}</th>
              <th className="px-6 py-4">{t.students.thDgac}</th>
              <th className="px-6 py-4 text-right">{t.students.thActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-cockpit-border bg-white dark:bg-cockpit-surface">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-cockpit-muted">
                  {t.students.noStudentsFound}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const cempnStatus = student.cempnStatus || "VALID";
                const cempnColors = getStatusColor(cempnStatus);
                const isCempnUrgent = cempnStatus === "EXPIRED" || cempnStatus === "EXPIRING_SOON";
                
                const passportStatus = evaluatePassportStatus(student.passportExpirationDate);
                const passportColors = getStatusColor(passportStatus);
                const isPassportUrgent = passportStatus === "EXPIRED" || passportStatus === "EXPIRING_SOON";

                const cempnWhatsAppUrl = student.phone
                  ? generateWhatsAppURL(
                      student.phone,
                      {
                        fullName: student.fullName,
                        expirationDate: student.cempnExpirationDate,
                        status: cempnStatus,
                      },
                      "CEMPN"
                    )
                  : null;

                const passportWhatsAppUrl = student.phone
                  ? generateWhatsAppURL(
                      student.phone,
                      {
                        fullName: student.fullName,
                        expirationDate: student.passportExpirationDate,
                        status: passportStatus,
                      },
                      "PASSPORT"
                    )
                  : null;

                // Determine primary alert document for the action column
                const primaryDocType = isPassportUrgent && !isCempnUrgent ? "PASSPORT" : "CEMPN";
                const primaryWhatsAppUrl = primaryDocType === "PASSPORT" ? passportWhatsAppUrl : cempnWhatsAppUrl;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-cockpit-canvas/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-cockpit-border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-amtc-blueLight dark:bg-cockpit-border/40 flex items-center justify-center text-amtc-navy dark:text-amtc-sky font-bold text-sm">
                            {student.fullName ? student.fullName.charAt(0) : "S"}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="text-sm font-bold text-amtc-navy dark:text-white hover:text-amtc-blue dark:hover:text-amtc-sky transition-colors block"
                          >
                            {student.fullName || "Unnamed Candidate"}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-cockpit-muted mt-0.5">{student.cin || "N/A"} • {student.phone || "No phone"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 dark:text-slate-200 font-medium">{student.height ?? 0} cm</div>
                      <div className="text-xs text-slate-500 dark:text-cockpit-muted mt-0.5">BMI: {student.bmi ?? 0}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${cempnColors.bg} ${cempnColors.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cempnColors.dot}`} />
                          {cempnStatus.replace('_', ' ')}
                        </span>
                        {isCempnUrgent && cempnWhatsAppUrl && (
                          <a
                            href={cempnWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded transition-colors"
                            title="Remind CEMPN via WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.passportExpirationDate || student.passportNumber ? (
                        <div>
                          <div className="flex items-center gap-2">
                            {student.passportExpirationDate ? (
                              <span className={`badge ${passportColors.bg} ${passportColors.text}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${passportColors.dot}`} />
                                {passportStatus.replace('_', ' ')}
                              </span>
                            ) : (
                              <span className="badge bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {t.students.noExpiryDate}
                              </span>
                            )}
                            {isPassportUrgent && passportWhatsAppUrl && (
                              <a
                                href={passportWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded transition-colors"
                                title={t.students.remindPassport}
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {student.passportNumber && (
                            <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-mono uppercase font-bold tracking-wider">
                              {student.passportNumber}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-cockpit-muted font-medium italic">{t.common.notProvided}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <DGACBadge status={student.dgacStatus || "ENROLLED"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isArchivedView ? (
                          <>
                            {student.phone && primaryWhatsAppUrl && (
                              <a
                                href={primaryWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 dark:text-cockpit-muted hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors"
                                title={`${t.students.sendReminder} (${primaryDocType === 'PASSPORT' ? t.alerts.passport : t.alerts.cempn})`}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </a>
                            )}
                            <Link
                              href={`/admin/students/${student.id}`}
                              className="p-1.5 text-slate-400 dark:text-cockpit-muted hover:text-amtc-navy dark:hover:text-amtc-sky hover:bg-slate-100 dark:hover:bg-cockpit-canvas rounded-md transition-colors"
                              title={t.students.editStudent}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => promptDelete(student, 'soft')}
                              disabled={isProcessing === student.id}
                              className="p-1.5 text-slate-400 dark:text-cockpit-muted hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-md transition-colors disabled:opacity-50"
                              title={t.students.moveToTrash}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(student.id)}
                              disabled={isProcessing === student.id}
                              className="p-1.5 text-slate-400 dark:text-cockpit-muted hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors disabled:opacity-50"
                              title={t.students.restoreStudent}
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => promptDelete(student, 'permanent')}
                              disabled={isProcessing === student.id}
                              className="p-1.5 text-slate-400 dark:text-cockpit-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors disabled:opacity-50"
                              title={t.students.permanentlyDelete}
                            >
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              className="bg-white dark:bg-cockpit-surface border border-slate-100 dark:border-cockpit-border rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${deleteModal.mode === 'permanent' ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'}`}>
                  {deleteModal.mode === 'permanent' ? <Trash2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amtc-navy dark:text-white">
                    {deleteModal.mode === 'permanent' ? t.students.modalPermTitle : t.students.modalSoftTitle}
                  </h3>
                  <p className="text-slate-500 dark:text-cockpit-muted text-sm mt-2">
                    {deleteModal.mode === 'permanent' 
                      ? t.students.modalPermDesc
                      : t.students.modalSoftDesc}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, studentId: null, mode: null, studentName: null })}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-cockpit-canvas hover:bg-slate-200 dark:hover:bg-cockpit-hover border border-transparent dark:border-cockpit-border rounded-lg transition-colors cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button 
                  onClick={confirmDeleteAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer ${
                    deleteModal.mode === 'permanent' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {deleteModal.mode === 'permanent' ? t.students.confirmDelete : t.students.confirmMove}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
