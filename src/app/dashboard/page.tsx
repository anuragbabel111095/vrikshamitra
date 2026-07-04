"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Lock, Eye, EyeOff, LayoutDashboard, TrendingUp, Users, Sprout, Landmark, ShieldCheck, HelpCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from "recharts";

// Mock Data for Dashboard Charts
const districtSpeciesData = [
  { name: "Rajkot", Subabul: 420, Neem: 310, Sagwan: 150 },
  { name: "Junagadh", Mango: 550, Subabul: 180, Sagwan: 320 },
  { name: "Mehsana", Subabul: 280, Amla: 390, Ber: 240 },
  { name: "Surat", Eucalyptus: 610, Casuarina: 485, Teak: 220 },
  { name: "Kutch", Babul: 520, Ber: 350, Amla: 190 },
  { name: "Anand", Melia_Dubia: 380, Subabul: 410, Mango: 200 }
];

const funnelData = [
  { name: "Profile Started", Farmers: 1420 },
  { name: "Viewed Matches", Farmers: 1150 },
  { name: "Scheme Linked", Farmers: 780 },
  { name: "Checklist Checked", Farmers: 510 },
  { name: "Printed/Shared", Farmers: 340 }
];

const recentQueries = [
  { id: 1, date: "2026-07-03", district: "Rajkot", crop: "Groundnut", query: "Can I grow eucalyptus with groundnut?", language: "Gujarati", status: "Resolved" },
  { id: 2, date: "2026-07-03", district: "Junagadh", crop: "Mango", query: "How much water does Sitafal need?", language: "Gujarati", status: "Resolved" },
  { id: 3, date: "2026-07-02", district: "Surat", crop: "Sugarcane", query: "Subsidy checklist for Har Medh Par Ped", language: "English", status: "Resolved" },
  { id: 4, date: "2026-07-02", district: "Mehsana", crop: "Wheat", query: "Is subabul leaves safe for buffalo fodder?", language: "Hindi", status: "Resolved" },
  { id: 5, date: "2026-07-01", district: "Kutch", crop: "Millet", query: "Best tree for dry soil windbreak", language: "Gujarati", status: "Resolved" }
];

export default function OfficerDashboard() {
  const { t } = useApp();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "gujaratforest") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid officer passcode. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-900/10 flex items-center justify-center text-emerald-950">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
              Officer Portal
            </h1>
            <p className="text-xs text-stone-500 font-semibold max-w-xs">
              Access aggregated agroforestry statistics, district logs, and subsidy application funnels.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-stone-600 uppercase tracking-wide">
                Enter Officer Passcode
              </label>
              <div className="relative flex items-center bg-stone-50 border border-stone-300 rounded-xl px-3 py-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. gujaratforest"
                  className="flex-1 bg-transparent text-sm text-stone-750 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginError && <p className="text-xs text-red-600 font-bold">{loginError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-850 hover:bg-emerald-900 active:bg-emerald-950 text-amber-50 font-extrabold rounded-xl transition-all shadow-md text-sm"
              style={{ backgroundColor: "#022c22" }}
            >
              Verify Officer Passcode
            </button>
          </form>

          <div className="border-t border-stone-100 pt-4 text-center">
            <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">
              Secured for Forest Department officials
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-emerald-900/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-emerald-950 flex items-center gap-2 leading-none">
            <LayoutDashboard className="w-8 h-8 text-amber-500" />
            Officer Advisory Dashboard
          </h1>
          <p className="text-sm md:text-base text-stone-500 font-semibold">
            Aggregated system metrics for VrikshaMitra Agroforestry program in Gujarat.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 border border-stone-300 text-stone-600 font-bold hover:bg-stone-50 rounded-xl text-xs"
          >
            Logout Portal
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-900/10 text-emerald-950 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">Active Farmer Sessions</span>
            <span className="text-2xl font-black text-emerald-950 mt-1">1,420</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">Saplings Pledged</span>
            <span className="text-2xl font-black text-emerald-950 mt-1">48,200</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-900/10 text-emerald-950 rounded-xl flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">Subsidies Matched</span>
            <span className="text-2xl font-black text-emerald-950 mt-1">₹3.4L</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-tight">Document Checklists Verified</span>
            <span className="text-2xl font-black text-emerald-950 mt-1">510</span>
          </div>
        </div>
      </section>

      {/* Row of Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* District popular species */}
        <div className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col">
            <h3 className="font-extrabold text-emerald-950 text-base flex items-center gap-1">
              <TrendingUp className="w-5 h-5 text-emerald-850" />
              Most Requested Species by District
            </h3>
            <span className="text-[10px] text-stone-400 font-semibold mt-0.5">Top tree varieties queried during guided chat.</span>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtSpeciesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" fontSize={11} stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#888888" tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Subabul" fill="#047857" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Neem" fill="#eab308" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Sagwan" fill="#a16207" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col">
            <h3 className="font-extrabold text-emerald-950 text-base flex items-center gap-1">
              <TrendingUp className="w-5 h-5 text-emerald-850" />
              Scheme Application Funnel
            </h3>
            <span className="text-[10px] text-stone-400 font-semibold mt-0.5">Farmer conversion rates from profiling to summary print.</span>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" fontSize={10} stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#888888" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Farmers" stroke="#047857" fill="#047857" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>

      {/* Recent Queries Table */}
      <section className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm overflow-x-auto flex flex-col gap-4">
        <div className="flex flex-col">
          <h3 className="font-extrabold text-emerald-950 text-base flex items-center gap-1">
            <HelpCircle className="w-5 h-5 text-emerald-850" />
            Recent Farmer Advisory Queries
          </h3>
          <span className="text-[10px] text-stone-400 font-semibold mt-0.5">Recent conversational log entries captured anonymously.</span>
        </div>

        <table className="min-w-full text-xs md:text-sm text-stone-600 font-semibold mt-2">
          <thead>
            <tr className="border-b border-stone-150 text-[10px] uppercase text-stone-400 tracking-wider text-left">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">District</th>
              <th className="py-2.5 px-3">Main Crop</th>
              <th className="py-2.5 px-3">Advisory Query</th>
              <th className="py-2.5 px-3">Language</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {recentQueries.map((q) => (
              <tr key={q.id} className="hover:bg-stone-50/50">
                <td className="py-3 px-3 text-stone-500 font-medium">{q.date}</td>
                <td className="py-3 px-3 text-stone-800 font-bold">{q.district}</td>
                <td className="py-3 px-3">{q.crop}</td>
                <td className="py-3 px-3 text-stone-700 italic font-medium max-w-xs truncate">{q.query}</td>
                <td className="py-3 px-3">{q.language}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 bg-emerald-900/10 text-emerald-950 rounded-full font-bold text-[10px]">
                    {q.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}
