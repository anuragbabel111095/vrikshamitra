"use client";

import React from "react";
import { useApp, Language } from "@/context/AppContext";
import { Globe } from "lucide-react";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useApp();

  const options: { code: Language; label: string; short: string }[] = [
    { code: "gu", label: "ગુજરાતી", short: "ગુ" },
    { code: "hi", label: "हिन्दी", short: "हि" },
    { code: "en", label: "English", short: "En" },
  ];

  return (
    <div className="flex items-center gap-1 bg-emerald-900/10 p-1 rounded-full border border-emerald-900/20">
      <div className="p-1.5 text-emerald-800 hidden xs:block">
        <Globe className="w-4 h-4" />
      </div>
      {options.map((opt) => {
        const isActive = language === opt.code;
        return (
          <button
            key={opt.code}
            onClick={() => setLanguage(opt.code)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-emerald-850 text-amber-50 shadow-md transform scale-105"
                : "text-emerald-850 hover:bg-emerald-900/5"
            }`}
            style={isActive ? { backgroundColor: "#022c22" } : {}}
            aria-label={`Change language to ${opt.label}`}
          >
            <span className="hidden sm:inline">{opt.label}</span>
            <span className="sm:hidden">{opt.short}</span>
          </button>
        );
      })}
    </div>
  );
};
