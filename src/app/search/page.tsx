"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SmartSearchBar from "@/components/ai/SmartSearchBar";
import BusinessMap from "@/components/maps/BusinessMap";
import { MapPin, Star, IndianRupee, Filter } from "lucide-react";

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string;
  location_lat: number;
  location_lng: number;
  rating: number;
  review_count?: number;
  price_range?: string;
  image_url?: string;
  distance?: number;
}

export default function SearchPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .order("rating", { ascending: false })
        .limit(60);
      if (data) {
        setBusinesses(data as any);
      }
      setLoading(false);
    };
    fetchBusinesses();
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const matchesQuery = (b: Business) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.location || "").toLowerCase().includes(q)
    );
  };

  const filtered = businesses.filter(matchesQuery);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Search businesses
          </h1>
          <SmartSearchBar onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results list with comparison-style cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1 font-medium">
                <Filter size={14} />
                Showing {filtered.length} of {businesses.length} businesses
              </span>
              <span>Tap a row to focus on map</span>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-2xl border border-violet-100 dark:border-violet-800/50 overflow-hidden shadow-xl">
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-3 px-4 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <span>Business</span>
                <span className="text-center">From (₹)</span>
                <span className="text-center">Rating</span>
                <span className="text-center">Distance</span>
              </div>
              {loading ? (
                <div className="py-10 flex justify-center">
                  <div className="h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No businesses match this search yet.
                </div>
              ) : (
                <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((biz) => (
                    <button
                      key={biz.id}
                      type="button"
                      onClick={() => setSelectedBusiness(biz)}
                      className="w-full grid grid-cols-[2fr,1fr,1fr,1fr] gap-3 px-4 py-3 text-xs hover:bg-violet-50/80 dark:hover:bg-violet-900/40 transition-colors text-left"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {biz.name}
                        </p>
                        <p className="flex items-center gap-1 text-gray-500 dark:text-gray-400 truncate">
                          <MapPin size={10} />
                          <span className="truncate">{biz.location}</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-center text-gray-800 dark:text-gray-100">
                        <IndianRupee size={12} className="mr-0.5" />
                        <span className="font-medium">
                          {biz.price_range === "$"
                            ? "₹"
                            : biz.price_range === "$$"
                            ? "₹₹"
                            : biz.price_range === "$$$"
                            ? "₹₹₹"
                            : biz.price_range === "$$$$"
                            ? "₹₹₹₹"
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-gray-800 dark:text-gray-100">
                        <Star
                          size={12}
                          className="text-yellow-400 fill-yellow-400"
                        />
                        <span className="font-semibold">
                          {biz.rating?.toFixed(1) ?? "–"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center text-gray-700 dark:text-gray-200">
                        {biz.distance ? `${biz.distance.toFixed(1)} km` : "—"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map side */}
          <div className="h-[520px]">
            <BusinessMap
              businesses={filtered}
              userLocation={undefined}
              onBusinessSelect={(biz) => setSelectedBusiness(biz as any)}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

