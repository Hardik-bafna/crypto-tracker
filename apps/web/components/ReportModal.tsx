"use client";

import React, { useState, useEffect } from "react";
import { Investigation, InvestigationReport } from "@crypto-tracer/types";
import { fetchInvestigationReport } from "../lib/api";
import { ReportGenerator } from "@crypto-tracer/ai";
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  X,
  Shield,
  Scale,
} from "lucide-react";

interface Props {
  investigation: Investigation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<Props> = ({
  investigation,
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (investigation && isOpen) {
      const generated = ReportGenerator.generateReport(investigation);
      setReport(generated);
    }
  }, [investigation, isOpen]);

  if (!isOpen || !investigation || !report) return null;

  const markdownContent = ReportGenerator.formatToMarkdown(report);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-surface border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-gray-800 flex items-center justify-between bg-surface/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
              <Scale className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Judicial Investigation Dossier
              </h3>
              <p className="text-[10px] text-gray-400">
                Case Reference: {report.caseNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Markdown" : "Copy Markdown"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 text-gray-300 font-sans text-xs leading-relaxed">
          {/* Executive Brief Box */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-400 tracking-wider block">
                  Forensic Investigation Brief
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {report.title}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800">
                  {report.riskAssessment.riskLevel} RISK ({report.riskAssessment.overallScore}/100)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Investigator</span>
                <span className="text-gray-200 font-medium">{report.investigatorName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Network</span>
                <span className="text-gray-200 font-medium uppercase">{report.chain}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Date</span>
                <span className="text-gray-200 font-medium">{report.generatedAt.toISOString().slice(0, 10)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Target</span>
                <span className="text-gray-200 font-mono text-[11px] truncate block">{report.target}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-white tracking-wider border-b border-gray-800 pb-1">
              1. Executive Summary
            </h3>
            <div className="whitespace-pre-wrap text-gray-300 p-4 rounded-xl bg-gray-900/50 border border-gray-800/80 font-mono text-[11px] leading-relaxed">
              {report.executiveSummary}
            </div>
          </div>

          {/* Section 2: Observed Facts vs Inferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-white tracking-wider border-b border-gray-800 pb-1">
                2. Observed Facts (Deterministic Ledger)
              </h3>
              <ul className="space-y-1.5 p-4 rounded-xl bg-gray-900/50 border border-gray-800/80 text-[11px]">
                {report.observedFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-400 font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-white tracking-wider border-b border-gray-800 pb-1">
                3. Analytical Inferences
              </h3>
              <ul className="space-y-1.5 p-4 rounded-xl bg-gray-900/50 border border-gray-800/80 text-[11px]">
                {report.inferences.map((inf, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{inf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Subpoena Recommendations */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-white tracking-wider border-b border-gray-800 pb-1">
              4. Subpoena & Legal Recommendations ({report.subpoenaRecommendations.length})
            </h3>
            <div className="space-y-3">
              {report.subpoenaRecommendations.map((sub, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {sub.entityName} ({sub.entityType})
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      {sub.urgency} URGENCY
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium">{sub.recommendedAction}</p>
                  <div className="pt-2 border-t border-gray-800/80">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                      Records to Request:
                    </span>
                    <ul className="space-y-1 text-[11px] text-gray-400">
                      {sub.targetInfoToRequest.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-gray-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
