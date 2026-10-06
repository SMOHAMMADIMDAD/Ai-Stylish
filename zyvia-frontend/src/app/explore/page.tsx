"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  Search,
  Shirt,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";

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

const styleCategories = [
  {
    name: "Casual",
    description: "Effortless everyday looks",
    gradient: "from-pink-100 via-rose-50 to-purple-100",
    icon: "✦",
  },
  {
    name: "Streetwear",
    description: "Bold urban energy",
    gradient: "from-violet-100 via-purple-50 to-pink-100",
    icon: "✧",
  },
  {
    name: "Minimal",
    description: "Clean and timeless",
    gradient: "from-zinc-100 via-white to-pink-50",
    icon: "○",
  },
  {
    name: "Formal",
    description: "Sharp and sophisticated",
    gradient: "from-slate-100 via-white to-violet-100",
    icon: "◇",
  },
];

const colorIdeas = [
  {
    name: "Soft Pink",
    gradient: "from-pink-200 to-rose-100",
  },
  {
    name: "Lavender",
    gradient: "from-violet-200 to-purple-100",
  },
  {
    name: "Earth Tones",
    gradient: "from-amber-200 to-stone-100",
  },
  {
    name: "Monochrome",
    gradient: "from-zinc-300 to-zinc-100",
  },
];

function getImageUrl(url: string) {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  return `${API_BASE}${url}`;
}

