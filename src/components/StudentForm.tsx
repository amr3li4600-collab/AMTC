"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoUpload } from "./PhotoUpload";
import { DGACBadge } from "./DGACBadge";
import { createStudent, updateStudent } from "@/app/actions/studentActions";
import type { Student, Language, CEFRLevel, Gender, SwimmingStatus, DGACStatus, PlacementStatus } from "@/generated/prisma/client";
import { Loader2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type StudentWithLangs = Student & { languages: Language[] };

interface StudentFormProps {
  initialData?: StudentWithLangs;
  // If editing, use existing ID. If creating, we generate a temp ID for photo uploads.
  tempId: string;
}

export function StudentForm({ initialData, tempId }: StudentFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>(initialData?.photoUrl || "");
  const [languages, setLanguages] = useState<{ name: string; level: CEFRLevel }[]>(
    initialData?.languages.map(l => ({ name: l.name, level: l.level as CEFRLevel })) || 
    [{ name: "English", level: "B1" }]
  );
  const [dgacStatus, setDgacStatus] = useState<DGACStatus>(initialData?.dgacStatus || "ENROLLED");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        fullName: formData.get("fullName") as string,
        cin: formData.get("cin") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        dateOfBirth: formData.get("dateOfBirth") as string,
        gender: formData.get("gender") as Gender,
        height: Number(formData.get("height")),
        weight: Number(formData.get("weight")),
        armReach: Number(formData.get("armReach")),
        hasTattoos: formData.get("hasTattoos") === "true",
        tattoosDescription: formData.get("tattoosDescription") as string,
        cempnIssueDate: formData.get("cempnIssueDate") as string || undefined,
        cempnExpirationDate: formData.get("cempnExpirationDate") as string || undefined,
        passportNumber: formData.get("passportNumber") as string,
        passportExpirationDate: formData.get("passportExpirationDate") as string || undefined,
        swimmingStatus: formData.get("swimmingStatus") as SwimmingStatus,
        dgacStatus,
        placementStatus: formData.get("placementStatus") as PlacementStatus,
        photoUrl: photoUrl || undefined,
        languages: languages.filter(l => l.name.trim() !== ""),
      };

      if (initialData) {
        await updateStudent(initialData.id, data);
      } else {
        await createStudent(data);
      }
      
      router.push("/admin/students");
      router.refresh();
    } catch (error) {
      alert("Failed to save student");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Personal Information */}
      <div className="card p-6 stagger-children">
        <h3 className="section-title mb-6 border-b border-slate-100 dark:border-cockpit-border pb-4">{t.studentForm.personalInfo}</h3>
        
        <div className="mb-8">
          <label className="label">{t.studentForm.profilePhoto}</label>
          <PhotoUpload 
            studentId={initialData?.id || tempId} 
            defaultUrl={photoUrl}
            onUploadComplete={setPhotoUrl} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">{t.studentForm.fullName}</label>
            <input required name="fullName" defaultValue={initialData?.fullName} className="input" />
          </div>
          <div>
            <label className="label">{t.studentForm.cin}</label>
            <input required name="cin" defaultValue={initialData?.cin} className="input uppercase" />
          </div>
          <div>
            <label className="label">{t.studentForm.phone}</label>
            <input required name="phone" defaultValue={initialData?.phone} className="input" placeholder="+212 6..." />
          </div>
          <div>
            <label className="label">{t.studentForm.email}</label>
            <input type="email" name="email" defaultValue={initialData?.email || ""} className="input" />
          </div>
          <div>
            <label className="label">{t.studentForm.dob}</label>
            <input required type="date" name="dateOfBirth" 
              defaultValue={initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : ""} 
              className="input" 
            />
          </div>
          <div>
            <label className="label">{t.studentForm.gender}</label>
            <select name="gender" defaultValue={initialData?.gender || "FEMALE"} className="select">
              <option value="FEMALE">{t.studentForm.female}</option>
              <option value="MALE">{t.studentForm.male}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Physical Metrics */}
      <div className="card p-6 stagger-children">
        <h3 className="section-title mb-6 border-b border-slate-100 dark:border-cockpit-border pb-4">{t.studentForm.physicalMetrics}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">{t.studentForm.height}</label>
            <input required type="number" step="0.1" name="height" defaultValue={initialData?.height} className="input" />
          </div>
          <div>
            <label className="label">{t.studentForm.weight}</label>
            <input required type="number" step="0.1" name="weight" defaultValue={initialData?.weight} className="input" />
          </div>
          <div>
            <label className="label">{t.studentForm.armReach}</label>
            <input required type="number" name="armReach" defaultValue={initialData?.armReach} className="input" />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">{t.studentForm.visibleTattoos}</label>
              <select name="hasTattoos" defaultValue={initialData?.hasTattoos ? "true" : "false"} className="select">
                <option value="false">{t.common.no}</option>
                <option value="true">{t.common.yes}</option>
              </select>
            </div>
            <div>
              <label className="label">{t.studentForm.tattooDesc}</label>
              <input name="tattoosDescription" defaultValue={initialData?.tattoosDescription || ""} className="input" />
            </div>
          </div>
        </div>
      </div>

      {/* Medical & Passport Credentials */}
      <div className="card p-6 stagger-children">
        <h3 className="section-title mb-6 border-b border-slate-100 dark:border-cockpit-border pb-4">{t.studentForm.medicalPassport}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">{t.studentForm.cempnIssueDate}</label>
            <input type="date" name="cempnIssueDate" 
              defaultValue={initialData?.cempnIssueDate ? new Date(initialData.cempnIssueDate).toISOString().split('T')[0] : ""} 
              className="input" 
            />
          </div>
          <div>
            <label className="label">{t.studentForm.cempnExpirationDate}</label>
            <input type="date" name="cempnExpirationDate" 
              defaultValue={initialData?.cempnExpirationDate ? new Date(initialData.cempnExpirationDate).toISOString().split('T')[0] : ""} 
              className="input" 
            />
          </div>
          <div>
            <label className="label">{t.studentForm.passportNumber}</label>
            <input name="passportNumber" defaultValue={initialData?.passportNumber || ""} className="input uppercase" />
          </div>
          <div>
            <label className="label">{t.studentForm.passportExpiration}</label>
            <input type="date" name="passportExpirationDate" 
              defaultValue={initialData?.passportExpirationDate ? new Date(initialData.passportExpirationDate).toISOString().split('T')[0] : ""} 
              className="input" 
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">{t.studentForm.dgacStatus}</label>
              <DGACBadge status={dgacStatus} />
            </div>
            <select name="dgacStatus" value={dgacStatus} onChange={(e) => setDgacStatus(e.target.value as DGACStatus)} className="select">
              <option value="ENROLLED">{t.dgacBadges.ENROLLED}</option>
              <option value="WRITTEN_PASSED">{t.dgacBadges.WRITTEN_PASSED}</option>
              <option value="PRACTICAL_PASSED">{t.dgacBadges.PRACTICAL_PASSED}</option>
              <option value="CERTIFIED">{t.dgacBadges.CERTIFIED}</option>
            </select>
          </div>
          <div>
            <label className="label">{t.studentForm.swimmingTest}</label>
            <select name="swimmingStatus" defaultValue={initialData?.swimmingStatus || "PENDING"} className="select">
              <option value="PENDING">{t.studentForm.swimmingPending}</option>
              <option value="PASSED">{t.studentForm.swimmingPassed}</option>
              <option value="FAILED">{t.studentForm.swimmingFailed}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">{t.studentForm.placementStatus}</label>
            <select name="placementStatus" defaultValue={initialData?.placementStatus || "APPLIED"} className="select">
              <option value="APPLIED">{t.studentForm.appliedWaiting}</option>
              <option value="ASSESSMENT_DAY">{t.studentForm.assessmentDay}</option>
              <option value="FINAL_INTERVIEW">{t.studentForm.finalInterview}</option>
              <option value="HIRED">{t.studentForm.hiredOption}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="card p-6 stagger-children">
        <h3 className="section-title mb-6 border-b border-slate-100 dark:border-cockpit-border pb-4">{t.studentForm.languages}</h3>
        <div className="space-y-4">
          {languages.map((lang, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <input
                  placeholder={t.studentForm.languagePlaceholder}
                  value={lang.name}
                  onChange={(e) => {
                    const newLangs = [...languages];
                    newLangs[index].name = e.target.value;
                    setLanguages(newLangs);
                  }}
                  className="input"
                />
              </div>
              <div className="w-32">
                <select
                  value={lang.level}
                  onChange={(e) => {
                    const newLangs = [...languages];
                    newLangs[index].level = e.target.value as CEFRLevel;
                    setLanguages(newLangs);
                  }}
                  className="select"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setLanguages(languages.filter((_, i) => i !== index))}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLanguages([...languages, { name: "", level: "B1" }])}
            className="text-sm font-semibold text-amtc-blue hover:text-amtc-blueHover dark:text-amtc-sky"
          >
            {t.studentForm.addLanguage}
          </button>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
        <button type="button" onClick={() => router.back()} className="btn-secondary w-full sm:w-auto text-center justify-center">
          {t.common.cancel}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-gold flex items-center justify-center gap-2 w-full sm:w-auto">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? t.studentForm.saveChanges : t.studentForm.createStudent}
        </button>
      </div>
    </form>
  );
}
