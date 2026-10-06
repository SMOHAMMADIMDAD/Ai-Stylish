"use client";

import AppShell from "../components/layout/AppShell";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Plus,
  Search,
  Shirt,
  Sparkles,
  Loader2,
  SlidersHorizontal,
  WandSparkles,
} from "lucide-react";
import * as auth from "@/lib/auth";

interface ClothingItem {
  id: number;
  name: string;
  image: string;
  clothing_type: string;
  style: string;
  color_palette?: string[];
  primary_color?: string;
  category?: string;
  subcategory?: string;
}

const API_BASE = "http://127.0.0.1:8000";

function getImageUrl(url?: string) {
  if (!url) return "";

  return url.startsWith("http")
    ? url
    : `${API_BASE}${url}`;
}

const filters = [
  { label: "All", value: "all" },
  { label: "Tops", value: "Top" },
  { label: "Bottoms", value: "Bottom" },
  { label: "Shoes", value: "Shoes" },
  { label: "Outerwear", value: "Outerwear" },
];

export default function WardrobePage() {
  const router = useRouter();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchWardrobe = useCallback(async () => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser?.accessToken) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE}/api/clothing/`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            `Failed to load wardrobe (${response.status})`
        );
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Wardrobe API error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your wardrobe."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWardrobe();
  }, [fetchWardrobe]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.style
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        item.clothing_type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, activeFilter]);

  const handleSelectItem = (item: ClothingItem) => {
    router.push(`/generate?item=${item.id}`);
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-[#fffafd] via-[#faf8ff] to-[#f7f4ff] px-5 py-6 pb-28 sm:px-8 lg:px-10 lg:pb-10">

        <div className="mx-auto max-w-[1500px]">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="mb-8">

            <div className="flex items-start justify-between gap-4">

              <div>
                <button
                  onClick={() => router.push("/")}
                  className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition hover:text-zinc-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back home
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100">
                    <Shirt className="h-6 w-6 text-pink-500" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-500">
                      Your collection
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                      My Wardrobe
                    </h1>
                  </div>
                </div>

                <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">
                  Everything you own, organized in one place. Pick a piece
                  and let Zyvia build a look around it.
                </p>
              </div>

              <button
                onClick={() => router.push("/upload")}
                className="hidden items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:inline-flex"
              >
                <Plus className="h-4 w-4" />
                Add clothing
              </button>

            </div>

          </header>

          {/* =================================================
              STATS / INTRO STRIP
          ================================================= */}

          <section className="mb-7 overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-[#f9e3ed] via-[#f2e6f6] to-[#e7e1f7] p-5 sm:p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-zinc-900">
                    {items.length}{" "}
                    {items.length === 1 ? "piece" : "pieces"} in your wardrobe
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    Your digital closet grows with every upload.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/generate")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-4 py-2.5 text-xs font-semibold text-zinc-800 backdrop-blur transition hover:bg-white"
              >
                <WandSparkles className="h-4 w-4 text-pink-500" />
                Style my wardrobe
              </button>

            </div>

          </section>

          {/* =================================================
              SEARCH + FILTERS
          ================================================= */}

          <section className="mb-7">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Search */}

              <div className="relative w-full lg:max-w-sm">

                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your wardrobe..."
                  className="h-12 w-full rounded-2xl border border-zinc-200/70 bg-white/80 pl-11 pr-4 text-sm text-zinc-800 outline-none backdrop-blur transition placeholder:text-zinc-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                />

              </div>

              {/* Filters */}

              <div className="flex items-center gap-2 overflow-x-auto pb-1">

                <div className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400 shadow-sm">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>

                {filters.map((filter) => {
                  const active =
                    activeFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      onClick={() =>
                        setActiveFilter(filter.value)
                      }
                      className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                        active
                          ? "bg-zinc-900 text-white shadow-sm"
                          : "bg-white/80 text-zinc-500 hover:bg-white hover:text-zinc-800"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}

              </div>

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
              <p className="font-semibold">
                Could not load your wardrobe
              </p>

              <p className="mt-1 text-xs">
                {error}
              </p>

              <button
                onClick={fetchWardrobe}
                className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-red-500 shadow-sm"
              >
                Try again
              </button>
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="aspect-[4/5] animate-pulse bg-zinc-100" />

                  <div className="space-y-2 p-4">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-100" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-zinc-100" />
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading && !error && items.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-violet-100">
                <Shirt className="h-7 w-7 text-pink-500" />
              </div>

              <h2 className="text-xl font-semibold text-zinc-900">
                Your wardrobe is waiting
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Upload your clothes and build your digital wardrobe.
                Zyvia will analyze them and use them for personalized
                outfit recommendations.
              </p>

              <button
                onClick={() => router.push("/upload")}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add your first piece
              </button>

            </div>
          )}

          {/* =================================================
              NO SEARCH RESULTS
          ================================================= */}

          {!loading &&
            !error &&
            items.length > 0 &&
            filteredItems.length === 0 && (
              <div className="rounded-[2rem] bg-white/60 px-6 py-16 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
                  <Search className="h-6 w-6 text-zinc-400" />
                </div>

                <h2 className="font-semibold text-zinc-800">
                  No pieces found
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Try a different search or category.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("all");
                  }}
                  className="mt-5 rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white"
                >
                  Clear filters
                </button>

              </div>
            )}

          {/* =================================================
              CLOTHING GRID
          ================================================= */}

          {!loading &&
            !error &&
            filteredItems.length > 0 && (
              <section>

                <div className="mb-4 flex items-center justify-between">

                  <p className="text-sm font-medium text-zinc-500">
                    Showing{" "}
                    <span className="font-semibold text-zinc-800">
                      {filteredItems.length}
                    </span>{" "}
                    {filteredItems.length === 1
                      ? "piece"
                      : "pieces"}
                  </p>

                  <button
                    onClick={fetchWardrobe}
                    className="text-xs font-semibold text-zinc-400 transition hover:text-pink-500"
                  >
                    Refresh
                  </button>

                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="group"
                    >

                      <div
                        onClick={() =>
                          handleSelectItem(item)
                        }
                        className="relative cursor-pointer overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >

                        {/* Image */}

                        <div className="relative aspect-[4/5] overflow-hidden bg-[#f4eef5]">

                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Hover action */}

                          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">

                            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/90 px-3 py-2.5 text-xs font-semibold text-zinc-800 shadow-lg backdrop-blur">
                              <WandSparkles className="h-3.5 w-3.5 text-pink-500" />
                              Style this piece
                            </div>

                          </div>

                        </div>

                        {/* Details */}

                        <div className="p-4">

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <h3 className="truncate text-sm font-semibold text-zinc-900">
                                {item.name}
                              </h3>

                              <p className="mt-1 text-xs capitalize text-zinc-400">
                                {item.clothing_type}
                                {item.style
                                  ? ` · ${item.style}`
                                  : ""}
                              </p>

                            </div>

                          </div>

                          {/* Color */}

                          {item.primary_color && (
                            <div className="mt-3 flex items-center gap-2">

                              <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                                Color
                              </span>

                              <span className="text-xs capitalize text-zinc-600">
                                {item.primary_color}
                              </span>

                            </div>
                          )}

                        </div>

                      </div>

                    </motion.div>
                  ))}

                </div>

              </section>
            )}

        </div>

        {/* ===================================================
            MOBILE ADD BUTTON
        =================================================== */}

        <button
          onClick={() => router.push("/upload")}
          className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl transition hover:scale-105 sm:hidden"
          aria-label="Add clothing"
        >
          <Plus className="h-6 w-6" />
        </button>

      </div>
    </AppShell>
  );
}