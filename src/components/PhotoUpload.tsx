"use client";

import { useState, useRef } from "react";
import { Upload, Check, Loader2 } from "lucide-react";
import { uploadPhotoAction } from "@/app/actions/uploadActions";
import { useLanguage } from "@/context/LanguageContext";

interface PhotoUploadProps {
  studentId: string;
  defaultUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export function PhotoUpload({ studentId, defaultUrl, onUploadComplete }: PhotoUploadProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState<string | null>(defaultUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("File exceeds 3MB limit");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studentId", studentId);

      const result = await uploadPhotoAction(formData);
      
      if (!result.success || !result.url) {
        throw new Error(result.error || "Failed to upload photo");
      }

      setUrl(result.url);
      onUploadComplete(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {/* Preview Avatar */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 dark:border-cockpit-border bg-slate-50 dark:bg-cockpit-canvas">
          {url ? (
            <img src={url} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-cockpit-muted">
              <Upload className="h-8 w-8" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-cockpit-surface/80 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-amtc-navy dark:text-amtc-sky" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary py-1.5 px-4"
          >
            {url ? t.studentForm.changePhoto : t.studentForm.uploadPhoto}
          </button>
          <p className="text-xs text-slate-500 dark:text-cockpit-muted">
            {t.studentForm.photoFormatHelp}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      
      {url && !isUploading && !error && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
          <Check className="h-3 w-3" /> {t.studentForm.photoSuccess}
        </p>
      )}
    </div>
  );
}
