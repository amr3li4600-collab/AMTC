"use client";

import { useState, useEffect } from "react";
import { Loader2, Download, Search } from "lucide-react";
import { filterEligibleStudents, getAirlineCriteria } from "@/app/actions/filterActions";
import { EligibilityCard } from "@/components/EligibilityCard";
import type { AirlineCriteria } from "@/generated/prisma/client";
import type { MatchResult } from "@/app/actions/filterActions";
import { useLanguage } from "@/context/LanguageContext";

export default function EligibilityEnginePage() {
  const { t } = useLanguage();
  const [airlines, setAirlines] = useState<AirlineCriteria[]>([]);
  const [selectedAirline, setSelectedAirline] = useState<string>("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    getAirlineCriteria().then(setAirlines);
  }, []);

  async function handleFilter() {
    if (!selectedAirline) return;
    
    setIsFiltering(true);
    try {
      const criteria = airlines.find(a => a.airlineName === selectedAirline);
      if (criteria) {
        // Parse languages if they exist
        const requiredLanguages = criteria.requiredLanguages 
          ? JSON.parse(criteria.requiredLanguages) 
          : [];

        const matchResults = await filterEligibleStudents({
          airlineName: criteria.airlineName,
          minHeightFemale: criteria.minHeightFemale || undefined,
          minHeightMale: criteria.minHeightMale || undefined,
          minArmReach: criteria.minArmReach || undefined,
          maxBMI: criteria.maxBMI || undefined,
          maxAge: criteria.maxAge || undefined,
          requiredCempnValidityMonths: criteria.requiredCempnValidityMonths || undefined,
          requiredSwimming: criteria.requiredSwimming,
          requiredLanguages,
        });
        
        setResults(matchResults);
      }
    } catch (error) {
      console.error(error);
      alert(t.eligibility.failedToFilter);
    } finally {
      setIsFiltering(false);
    }
  }

  async function handleExportPDF() {
    if (!selectedAirline || results.length === 0) return;
    
    // Only export eligible candidates (100% match)
    const eligibleIds = results.filter(r => r.isEligible).map(r => r.student.id);
    
    if (eligibleIds.length === 0) {
      alert(t.eligibility.noEligibleAlert);
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentIds: eligibleIds,
          airlineName: selectedAirline 
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AMTC_${selectedAirline}_Eligible_Candidates.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert(t.eligibility.failedToExport);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="page-title">{t.eligibility.title}</h1>
        <p className="text-slate-500 dark:text-cockpit-muted mt-1">{t.eligibility.subtitle}</p>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
          <div className="flex-1 w-full">
            <label className="label">{t.eligibility.selectAirline}</label>
            <select 
              className="select"
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
            >
              <option value="">{t.eligibility.chooseAirline}</option>
              {airlines.map(airline => (
                <option key={airline.id} value={airline.airlineName}>
                  {airline.airlineName}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleFilter}
            disabled={!selectedAirline || isFiltering}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center shrink-0"
          >
            {isFiltering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {t.eligibility.filterCandidates}
          </button>
          
          <button 
            onClick={handleExportPDF}
            disabled={!selectedAirline || results.length === 0 || isExporting}
            className="btn-gold flex items-center gap-2 w-full sm:w-auto justify-center shrink-0"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-amtc-navy" /> : <Download className="h-4 w-4 text-amtc-navy" />}
            {t.eligibility.exportPdf}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-cockpit-border">
            <h3 className="font-semibold text-amtc-navy dark:text-white">
              {t.eligibility.foundCandidates.replace("{count}", String(results.length))}
            </h3>
            <span className="text-sm font-medium text-slate-500 dark:text-cockpit-muted">
              {results.filter(r => r.isEligible).length} {t.eligibility.fullyEligible}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {results.map((result) => (
              <EligibilityCard key={result.student.id} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
