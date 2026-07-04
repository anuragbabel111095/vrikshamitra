"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Home, MessageSquareCode, ClipboardList, MapPin, LayoutDashboard } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { t } = useApp();

  const navItems = [
    { label: t("home"), path: "/", icon: Home },
    { label: t("chat"), path: "/chat", icon: MessageSquareCode },
    { label: t("my_plan"), path: "/my-plan", icon: ClipboardList },
    { label: t("nurseries"), path: "/nurseries", icon: MapPin },
  ];

  return (
    <>
      {/* Top Header for Desktop & Mobile */}
      <header className="sticky top-0 z-40 w-full bg-stone-50/95 backdrop-blur-md border-b border-emerald-900/10 px-4 py-3 md:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-emerald-850 flex items-center justify-center text-amber-50 font-bold text-lg group-hover:scale-105 transition-transform" style={{ backgroundColor: "#022c22" }}>
              V
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl md:text-2xl text-emerald-950 tracking-tight leading-none">
                {t("brand_name")}
              </span>
              <span className="text-[10px] md:text-xs text-stone-500 font-medium">
                {t("brand_tagline")}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 py-1 px-3 rounded-md ${
                    isActive
                      ? "text-emerald-950 bg-emerald-900/5 font-bold"
                      : "text-stone-600 hover:text-emerald-950 hover:bg-emerald-900/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 py-1 px-3 rounded-md ${
                pathname === "/dashboard"
                  ? "text-emerald-950 bg-emerald-900/5 font-bold"
                  : "text-stone-600 hover:text-emerald-950 hover:bg-emerald-900/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t("dashboard")}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Bottom Nav Bar for Mobile Devices */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-50/95 backdrop-blur-md border-t border-emerald-900/10 shadow-lg px-2 pb-safe-bottom">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] justify-center ${
                  isActive
                    ? "text-emerald-950 bg-emerald-900/5 scale-105 font-bold"
                    : "text-stone-500 hover:text-emerald-950"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-950 stroke-[2.5px]" : "stroke-[2px]"}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
          {/* Officer Dashboard option on bottom nav bar too */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] justify-center ${
              pathname === "/dashboard"
                ? "text-emerald-950 bg-emerald-900/5 scale-105 font-bold"
                : "text-stone-500 hover:text-emerald-950"
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${pathname === "/dashboard" ? "text-emerald-950 stroke-[2.5px]" : "stroke-[2px]"}`} />
            <span className="text-[10px] tracking-tight">{t("dashboard")}</span>
          </Link>
        </nav>
      </div>
    </>
  );
};
