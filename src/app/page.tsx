"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Sprout, Leaf, Award, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function Home() {
  const { t, language } = useApp();

  // Localized texts specific to landing details not fully covered in global translations dictionary
  const landingTexts = {
    trusted_by: {
      en: "Aligns with Gujarat Forest Department Nursery Subsidies & Central Government 'Har Medh Par Ped' Guidelines",
      hi: "गुजरात वन विभाग नर्सरी सब्सिडी और केंद्र सरकार के 'हर मेढ़ पर पेड़' दिशानिर्देशों के साथ संरेखित",
      gu: "ગુજરાત વન વિભાગ નર્સરી યોજના અને કેન્દ્ર સરકારની 'હર મેઢ પર પેડ' માર્ગદર્શિકા સાથે સુસંગત"
    },
    how_it_works: {
      en: "How VrikshaMitra Works",
      hi: "वृक्ष मित्र कैसे काम करता है",
      gu: "વૃક્ષમિત્ર કેવી રીતે કામ કરે છે"
    },
    quick_tips: {
      en: "Why Agroforestry on Bunds?",
      hi: "खेत की मेढ़ पर वानिकी क्यों?",
      gu: "શેઢા-પાળ પર જ વૃક્ષારોપણ શા માટે?"
    },
    tip1: {
      en: "Earn dual income: Sell high-value timber or fruits without sacrificing crop acreage.",
      hi: "दोहरी आय अर्जित करें: फसल की भूमि को प्रभावित किए बिना मूल्यवान लकड़ी या फल बेचें।",
      gu: "બેવડી આવક મેળવો: પાકનું વાવેતર ઘટાડ્યા વિના ઈમારતી લાકડું કે ફળોથી વધારાની કમાણી."
    },
    tip2: {
      en: "Protect crops: Tree roots hold soil moisture and act as natural windbreakers against heavy storms.",
      hi: "फसलों की सुरक्षा: पेड़ों की जड़ें मिट्टी की नमी बनाए रखती हैं और तूफान के खिलाफ प्राकृतिक हवा रोधक का काम करती हैं।",
      gu: "પાકનું રક્ષણ: વૃક્ષોના મૂળ જમીનનો ભેજ જાળવી રાખે છે અને પવન સામે રક્ષણ આપી પાક ઢળતો બચાવે છે."
    },
    tip3: {
      en: "Get government payouts: Earn direct subsidies for keeping trees alive on your boundaries.",
      hi: "सरकारी भुगतान प्राप्त करें: अपनी सीमाओं पर पेड़ों को जीवित रखने के लिए सीधे सब्सिडी अर्जित करें।",
      gu: "સરકારી સહાય: શેઢા પર વાવેલા વૃક્ષો બચાવવા માટે સીધા તમારા ખાતામાં સબસિડી મેળવો."
    }
  };

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 text-amber-50 px-6 py-12 md:px-12 md:py-20 shadow-2xl">
        {/* Soft abstract grid backgrounds */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -z-1"></div>
        <div className="absolute left-1/3 top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl -z-1"></div>

        <div className="relative z-10 max-w-3xl flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-850/30 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("quick_stats")}
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight max-w-2xl">
            {t("hero_title")}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-stone-200/90 leading-relaxed max-w-2xl font-medium">
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
            <Link
              href="/chat"
              className="px-8 py-4 rounded-xl font-extrabold text-stone-900 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 transition-all duration-200 shadow-xl flex items-center justify-center gap-2 group text-base md:text-lg"
              style={{ backgroundColor: "#F59E0B" }}
            >
              {t("cta_start_chat")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/nurseries"
              className="px-6 py-3.5 rounded-xl font-bold text-amber-100 hover:text-amber-50 hover:bg-white/10 border border-white/20 transition-all duration-200 text-center text-sm md:text-base"
            >
              {t("nurseries")}
            </Link>
          </div>
        </div>

        {/* Small trust signal footnote */}
        <div className="relative z-10 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs md:text-sm text-stone-300">
          <Award className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="font-semibold leading-snug">{landingTexts.trusted_by[language]}</span>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-950">
            {landingTexts.how_it_works[language]}
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" style={{ backgroundColor: "#D97706" }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-stone-50 border border-stone-200/60 p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 flex items-center justify-center text-emerald-900">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-emerald-950">{t("step1_title")}</h3>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed font-medium">
              {t("step1_desc")}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-stone-50 border border-stone-200/60 p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-emerald-950">{t("step2_title")}</h3>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed font-medium">
              {t("step2_desc")}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-stone-50 border border-stone-200/60 p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 flex items-center justify-center text-emerald-900">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-emerald-950">{t("step3_title")}</h3>
            <p className="text-sm md:text-base text-stone-600 leading-relaxed font-medium">
              {t("step3_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Agroforestry Benefits / Tips */}
      <section className="bg-amber-50/40 border border-amber-900/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold text-emerald-950">
            {landingTexts.quick_tips[language]}
          </h2>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed font-medium">
            Agroforestry integrates trees into crop systems. Planting compatible trees on boundaries (farm bunds) allows you to utilize spaces that are usually left uncultivated.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-2">
              <span className="text-emerald-800 font-bold shrink-0">✓</span>
              <p className="text-xs md:text-sm text-stone-600 font-semibold">{landingTexts.tip1[language]}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-800 font-bold shrink-0">✓</span>
              <p className="text-xs md:text-sm text-stone-600 font-semibold">{landingTexts.tip2[language]}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-800 font-bold shrink-0">✓</span>
              <p className="text-xs md:text-sm text-stone-600 font-semibold">{landingTexts.tip3[language]}</p>
            </div>
          </div>
        </div>

        {/* Decorative Abstract Farm Pattern SVG */}
        <div className="w-full md:w-1/2 flex justify-center">
          <svg className="w-64 h-64 text-emerald-800/20" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
            <path d="M40 140C70 140 80 120 100 120C120 120 130 140 160 140" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M40 160C70 160 80 140 100 140C120 140 130 160 160 160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M100 60V120" stroke="currentColor" strokeWidth="4" />
            <path d="M100 80C115 80 125 70 125 60C110 60 100 70 100 80Z" fill="currentColor" opacity="0.8" />
            <path d="M100 95C85 95 75 85 75 75C90 75 100 85 100 95Z" fill="currentColor" opacity="0.8" />
            <circle cx="100" cy="55" r="8" fill="currentColor" />
          </svg>
        </div>
      </section>
    </div>
  );
}
