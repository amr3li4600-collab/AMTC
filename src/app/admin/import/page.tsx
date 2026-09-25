"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { importStudentsFromExcel, generateImportTemplate } from "@/app/actions/importActions";
import { useLanguage } from "@/context/LanguageContext";

export default function BulkImportPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    succeeded: number;
    total: number;
    failed: { row: number; reason: string }[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDownloadTemplate() {
    try {
      const base64 = await generateImportTemplate();
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AMTC_Student_Import_Template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate template", error);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  }

  async function handleImport() {
    if (!file) return;
    
    setIsImporting(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await importStudentsFromExcel(formData);
      setResult(response);
    } catch (error) {
      console.error(error);
      alert(t.import.importFailed);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{t.import.title}</h1>
          <p className="text-slate-500 dark:text-cockpit-muted mt-1">{t.import.subtitle}</p>
        </div>
        
        <button onClick={handleDownloadTemplate} className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto shrink-0">
          <FileSpreadsheet className="h-4 w-4" />
          {t.import.downloadTemplate}
        </button>
      </div>

      <div className="card p-4 sm:p-8">
        <div 
          className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-colors ${
            file 
              ? 'border-amtc-blue dark:border-amtc-sky bg-amtc-blueLight dark:bg-cockpit-canvas/80' 
              : 'border-slate-300 dark:border-cockpit-border hover:border-amtc-blue dark:hover:border-amtc-sky bg-slate-50 dark:bg-cockpit-canvas'
          }`}
        >
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <div className="mx-auto h-16 w-16 bg-white dark:bg-cockpit-surface rounded-full shadow-sm flex items-center justify-center mb-4">
            <Upload className={`h-8 w-8 ${file ? 'text-amtc-navy dark:text-amtc-sky' : 'text-slate-400 dark:text-cockpit-muted'}`} />
          </div>
          
          {file ? (
            <div>
              <p className="text-lg font-semibold text-amtc-navy dark:text-white">{file.name}</p>
              <p className="text-sm text-slate-500 dark:text-cockpit-muted mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <button 
                onClick={() => setFile(null)}
                className="mt-4 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600"
              >
                {t.import.removeFile}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200">{t.import.dragDrop}</p>
              <p className="text-sm text-slate-500 dark:text-cockpit-muted mt-1 mb-6">{t.import.supportsFormats}</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                {t.import.selectFile}
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleImport} 
              disabled={isImporting}
              className="btn-gold flex items-center gap-2"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isImporting ? t.import.processing : t.import.startImport}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="card overflow-hidden animate-slide-up">
          <div className={`p-6 border-b ${result.failed.length > 0 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'}`}>
            <div className="flex items-center gap-3">
              {result.failed.length > 0 ? (
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              )}
              <div>
                <h3 className={`text-lg font-bold ${result.failed.length > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
                  {t.import.importComplete}
                </h3>
                <p className={`text-sm ${result.failed.length > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {t.import.importSuccessDesc
                    .replace("{succeeded}", String(result.succeeded))
                    .replace("{total}", String(result.total))}
                </p>
              </div>
            </div>
          </div>
          
          {result.failed.length > 0 && (
            <div className="p-6">
              <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
                {t.import.errors} ({result.failed.length})
              </h4>
              <div className="bg-slate-50 dark:bg-cockpit-canvas rounded-lg border border-slate-200 dark:border-cockpit-border overflow-hidden">
                <ul className="divide-y divide-slate-200 dark:divide-cockpit-border max-h-96 overflow-y-auto">
                  {result.failed.map((error, idx) => (
                    <li key={idx} className="p-3 text-sm flex gap-4">
                      <span className="font-mono text-slate-500 dark:text-cockpit-muted w-16 shrink-0">
                        {t.import.row} {error.row}
                      </span>
                      <span className="text-red-600 dark:text-red-400">{error.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