export default function ExplorePage() {
  const router = useRouter();

  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Unable to load your wardrobe."
        );
      }

      setWardrobeItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your wardrobe."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWardrobe();
  }, [fetchWardrobe]);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return wardrobeItems;
    }

    return wardrobeItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.style.toLowerCase().includes(query) ||
        item.clothing_type.toLowerCase().includes(query) ||
        item.primary_color?.toLowerCase().includes(query)
      );
    });
  }, [wardrobeItems, search]);

  const styleCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    wardrobeItems.forEach((item) => {
      const style = item.style?.toLowerCase();

      if (style) {
        counts[style] = (counts[style] || 0) + 1;
      }
    });

    return counts;
  }, [wardrobeItems]);

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-[#fff9fc] via-[#faf8ff] to-[#f7f3ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1450px]">

          {/* =========================================
              HEADER
          ========================================= */}

          <header className="mb-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-pink-500">
                    Discover
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  Explore your style
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                  Discover new ways to wear what you already own and
                  find inspiration for your next look.
                </p>
              </div>

              <button
                onClick={() => router.push("/generate")}
                className="hidden shrink-0 items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:flex"
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
            className="relative mb-7 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#f8ddea] via-[#f3e6f7] to-[#e7def8] p-6 shadow-[0_12px_40px_rgba(120,80,140,0.08)] sm:p-8 lg:p-10"
          >
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl" />

            <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-pink-200/30 blur-3xl" />

            <div className="relative max-w-2xl">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                <Sparkles className="h-5 w-5 text-violet-500" />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
                Zyvia inspiration
              </p>

              <h2 className="mt-2 text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl">
                Your wardrobe has more possibilities than you think.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
                Explore different aesthetics, colors and styling
                directions — then turn your favorite idea into a
                complete outfit.
              </p>

              <button
                onClick={() => router.push("/generate")}
                className="mt-6 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-800 shadow-sm transition hover:shadow-md"
              >
                Start styling
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.section>

          {/* =========================================
              SEARCH
          ========================================= */}

          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your wardrobe, styles or colors..."
                className="w-full rounded-2xl border border-white bg-white/90 py-4 pl-12 pr-5 text-sm text-zinc-800 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-pink-200 focus:ring-4 focus:ring-pink-50"
              />
            </div>
          </div>

          {/* =========================================
              STYLE CATEGORIES
          ========================================= */}

          <section className="mb-10">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                  Style guide
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  Explore aesthetics
                </h2>
              </div>

              <span className="hidden text-xs text-zinc-400 sm:block">
                Find your next vibe
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {styleCategories.map((style, index) => {
                const count =
                  styleCounts[style.name.toLowerCase()] || 0;

                return (
                  <motion.button
                    key={style.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setSearch(style.name)
                    }
                    className={`group relative overflow-hidden rounded-[24px] bg-gradient-to-br ${style.gradient} p-5 text-left shadow-sm transition hover:shadow-lg`}
                  >
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/30 blur-2xl" />

                    <div className="relative">
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-xl text-zinc-700 shadow-sm">
                          {style.icon}
                        </div>

                        <ChevronRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-1" />
                      </div>

                      <h3 className="text-lg font-bold text-zinc-900">
                        {style.name}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {style.description}
                      </p>

                      {count > 0 && (
                        <div className="mt-4 text-[11px] font-semibold text-zinc-500">
                          {count} item{count !== 1 ? "s" : ""} in
                          your wardrobe
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* =========================================
              COLOR INSPIRATION
          ========================================= */}

          <section className="mb-10">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                Color inspiration
              </p>

              <h2 className="mt-1 text-xl font-bold text-zinc-900">
                Build around a color
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {colorIdeas.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSearch(color.name)}
                  className={`group relative h-28 overflow-hidden rounded-[22px] bg-gradient-to-br ${color.gradient} p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
                >
                  <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/25 blur-xl" />

                  <span className="relative text-sm font-bold text-zinc-700">
                    {color.name}
                  </span>

                  <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-zinc-400 transition group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </section>

          {/* =========================================
              YOUR WARDROBE DISCOVERY
          ========================================= */}

          <section className="pb-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                  From your wardrobe
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  Pieces to explore
                </h2>
              </div>

              <button
                onClick={() => router.push("/wardrobe")}
                className="flex items-center gap-1 text-sm font-semibold text-pink-500"
              >
                View wardrobe
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-[22px] bg-white"
                  >
                    <div className="aspect-square bg-zinc-100" />
                    <div className="space-y-2 p-4">
                      <div className="h-3 w-3/4 rounded bg-zinc-100" />
                      <div className="h-2 w-1/2 rounded bg-zinc-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-500">
                {error}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border border-dashed border-zinc-200 bg-white/60 px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50">
                  <Shirt className="h-6 w-6 text-pink-400" />
                </div>

                <h3 className="font-bold text-zinc-800">
                  {search
                    ? "No matching pieces"
                    : "Your wardrobe is empty"}
                </h3>

                <p className="mt-1 max-w-sm text-sm text-zinc-400">
                  {search
                    ? "Try another style, color or item name."
                    : "Add clothing to your wardrobe and discover new combinations."}
                </p>

                {!search && (
                  <button
                    onClick={() => router.push("/upload")}
                    className="mt-4 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Add clothing
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {filteredItems.slice(0, 10).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group overflow-hidden rounded-[22px] border border-white bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <button
                      onClick={() =>
                        router.push(
                          `/generate?item=${item.id}`
                        )
                      }
                      className="block w-full text-left"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#f7f5f7]">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 opacity-0 shadow-sm backdrop-blur-sm transition group-hover:opacity-100">
                          <Wand2 className="h-4 w-4 text-pink-500" />
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="truncate text-sm font-bold text-zinc-800">
                          {item.name}
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="truncate text-xs capitalize text-zinc-400">
                            {item.style}
                          </span>

                          <span className="shrink-0 rounded-full bg-zinc-50 px-2 py-1 text-[10px] font-semibold capitalize text-zinc-400">
                            {item.clothing_type}
                          </span>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* =========================================
              AI STYLE CTA
          ========================================= */}

          <motion.section
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 overflow-hidden rounded-[28px] border border-pink-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100">
                  <Star className="h-5 w-5 text-pink-500" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Not sure what to wear?
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-400">
                    Pick any piece from your wardrobe and let Zyvia
                    create a complete outfit around it.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/generate")}
                className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-100 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Wand2 className="h-4 w-4" />
                Style me
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.section>

          {/* Mobile create button */}
          <button
            onClick={() => router.push("/generate")}
            className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl sm:hidden"
            aria-label="Create outfit"
          >
            <Wand2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}