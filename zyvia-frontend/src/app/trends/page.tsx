"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Palette,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";

import { useRouter } from "next/navigation";
import AppShell from "../components/layout/AppShell";
import * as auth from "@/lib/auth";

interface ClothingItem {
  id: number;
  name: string;
  image: string;
  clothing_type: string;
  style: string;
  primary_color?: string;
  color_palette?: string[];
}

const API_BASE = "http://127.0.0.1:8000";

const trends = [
  {
    title: "Soft & Romantic",
    description:
      "Light colors, relaxed silhouettes and subtle details.",
    tag: "Popular now",
    gradient: "from-pink-100 via-rose-50 to-violet-100",
    icon: "✦",
  },
  {
    title: "Clean Minimal",
    description:
      "Simple pieces, neutral tones and effortless styling.",
    tag: "Timeless",
    gradient: "from-zinc-100 via-white to-slate-100",
    icon: "○",
  },
  {
    title: "Modern Street",
    description:
      "Oversized layers, denim and confident everyday pieces.",
    tag: "Trending",
    gradient: "from-violet-100 via-purple-50 to-pink-100",
    icon: "✧",
  },
];

const colors = [
  {
    name: "Blush Pink",
    value: "Soft & feminine",
    className: "bg-pink-200",
  },
  {
    name: "Lavender",
    value: "Fresh & expressive",
    className: "bg-violet-200",
  },
  {
    name: "Cream",
    value: "Warm & versatile",
    className: "bg-amber-100",
  },
  {
    name: "Chocolate",
    value: "Rich & grounded",
    className: "bg-amber-800",
  },
  {
    name: "Charcoal",
    value: "Sharp & modern",
    className: "bg-zinc-700",
  },
];

function getImageUrl(url: string) {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  return `${API_BASE}${url}`;
}

