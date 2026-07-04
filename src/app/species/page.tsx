"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ArrowRight, Leaf, Sparkles, TrendingUp, HelpCircle, AlertTriangle } from "lucide-react";
import speciesData from "@/data/species.json";
import districtsData from "@/data/districts.json";

interface ScoredSpecies {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  image: string;
  harvest_cycle_years: number;
  water_need: string;
  score: number;
  matchReasons: string[];
  conflicts: string[];
  estValue: string;
}

export default function SpeciesPage() {
  const router = useRouter();
  const { profile, language, t, convertLandToAcres } = useApp();
  const [recommendations, setRecommendations] = useState<ScoredSpecies[]>([]);

  useEffect(() => {
    // If the profile is not filled yet, don't run recommendations
    if (!profile.district || !profile.soilType) return;

    // Get farmer's agro-climatic zone based on district
    const districtInfo = districtsData.find(
      (d) => d.name.toLowerCase() === profile.district.toLowerCase()
    );
    const farmerZone = districtInfo ? districtInfo.zone : "";

    const scored = speciesData
      .map((s: any) => {
        let score = 0;
        const reasons: string[] = [];
        const conflicts: string[] = [];

        // 1. Zone Match (Hard filter: if not in list, score -100)
        const isZoneMatch = s.zones.includes(farmerZone);
        if (!isZoneMatch) {
          score -= 100; // Not suitable for this agro-climatic zone
        } else {
          reasons.push(language === "gu" ? "✓ અનુકૂળ આબોહવા ઝોન" : language === "hi" ? "✓ अनुकूल जलवायु क्षेत्र" : "✓ Suitable agro-climatic zone");
        }

        // 2. Soil Match (+3 points)
        if (s.soil.includes(profile.soilType)) {
          score += 3;
          reasons.push(t(`soil_${profile.soilType}`) + " " + (language === "gu" ? "માટી સુસંગત" : language === "hi" ? "मिट्टी के अनुकूल" : "Soil compatible"));
        }

        // 3. Water Need vs Irrigation (+3 points)
        const waterNeed = s.water_need; // low, medium
        const irrigation = profile.waterSource; // rainfed, well, canal, drip
        
        if (waterNeed === "low") {
          score += 3;
          reasons.push(language === "gu" ? "✓ ઓછી પાણીની જરૂરિયાત" : language === "hi" ? "✓ कम पानी की आवश्यकता" : "✓ Low water requirement");
        } else if (waterNeed === "medium") {
          if (irrigation === "well" || irrigation === "canal" || irrigation === "drip") {
            score += 3;
            reasons.push(language === "gu" ? "✓ પિયતની સગવડ ઉપલબ્ધ" : language === "hi" ? "✓ सिंचाई व्यवस्था उपलब्ध" : "✓ Irrigation matches needs");
          } else {
            // Rainfed only - medium water need tree is risky
            score -= 1;
            conflicts.push(language === "gu" ? "⚠ પાણીની વધુ જરૂર પડી શકે છે" : language === "hi" ? "⚠ अधिक पानी की आवश्यकता हो सकती है" : "⚠ May require extra irrigation");
          }
        }

        // 4. Goal Match (+2 points per matched goal)
        let goalMatches = 0;
        s.goals.forEach((g: string) => {
          if (profile.goals.includes(g)) {
            score += 2;
            goalMatches++;
          }
        });
        if (goalMatches > 0) {
          reasons.push(
            language === "gu" 
              ? `✓ લક્ષ્ય મેળ ખાધું (${goalMatches})` 
              : language === "hi" 
              ? `✓ उद्देश्य मेल खाया (${goalMatches})` 
              : `✓ Goal matched (${goalMatches})`
          );
        }

        // 5. Crop Compatibility (Conflict: -5 points, no conflict/good with: +2 points)
        const goodWith = s.crop_compatibility.good_with || [];
        const avoidWith = s.crop_compatibility.avoid_with || [];

        // Check if any of growing crops conflict
        let hasConflict = false;
        profile.currentCrops.forEach((c) => {
          if (avoidWith.includes(c)) {
            hasConflict = true;
          }
        });

        // Check if any crops are highly compatible
        let hasGoodComp = false;
        profile.currentCrops.forEach((c) => {
          if (goodWith.includes(c)) {
            hasGoodComp = true;
          }
        });

        if (hasConflict) {
          score -= 5;
          conflicts.push(language === "gu" ? "⚠ પાક સાથે સંઘર્ષનું જોખમ" : language === "hi" ? "⚠ फसल संघर्ष का जोखिम" : "⚠ Crop compatibility risk");
        } else if (hasGoodComp) {
          score += 2;
          reasons.push(language === "gu" ? "✓ મુખ્ય પાક સાથે શ્રેષ્ઠ સુસંગત" : language === "hi" ? "✓ मुख्य फसल के साथ संगत" : "✓ Excellent crop companion");
        } else if (profile.currentCrops.length > 0) {
          score += 1; // Neutral/Safe
          reasons.push(language === "gu" ? "✓ પાક માટે સુરક્ષિત" : language === "hi" ? "✓ फसलों के लिए सुरक्षित" : "✓ Safe with current crops");
        }

        // Standardize Score percentage (Scale from -5 to 15 to a percentage 0 - 100)
        let percentScore = Math.round(((score + 5) / 20) * 100);
        if (percentScore > 100) percentScore = 100;
        if (percentScore < 0) percentScore = 0;

        // If zone is not matched, force score to a lower percentage
        if (!isZoneMatch) percentScore = Math.max(0, percentScore - 60);

        // Estimate revenue
        const lastTimeline = s.income_timeline[s.income_timeline.length - 1];
        const acres = convertLandToAcres(profile.landSize, profile.landUnit);
        const totalEstValue = lastTimeline ? Math.round(lastTimeline.est_value_per_acre_inr * Math.max(1, acres)) : 0;
        const estValueText = totalEstValue > 0 
          ? `Rs. ${totalEstValue.toLocaleString("en-IN")}`
          : "N/A";

        return {
          id: s.id,
          name: s.name,
          description: s.description,
          image: s.image,
          harvest_cycle_years: s.harvest_cycle_years,
          water_need: s.water_need,
          score: percentScore,
          matchReasons: reasons.slice(0, 3), // max 3 tags
          conflicts,
          estValue: estValueText,
        };
      })
      // Filter out total mismatches (score below 20%) unless all are low
      .sort((a, b) => b.score - a.score);

    setRecommendations(scored);
  }, [profile, language]);

  // Profile check
  const isProfileEmpty = !profile.district || !profile.soilType;

  if (isProfileEmpty) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-900/5 flex items-center justify-center text-emerald-900 shadow-inner">
          <Leaf className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-950">
            {t("rec_title")}
          </h1>
          <p className="text-sm md:text-base text-stone-600 font-medium max-w-md">
            Please chat with VrikshaMitra and answer a few questions about your farm boundaries so we can display your recommendations.
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-emerald-900/10 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-emerald-950 flex items-center gap-2 leading-none">
            <Sparkles className="w-8 h-8 text-amber-500" />
            {t("rec_title")}
          </h1>
          <p className="text-sm md:text-base text-stone-500 font-medium">
            {t("rec_subtitle")}
          </p>
        </div>
        <div className="bg-emerald-950 text-amber-50 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold shadow-sm">
          <span>{profile.district} • {t(`soil_${profile.soilType}`)} • {profile.landSize} {profile.landUnit}</span>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => {
          const isHighMatch = rec.score >= 70;
          return (
            <div
              key={rec.id}
              className="bg-white border border-stone-200 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Graphic Header Panel instead of image placeholders */}
              <div
                className="h-36 relative flex items-end p-4 text-white"
                style={{ background: rec.image }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col leading-tight">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                    {rec.harvest_cycle_years} {t("years")} {t("harvest_cycle")}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black">
                    {rec.name[language] || rec.name["en"]}
                  </h2>
                </div>
                
                {/* Score badge */}
                <div className="absolute right-4 top-4 bg-stone-50/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex flex-col items-center leading-none text-emerald-950 border border-emerald-900/10 shadow-md">
                  <span className="text-[10px] font-extrabold text-stone-500 tracking-tight uppercase">{t("match_score")}</span>
                  <span className="text-sm font-black text-emerald-850 mt-0.5">{rec.score}%</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col gap-4">
                <p className="text-xs md:text-sm text-stone-600 line-clamp-2 font-medium">
                  {rec.description[language] || rec.description["en"]}
                </p>

                {/* Match Reason tags */}
                <div className="flex flex-col gap-1.5">
                  {rec.matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-xs font-bold text-emerald-900 bg-emerald-900/5 px-2.5 py-1 rounded-lg border border-emerald-900/10"
                    >
                      {reason}
                    </span>
                  ))}
                  {rec.conflicts.map((conflict, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                      {conflict}
                    </span>
                  ))}
                </div>

                {/* Income Quick summary */}
                <div className="bg-stone-50 border border-stone-150 p-3 rounded-xl flex items-center justify-between mt-auto">
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">Est. Harvest Income</span>
                    <span className="text-base font-black text-emerald-850 mt-1">{rec.estValue}</span>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-800" />
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="border-t border-stone-100 p-4 bg-stone-50/50">
                <button
                  onClick={() => router.push(`/species/${rec.id}`)}
                  className="w-full py-2.5 rounded-xl text-xs md:text-sm font-extrabold text-stone-900 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                >
                  {t("view_details")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
