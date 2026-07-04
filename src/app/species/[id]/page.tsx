"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Check, Plus, Calendar, AlertTriangle, ShieldCheck, Landmark, Droplets, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import speciesData from "@/data/species.json";

interface IncomeTimelineItem {
  year: number;
  yield: string;
  est_value_per_acre_inr: number;
}

interface CropCompatibility {
  good_with: string[];
  avoid_with: string[];
}

interface Species {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  zones: string[];
  soil: string[];
  water_need: string;
  goals: string[];
  harvest_cycle_years: number;
  income_timeline: IncomeTimelineItem[];
  crop_compatibility: CropCompatibility;
  image: string;
}

export default function SpeciesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, profile, savedPlan, saveSpecies, removeSpecies, t, convertLandToAcres } = useApp();
  const [species, setSpecies] = useState<Species | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const found = speciesData.find((s) => s.id === id);
    if (found) {
      setSpecies(found as any);
    }
  }, [params.id]);

  if (!species) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <p className="text-stone-500 font-medium">{t("loading")}</p>
      </div>
    );
  }

  const isSaved = savedPlan.speciesIds.includes(species.id);
  const acres = convertLandToAcres(profile.landSize || 1, profile.landUnit || "acre");

  // Recharts Data Setup
  const chartData = species.income_timeline.map((item) => ({
    name: `${t("years")} ${item.year}`,
    income: item.est_value_per_acre_inr * Math.max(1, acres),
    yieldDesc: item.yield
  }));

  const handleSaveToggle = () => {
    if (isSaved) {
      removeSpecies(species.id);
    } else {
      saveSpecies(species.id);
    }
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-emerald-950 text-amber-50 p-3 rounded-xl border border-amber-500/20 shadow-lg text-xs md:text-sm">
          <p className="font-extrabold">{data.name}</p>
          <p className="font-bold text-amber-300 mt-1">Est. Income: Rs. {data.income.toLocaleString("en-IN")}</p>
          <p className="text-stone-300 text-[11px] mt-1 italic">{data.yieldDesc}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto">
      {/* Back navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-stone-600 hover:text-emerald-950 font-bold transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </button>

        <button
          onClick={handleSaveToggle}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold shadow-sm transition-all duration-200 border ${
            isSaved
              ? "bg-emerald-950 text-amber-50 border-emerald-950"
              : "bg-white text-stone-700 hover:bg-stone-50 border-stone-300"
          }`}
          style={isSaved ? { backgroundColor: "#022c22" } : {}}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 stroke-[3px]" />
              {t("saved")}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Save to My Plan
            </>
          )}
        </button>
      </div>

      {/* Hero Visual Card */}
      <section
        className="rounded-3xl p-6 md:p-8 text-amber-50 relative overflow-hidden flex flex-col justify-end min-h-[220px] shadow-lg"
        style={{ background: species.image }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"></div>
        <div className="relative z-10 flex flex-col gap-2">
          <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-900 shadow-sm leading-none uppercase">
            {species.harvest_cycle_years} {t("years")} Cycle
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mt-1">
            {species.name[language] || species.name["en"]}
          </h1>
          <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-semibold max-w-2xl mt-1">
            {species.description[language] || species.description["en"]}
          </p>
        </div>
      </section>

      {/* Grid Specs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Soil requirements */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-emerald-850 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">Suitable Soil Type</span>
            <span className="text-sm font-bold text-stone-750 mt-1 capitalize leading-snug">
              {species.soil.map((s) => t(`soil_${s}`) || s).join(", ")}
            </span>
          </div>
        </div>

        {/* Water needs */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Droplets className="w-5 h-5 text-emerald-850 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">Water Requirements</span>
            <span className="text-sm font-bold text-stone-750 mt-1 capitalize leading-snug">
              {species.water_need === "low" ? "Low (Drought Resistant)" : "Medium (Regular Irrigation)"}
            </span>
          </div>
        </div>

        {/* Suitable Zones */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <Landmark className="w-5 h-5 text-emerald-850 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">Gujarat Zones</span>
            <span className="text-sm font-bold text-stone-750 mt-1 leading-snug">
              {species.zones.join(", ")}
            </span>
          </div>
        </div>
      </section>

      {/* Income Projections Recharts Area */}
      <section className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg md:text-xl font-extrabold text-emerald-950 flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-amber-500" />
            {t("income_timeline_title")}
          </h2>
          <p className="text-xs text-stone-500 font-semibold">
            Estimates calculated for {acres.toFixed(1)} boundary acres ({profile.landSize || 1} {profile.landUnit}).
          </p>
        </div>

        {/* Recharts chart wrapper */}
        <div className="h-64 md:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={customTooltip} />
              <Bar dataKey="income" fill="#047857" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Crops Compatibility & Warning details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Companion crops */}
        <div className="bg-emerald-900/5 border border-emerald-900/10 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="font-extrabold text-emerald-950 text-base">{t("good_cop_title")}</h3>
          {species.crop_compatibility.good_with.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {species.crop_compatibility.good_with.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 bg-white text-emerald-950 font-bold border border-emerald-900/10 text-xs rounded-full shadow-sm"
                >
                  {t(`crop_${c}`) || c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-stone-500 font-semibold leading-relaxed">
              Safe with all crops on farm bunds. Safe for multi-tier boundary cultivation.
            </p>
          )}
          <p className="text-xs text-stone-500 font-semibold leading-relaxed mt-1">
            Planting these boundary trees does not compete with crop nutrition, and provides nitrogen fixes or light wind protection.
          </p>
        </div>

        {/* Avoid crops */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="font-extrabold text-amber-900 text-base flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {t("avoid_warning")}
          </h3>
          {species.crop_compatibility.avoid_with.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {species.crop_compatibility.avoid_with.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 bg-white text-amber-900 font-bold border border-amber-500/20 text-xs rounded-full shadow-sm"
                >
                  {t(`crop_${c}`) || c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-stone-500 font-semibold leading-relaxed">
              No crop conflicts. Suitable to grow beside any typical Gujarat cash crops.
            </p>
          )}
          <p className="text-xs text-stone-500 font-semibold leading-relaxed mt-1">
            Ensure spacing is kept at least 2.5 meters between trees and the outer crop row to prevent canopy shade.
          </p>
        </div>
      </section>

      {/* Care instructions */}
      <section className="bg-stone-50 border border-stone-200 rounded-2xl p-5 md:p-6 flex items-start gap-4">
        <ShieldCheck className="w-8 h-8 text-emerald-850 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-2">
          <h3 className="font-extrabold text-emerald-950 text-base">
            {t("care_instructions")}
          </h3>
          <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-semibold">
            {t("care_desc")}
          </p>
        </div>
      </section>

      {/* Action navigation to Scheme Matcher page */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => router.push("/schemes")}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-900 font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-sm md:text-base"
        >
          Check Matching Schemes
          < Landmark className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
