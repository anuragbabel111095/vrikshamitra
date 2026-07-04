"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MapPin, Phone, Compass, Search, Map } from "lucide-react";
import nurseriesData from "@/data/nurseries.json";
import districtsData from "@/data/districts.json";

interface Nursery {
  id: string;
  name: Record<string, string>;
  district: string;
  lat: number;
  lng: number;
  phone: string;
  address: Record<string, string>;
}

export default function NurseriesPage() {
  const { profile, language, t } = useApp();
  const [districtFilter, setDistrictFilter] = useState("");
  const [activeNursery, setActiveNursery] = useState<Nursery | null>(null);
  const [filteredNurseries, setFilteredNurseries] = useState<Nursery[]>([]);

  // Initialize filter based on farmer profile district
  useEffect(() => {
    if (profile.district) {
      setDistrictFilter(profile.district);
    } else {
      setDistrictFilter("Ahmedabad"); // Default initial filter
    }
  }, [profile.district]);

  // Filter nurseries based on selection
  useEffect(() => {
    let result = nurseriesData as Nursery[];
    if (districtFilter) {
      result = (nurseriesData as Nursery[]).filter(
        (n) => n.district.toLowerCase() === districtFilter.toLowerCase()
      );
    }
    setFilteredNurseries(result);

    // Auto set the first nursery of the filtered list as active
    if (result.length > 0) {
      setActiveNursery(result[0]);
    } else {
      setActiveNursery(null);
    }
  }, [districtFilter]);

  // Get Map iframe source with active coordinates
  const getMapIframeUrl = () => {
    if (activeNursery) {
      const { lat, lng } = activeNursery;
      // Setup bounding box for OSM embed
      const delta = 0.01;
      const minLng = lng - delta;
      const maxLng = lng + delta;
      const minLat = lat - delta;
      const maxLat = lat + delta;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
    }
    // Default fallback to central Gujarat coordinates
    return `https://www.openstreetmap.org/export/embed.html?bbox=71.0%2C21.0%2C73.5%2C23.5&layer=mapnik`;
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Page Title */}
      <div className="border-b border-emerald-900/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-emerald-950 flex items-center gap-2 leading-none">
            <MapPin className="w-8 h-8 text-amber-500" />
            {t("nurseries")}
          </h1>
          <p className="text-sm md:text-base text-stone-500 font-semibold">
            Locate Forest Department and Agricultural University sapling distribution depots near you.
          </p>
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2 shadow-sm max-w-xs w-full sm:w-auto">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="flex-1 bg-transparent text-xs md:text-sm font-bold text-stone-700 focus:outline-none"
          >
            <option value="">All Districts</option>
            {districtsData.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Map Panel (3/5 Columns) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm h-80 md:h-[420px] relative">
            <iframe
              title="Nursery Locator Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={getMapIframeUrl()}
              className="border-0"
            ></iframe>
          </div>
          
          {/* Active Nursery Quick Indicator */}
          {activeNursery && (
            <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100/60 p-3 rounded-xl border border-stone-200/50">
              <Compass className="w-4 h-4 text-emerald-800 animate-spin [animation-duration:8s]" />
              <span className="font-semibold">
                Pinpoint coordinates: {activeNursery.lat.toFixed(4)}, {activeNursery.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {/* Nurseries list panel (2/5 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-1">
          {filteredNurseries.length > 0 ? (
            filteredNurseries.map((nur) => {
              const isActive = activeNursery?.id === nur.id;
              return (
                <div
                  key={nur.id}
                  onClick={() => setActiveNursery(nur)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col gap-3 shadow-sm ${
                    isActive
                      ? "bg-white border-emerald-850 ring-2 ring-emerald-950/5"
                      : "bg-stone-50 border-stone-200 hover:bg-stone-100/50 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive ? "bg-emerald-850 text-amber-50" : "bg-stone-200 text-stone-600"
                      }`}
                      style={isActive ? { backgroundColor: "#022c22" } : {}}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-extrabold text-sm md:text-base text-emerald-950 leading-snug">
                        {nur.name[language] || nur.name["en"]}
                      </h3>
                      <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                        {nur.address[language] || nur.address["en"]}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-stone-150 pt-3 mt-1 text-xs">
                    {/* Call tel Link */}
                    <a
                      href={`tel:${nur.phone}`}
                      onClick={(e) => e.stopPropagation()} // Prevent trigger active nursery click
                      className="flex-1 py-2 bg-emerald-900/5 hover:bg-emerald-900/10 active:bg-emerald-950 active:text-amber-50 border border-emerald-950/10 text-emerald-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Depot
                    </a>
                    
                    {/* Route Directions Google Maps Link */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${nur.lat},${nur.lng}`}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-900 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Get Route
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-stone-400 bg-stone-100/60 rounded-3xl border border-stone-200/50 flex flex-col items-center gap-2">
              <Map className="w-8 h-8 text-stone-300" />
              <p className="text-xs font-semibold leading-normal">
                No local forest depots cataloged in {districtFilter} district.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
