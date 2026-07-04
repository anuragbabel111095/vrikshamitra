"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Landmark, FileText, CheckSquare, Square, ArrowRight, HelpCircle, ShieldCheck } from "lucide-react";
import schemesData from "@/data/schemes.json";

interface Document {
  id: string;
  name: Record<string, string>;
}

interface Scheme {
  id: string;
  name: Record<string, string>;
  min_land_acres: number;
  max_land_acres: number;
  component: Record<string, string>;
  subsidy_amount: Record<string, string>;
  required_documents: Document[];
  application_steps: Record<string, string[]>;
  department: Record<string, string>;
}

export default function SchemesPage() {
  const router = useRouter();
  const { profile, language, savedPlan, saveScheme, toggleDocument, t, convertLandToAcres } = useApp();
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const [allDocs, setAllDocs] = useState<Document[]>([]);

  useEffect(() => {
    const acres = convertLandToAcres(profile.landSize || 0, profile.landUnit || "acre");
    
    // Filter schemes by land size requirements
    const matched = schemesData.filter((sch: any) => {
      // Check if land is within range (if no land size entered, match nothing or default to true, but here profile should be checked)
      const withinRange = acres >= sch.min_land_acres && acres <= sch.max_land_acres;
      
      // ST Tribal Sub-plan check
      if (sch.id === "tribal_agroforestry_subplan") {
        // Only show if tribal areas match (ST goal or custom check, let's keep it visible for tribal goal matching or if they select soil_improvement/income)
        return withinRange && (profile.goals.includes("income") || profile.goals.includes("soil_improvement"));
      }
      
      // Horticulture check
      if (sch.id === "horticulture_subsidy") {
        // Match if user goal includes fruit trees
        return withinRange && (profile.goals.includes("fruit") || profile.goals.includes("income"));
      }

      return withinRange;
    });

    setMatchedSchemes(matched as any[]);

    // Compile unique documents list across matched schemes
    const docMap = new Map<string, Document>();
    matched.forEach((sch: any) => {
      sch.required_documents.forEach((doc: any) => {
        docMap.set(doc.id, doc);
      });
    });
    setAllDocs(Array.from(docMap.values()));

    // Auto-select first matched scheme if none selected yet
    if (matched.length > 0 && !savedPlan.schemeId) {
      saveScheme(matched[0].id);
    }
  }, [profile, savedPlan.schemeId]);

  const handleSchemeSelect = (schemeId: string) => {
    saveScheme(schemeId);
  };

  const handleCheckboxToggle = (docId: string) => {
    toggleDocument(docId);
  };

  const activeScheme = matchedSchemes.find((s) => s.id === savedPlan.schemeId) || matchedSchemes[0];

  // Profile check
  const isProfileEmpty = !profile.district || !profile.soilType;

  if (isProfileEmpty) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-900/5 flex items-center justify-center text-emerald-900 shadow-inner">
          <Landmark className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950">
            {t("scheme_matcher_title")}
          </h1>
          <p className="text-sm md:text-base text-stone-600 font-medium max-w-md">
            Please fill your farm boundaries profile first so we can automatically match qualifying subsidies.
          </p>
        </div>
        <button
          onClick={() => router.push("/chat")}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-900 font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          {t("cta_start_chat")}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-emerald-900/10 pb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-emerald-950 flex items-center gap-2 leading-none">
          <Landmark className="w-8 h-8 text-amber-500" />
          {t("scheme_matcher_title")}
        </h1>
        <p className="text-sm md:text-base text-stone-500 font-semibold">
          Select matched subsidies for your farm boundary trees and verify required documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Matched Schemes Selector */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-extrabold text-emerald-950">
            {t("scheme_eligible")} ({matchedSchemes.length})
          </h2>

          <div className="flex flex-col gap-4">
            {matchedSchemes.map((sch) => {
              const isSelected = savedPlan.schemeId === sch.id;
              return (
                <div
                  key={sch.id}
                  onClick={() => handleSchemeSelect(sch.id)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col gap-3 shadow-sm ${
                    isSelected
                      ? "bg-white border-emerald-850 ring-2 ring-emerald-950/5"
                      : "bg-stone-50 border-stone-200 hover:bg-stone-100/50 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-extrabold text-base md:text-lg text-emerald-950 leading-snug">
                        {sch.name[language] || sch.name["en"]}
                      </h3>
                      <span className="text-xs text-stone-500 font-bold">
                        {sch.department[language] || sch.department["en"]}
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-emerald-850 bg-emerald-850" : "border-stone-350"
                      }`}
                      style={isSelected ? { borderColor: "#022c22", backgroundColor: "#022c22" } : {}}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-stone-150 pt-3 text-xs md:text-sm">
                    <div>
                      <span className="font-extrabold text-stone-400 uppercase tracking-wider block text-[10px]">Component</span>
                      <span className="font-bold text-stone-700 mt-1 block">
                        {sch.component[language] || sch.component["en"]}
                      </span>
                    </div>
                    <div>
                      <span className="font-extrabold text-stone-400 uppercase tracking-wider block text-[10px]">Estimated Subsidy Payout</span>
                      <span className="font-bold text-emerald-850 mt-1 block">
                        {sch.subsidy_amount[language] || sch.subsidy_amount["en"]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scheme Application Steps Details */}
          {activeScheme && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-1.5 border-b border-stone-100 pb-3">
                <FileText className="w-5 h-5 text-amber-500" />
                How to Apply for this Subsidy
              </h3>
              <ol className="flex flex-col gap-4">
                {(activeScheme.application_steps[language] || activeScheme.application_steps["en"]).map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-xs md:text-sm text-stone-600 font-semibold leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-emerald-900/5 text-emerald-950 font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right Side: Document Checklist Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-emerald-950 text-amber-50 rounded-3xl p-5 md:p-6 flex flex-col gap-5 shadow-lg">
            <h2 className="text-lg md:text-xl font-extrabold flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-amber-400" />
              {t("docs_checklist")}
            </h2>
            <p className="text-xs text-stone-200 leading-normal font-semibold">
              {t("checklist_placeholder")}
            </p>

            <div className="flex flex-col gap-3">
              {allDocs.map((doc) => {
                const isChecked = savedPlan.documentsChecked.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleCheckboxToggle(doc.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                      isChecked
                        ? "bg-amber-500 text-stone-900 border-amber-500"
                        : "bg-emerald-900/40 border-white/10 text-stone-300 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>{doc.name[language] || doc.name["en"]}</span>
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 shrink-0 stroke-[3px]" />
                    ) : (
                      <Square className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              <button
                onClick={() => router.push("/my-plan")}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-900 font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 text-sm"
                style={{ backgroundColor: "#F59E0B" }}
              >
                {t("generate_summary")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
