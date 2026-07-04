"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { Printer, Share2, ClipboardList, AlertTriangle, ArrowRight, Check, Landmark, Phone, Sparkles, Trash2 } from "lucide-react";
import speciesData from "@/data/species.json";
import schemesData from "@/data/schemes.json";
import nurseriesData from "@/data/nurseries.json";

export default function MyPlanPage() {
  const router = useRouter();
  const { profile, savedPlan, language, t, convertLandToAcres, clearPlan } = useApp();

  const [savedSpecies, setSavedSpecies] = useState<any[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [localNursery, setLocalNursery] = useState<any | null>(null);

  useEffect(() => {
    // Get saved species info
    const species = speciesData.filter((s) => savedPlan.speciesIds.includes(s.id));
    setSavedSpecies(species);

    // Get selected scheme info
    const scheme = schemesData.find((s) => s.id === savedPlan.schemeId);
    setSelectedScheme(scheme || null);

    // Get local nursery matching district
    if (profile.district) {
      const nursery = nurseriesData.find(
        (n) => n.district.toLowerCase() === profile.district.toLowerCase()
      );
      setLocalNursery(nursery || null);
    }
  }, [savedPlan, profile.district]);

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppShareUrl = () => {
    const acres = convertLandToAcres(profile.landSize, profile.landUnit);
    const treeNames = savedSpecies.map((s) => s.name[language] || s.name["en"]).join(", ") || "None";
    const schemeName = selectedScheme ? (selectedScheme.name[language] || selectedScheme.name["en"]) : "None";
    const nurseryName = localNursery ? (localNursery.name[language] || localNursery.name["en"]) : "None";
    const phone = localNursery ? localNursery.phone : "N/A";

    const text = `*VrikshaMitra Agroforestry Plan for Gujarat* 🌳
--------------------------------------------
*Farmer Profile:*
📍 District: ${profile.district || "N/A"} (${profile.taluka || "N/A"})
📐 Farm Boundary Size: ${profile.landSize} ${profile.landUnit} (${acres.toFixed(1)} Acres)
🌾 Soil Type: ${t(`soil_${profile.soilType}`) || "N/A"}
💧 Irrigation: ${t(`water_${profile.waterSource}`) || "N/A"}

*Selected Tree Species:*
🌱 ${treeNames}

*Government Scheme:*
🏛️ ${schemeName}

*Nearest Seedling Depot:*
📍 Depot: ${nurseryName} (Call: ${phone})

_Created on VrikshaMitra Agroforestry Platform_`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const hasPlan = savedPlan.speciesIds.length > 0;

  if (!hasPlan) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center text-center gap-6 print:hidden">
        <div className="w-20 h-20 rounded-full bg-emerald-900/5 flex items-center justify-center text-emerald-900 shadow-inner">
          <ClipboardList className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950">
            {t("my_plan_title")}
          </h1>
          <p className="text-sm md:text-base text-stone-600 font-medium max-w-md">
            {t("no_plan_yet")}
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

  const verifiedDocsCount = savedPlan.documentsChecked.length;
  const totalDocsCount = selectedScheme?.required_documents.length || 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-6 print:hidden">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-emerald-950 flex items-center gap-2 leading-none">
            <ClipboardList className="w-8 h-8 text-amber-500" />
            {t("my_plan_title")}
          </h1>
          <p className="text-sm md:text-base text-stone-500 font-semibold">
            Save or print your personalized boundary plan with nurseries and document checklist statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Clear / Start New Plan button */}
          <button
            onClick={() => {
              clearPlan();
              router.push("/chat");
            }}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-xs md:text-sm border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Clear Plan
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 active:bg-stone-400 text-stone-850 font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-xs md:text-sm border border-stone-300"
          >
            <Printer className="w-4 h-4" />
            {t("print_btn")}
          </button>
          
          {/* Share WhatsApp button */}
          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-850 hover:bg-emerald-900 active:bg-emerald-950 text-amber-50 font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs md:text-sm"
            style={{ backgroundColor: "#022c22" }}
          >
            <Share2 className="w-4 h-4" />
            {t("whatsapp_share")}
          </a>
        </div>
      </div>

      {/* Styled Printable Summary layout */}
      <div className="flex flex-col gap-8 print:gap-6 print:p-0">
        
        {/* Profile Details Sheet */}
        <section className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm print:shadow-none print:border-stone-300">
          <h2 className="text-lg md:text-xl font-extrabold text-emerald-950 flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500 print:hidden" />
            1. Farmer & Farm Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs md:text-sm">
            <div>
              <span className="font-extrabold text-stone-400 uppercase tracking-wider block text-[10px] print:text-stone-500">Location</span>
              <span className="font-bold text-stone-800 mt-1 block">
                {profile.district || "N/A"} ({profile.taluka || "N/A"})
              </span>
            </div>
            <div>
              <span className="font-extrabold text-stone-400 uppercase tracking-wider block text-[10px] print:text-stone-500">Land Area</span>
              <span className="font-bold text-stone-800 mt-1 block">
                {profile.landSize} {profile.landUnit} ({convertLandToAcres(profile.landSize, profile.landUnit).toFixed(1)} Acres)
              </span>
            </div>
            <div>
              <span className="font-extrabold text-stone-400 uppercase tracking-wider block text-[10px] print:text-stone-500">Soil Condition</span>
              <span className="font-bold text-stone-800 mt-1 block">
                {t(`soil_${profile.soilType}`) || "N/A"}
              </span>
            </div>
            <div>
              <span className="font-extrabold text-stone-400 uppercase tracking-wider block text-[10px] print:text-stone-500">Irrigation Setup</span>
              <span className="font-bold text-stone-800 mt-1 block">
                {t(`water_${profile.waterSource}`) || "N/A"}
              </span>
            </div>
          </div>
        </section>

        {/* Selected Tree Species */}
        <section className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm print:shadow-none print:border-stone-300">
          <h2 className="text-lg md:text-xl font-extrabold text-emerald-950 flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
            <span className="w-5 h-5 bg-emerald-900/10 text-emerald-950 rounded-lg flex items-center justify-center text-xs print:hidden">🌳</span>
            2. Selected Tree Species
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedSpecies.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="font-extrabold text-stone-800 text-sm md:text-base">
                    {s.name[language] || s.name["en"]}
                  </h3>
                  <span className="text-xs text-stone-500 font-bold">
                    Harvest Timeline: {s.harvest_cycle_years} Years Cycle
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/species/${s.id}`)}
                  className="px-3 py-1 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 font-bold text-xs rounded-lg shadow-sm print:hidden"
                >
                  View timeline
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Scheme Details */}
        <section className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm print:shadow-none print:border-stone-300">
          <h2 className="text-lg md:text-xl font-extrabold text-emerald-950 flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
            <Landmark className="w-5 h-5 text-amber-500 print:hidden" />
            3. Chosen Subsidy Scheme
          </h2>
          {selectedScheme ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col">
                  <h3 className="font-extrabold text-stone-850 text-base md:text-lg">
                    {selectedScheme.name[language] || selectedScheme.name["en"]}
                  </h3>
                  <span className="text-xs text-stone-500 font-semibold">
                    {selectedScheme.department[language] || selectedScheme.department["en"]}
                  </span>
                </div>
                <div className="bg-emerald-900/5 text-emerald-950 px-3.5 py-1.5 rounded-xl border border-emerald-900/10 font-bold text-xs md:text-sm">
                  {selectedScheme.component[language] || selectedScheme.component["en"]}
                </div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-150 rounded-2xl flex flex-col gap-2">
                <span className="text-xs text-stone-400 font-extrabold uppercase tracking-tight">Approved Subsidy Benefits</span>
                <p className="font-black text-emerald-850 text-sm md:text-base">
                  {selectedScheme.subsidy_amount[language] || selectedScheme.subsidy_amount["en"]}
                </p>
              </div>

              {/* Document Checklist verification summary */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-stone-600">Documents Verification Status</span>
                  <span className="text-xs font-black text-emerald-850">
                    {verifiedDocsCount} of {totalDocsCount} Prepared
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {selectedScheme.required_documents.map((doc: any) => {
                    const isChecked = savedPlan.documentsChecked.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isChecked
                            ? "bg-emerald-900/5 border-emerald-850/20 text-emerald-950"
                            : "bg-stone-50 border-stone-200 text-stone-500"
                        }`}
                      >
                        <span className="font-bold">{doc.name[language] || doc.name["en"]}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-emerald-850 border-emerald-850 text-white" : "border-stone-400"
                          }`}
                          style={isChecked ? { backgroundColor: "#022c22", borderColor: "#022c22" } : {}}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-stone-50 rounded-2xl text-center text-stone-500 text-xs md:text-sm font-semibold border border-stone-200/60 print:border-stone-300">
              No matching government subsidy linked to this plan yet. Go to Schemes finder to select.
            </div>
          )}
        </section>

        {/* Localized Forest Nursery Contact details */}
        <section className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm print:shadow-none print:border-stone-300">
          <h2 className="text-lg md:text-xl font-extrabold text-emerald-950 flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
            <span className="w-5 h-5 bg-amber-500/10 text-amber-700 rounded-lg flex items-center justify-center text-xs print:hidden">📍</span>
            4. Local Seedling Nursery Depot
          </h2>
          {localNursery ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-stone-850 text-sm md:text-base">
                  {localNursery.name[language] || localNursery.name["en"]}
                </h3>
                <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                  {localNursery.address[language] || localNursery.address["en"]}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${localNursery.phone}`}
                  className="px-4 py-2.5 bg-emerald-900/5 hover:bg-emerald-900/10 border border-emerald-950/10 text-emerald-950 font-bold rounded-xl flex items-center gap-1.5 text-xs md:text-sm print:hidden"
                >
                  <Phone className="w-4 h-4" />
                  Call Depot
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-stone-50 rounded-2xl text-center text-stone-500 text-xs md:text-sm font-semibold border border-stone-200/60 print:border-stone-300">
              No local depot matches in {profile.district} district. Select Nurseries on the tab bar to explore.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