export default function TrendsPage() {
  const router = useRouter();

  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const fetchWardrobe = useCallback(async () => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/clothing/`, {
        headers: {
          Authorization: `Bearer ${currentUser.accessToken}`,
        },
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setWardrobeItems(data);
      }
    } catch {
      // Trends can still render without wardrobe data.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWardrobe();
  }, [fetchWardrobe]);

  const styleStats = useMemo(() => {
    const counts: Record<string, number> = {};

    wardrobeItems.forEach((item) => {
      const style = item.style?.toLowerCase();

      if (style) {
        counts[style] = (counts[style] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [wardrobeItems]);

  const totalPieces = wardrobeItems.length;

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-[#fff9fc] via-[#faf8ff] to-[#f7f3ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">

          {/* =========================================
              HEADER
          ========================================= */}

          <header className="mb-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-pink-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-pink-500">
                    Fashion intelligence
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  What's trending
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                  Discover style directions and see how they can
                  inspire your wardrobe.
                </p>
              </div>

              <button
                onClick={() => router.push("/generate")}
                className="hidden items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:flex"
              >
                <Wand2 className="h-4 w-4" />
                Create a look
              </button>
            </div>
          </header>

          {/* =========================================
              HERO
          ========================================= */}

          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-7 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#f8dcea] via-[#f2e5f7] to-[#e5def8] p-6 shadow-[0_12px_40px_rgba(120,80,140,0.08)] sm:p-8 lg:p-10"
          >
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/30 blur-3xl" />

            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-pink-200/30 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                  <TrendingUp className="h-5 w-5 text-violet-500" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
                  Zyvia trend report
                </p>

                <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl">
                  Style is always changing.
                  <br />
                  Your wardrobe can evolve with it.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
                  Explore current style directions and use your
                  existing pieces to experiment with new looks.
                </p>

                <button
                  onClick={() => router.push("/explore")}
                  className="mt-6 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-800 shadow-sm transition hover:shadow-md"
                >
                  Explore styles
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Trend summary */}
              <div className="rounded-[24px] border border-white/60 bg-white/55 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Your wardrobe
                  </span>

                  <Sparkles className="h-4 w-4 text-pink-500" />
                </div>

                <div className="text-4xl font-bold text-zinc-900">
                  {loading ? "—" : totalPieces}
                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  pieces available for styling
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/80">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-pink-400 to-violet-400" />
                </div>

                <p className="mt-2 text-[11px] text-zinc-400">
                  Zyvia styling potential
                </p>
              </div>
            </div>
          </motion.section>

          {/* =========================================
              TREND CARDS
          ========================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                Style directions
              </p>

              <h2 className="mt-1 text-xl font-bold text-zinc-900">
                Trending aesthetics
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {trends.map((trend, index) => (
                <motion.div
                  key={trend.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className={`group relative overflow-hidden rounded-[26px] bg-gradient-to-br ${trend.gradient} p-6 shadow-sm transition hover:shadow-lg`}
                >
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/30 blur-2xl" />

                  <div className="relative">
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-xl shadow-sm">
                        {trend.icon}
                      </div>

                      <span className="rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-bold text-zinc-500">
                        {trend.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900">
                      {trend.title}
                    </h3>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-zinc-500">
                      {trend.description}
                    </p>

                    <button
                      onClick={() => router.push("/explore")}
                      className="mt-5 flex items-center gap-1 text-sm font-bold text-zinc-700"
                    >
                      Explore trend
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* =========================================
              COLOR TREND
          ========================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                Color forecast
              </p>

              <h2 className="mt-1 text-xl font-bold text-zinc-900">
                Colors to experiment with
              </h2>
            </div>

            <div className="rounded-[26px] border border-white bg-white/80 p-5 shadow-sm sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {colors.map((color, index) => (
                  <motion.button
                    key={color.name}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() =>
                      router.push("/explore")
                    }
                    className="group rounded-2xl bg-zinc-50 p-3 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                  >
                    <div
                      className={`h-24 rounded-xl ${color.className} shadow-inner`}
                    />

                    <p className="mt-3 text-sm font-bold text-zinc-800">
                      {color.name}
                    </p>

                    <p className="mt-1 text-[11px] text-zinc-400">
                      {color.value}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* =========================================
              YOUR STYLE INSIGHTS
          ========================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                Personal insights
              </p>

              <h2 className="mt-1 text-xl font-bold text-zinc-900">
                Your wardrobe trends
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Style distribution */}
              <div className="rounded-[26px] border border-white bg-white/80 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-800">
                      Your style mix
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      Based on your wardrobe
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                    <BarChart3 className="h-5 w-5 text-pink-500" />
                  </div>
                </div>

                {styleStats.length > 0 ? (
                  <div className="space-y-4">
                    {styleStats.map(([style, count]) => {
                      const percentage =
                        totalPieces > 0
                          ? Math.round(
                              (count / totalPieces) * 100
                            )
                          : 0;

                      return (
                        <div key={style}>
                          <div className="mb-1.5 flex justify-between text-xs">
                            <span className="font-semibold capitalize text-zinc-600">
                              {style}
                            </span>

                            <span className="text-zinc-400">
                              {percentage}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${percentage}%`,
                              }}
                              transition={{
                                duration: 0.7,
                              }}
                              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-400"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-zinc-50 p-6 text-center">
                    <p className="text-sm font-semibold text-zinc-600">
                      Add more clothing to unlock style insights.
                    </p>

                    <button
                      onClick={() => router.push("/upload")}
                      className="mt-3 text-sm font-bold text-pink-500"
                    >
                      Add clothing →
                    </button>
                  </div>
                )}
              </div>

              {/* Trend advice */}
              <div className="rounded-[26px] bg-gradient-to-br from-[#fff1f7] to-[#f1ecff] p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80">
                  <Palette className="h-5 w-5 text-violet-500" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-zinc-900">
                  Make trends work for you
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  You don't need a completely new wardrobe to
                  experiment with trends. Start with one piece and
                  build around it.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="text-xs font-bold text-zinc-700">
                      01 · Start small
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-400">
                      Add one trending color or silhouette to a
                      familiar outfit.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="text-xs font-bold text-zinc-700">
                      02 · Mix old & new
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-400">
                      Combine wardrobe staples with a more current
                      styling direction.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="text-xs font-bold text-zinc-700">
                      03 · Let Zyvia style it
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-400">
                      Pick your favorite piece and generate a look
                      around it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================
              CTA
          ========================================= */}

          <motion.section
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 rounded-[28px] border border-pink-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                  Ready to experiment?
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  Turn a trend into your next outfit.
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Use your own wardrobe instead of starting from
                  scratch.
                </p>
              </div>

              <button
                onClick={() => router.push("/generate")}
                className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-100 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Wand2 className="h-4 w-4" />
                Generate an outfit
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.section>

          {/* Mobile CTA */}
          <button
            onClick={() => router.push("/generate")}
            className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl sm:hidden"
            aria-label="Generate outfit"
          >
            <Wand2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}