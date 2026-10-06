"use client";

import AppShell from "./components/layout/AppShell";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Loader2,
  Shirt,
  Sparkles,
  Wand2,
  Plus,
  RefreshCw,
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
}

interface Outfit {
  base?: ClothingItem;
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
  outerwear?: ClothingItem;
  score?: number;
  visual_similarity?: number;
  explanation: string;
  tags: string[];
}

const API_BASE = "http://127.0.0.1:8000";

function getFullImageUrl(url?: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

/* -------------------------------------------------------
   Small reusable image card
------------------------------------------------------- */

function ClothingCard({
  item,
  onClick,
}: {
  item: ClothingItem;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f4eef5] shadow-sm">
        <img
          src={getFullImageUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
          <p className="truncate text-sm font-semibold text-white">
            {item.name}
          </p>

          <p className="mt-0.5 text-xs capitalize text-white/75">
            {item.clothing_type}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------
   Outfit item
------------------------------------------------------- */

function OutfitItem({
  item,
  label,
}: {
  item?: ClothingItem;
  label: string;
}) {
  if (!item) return null;

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl bg-[#f6f1f6]">
        <img
          src={getFullImageUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <p className="mt-2 text-sm font-semibold text-zinc-800">
        {item.name}
      </p>

      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------
   Home
------------------------------------------------------- */

export default function ZyviaHome() {
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);

  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(true);

  const [recommendedOutfit, setRecommendedOutfit] =
    useState<Outfit | null>(null);

  const [recommendationLoading, setRecommendationLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------------
     Fetch wardrobe
  ------------------------------------------------------- */

  const fetchWardrobe = useCallback(async () => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser?.accessToken) {
      setWardrobeLoading(false);
      return;
    }

    try {
      setWardrobeLoading(true);

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
            `Wardrobe request failed with status ${response.status}`
        );
      }

      setWardrobeItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Wardrobe API error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your wardrobe."
      );
    } finally {
      setWardrobeLoading(false);
    }
  }, []);

  /* -------------------------------------------------------
     Fetch recommendation
  ------------------------------------------------------- */

  const fetchRecommendation = useCallback(async () => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser?.accessToken) {
      setRecommendationLoading(false);
      return;
    }

    try {
      setRecommendationLoading(true);

      const response = await fetch(
        `${API_BASE}/api/clothing/outfit-of-the-day/`,
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
            "Failed to load today's recommendation."
        );
      }

      if (data && typeof data === "object" && !Array.isArray(data)) {
        setRecommendedOutfit(data as Outfit);
      } else {
        setRecommendedOutfit(null);
      }
    } catch (err) {
      console.error("Recommendation API error:", err);

      // Don't show a large error on the dashboard.
      // The empty state below will handle it.
      setRecommendedOutfit(null);
    } finally {
      setRecommendationLoading(false);
    }
  }, []);

  /* -------------------------------------------------------
     Initial load
  ------------------------------------------------------- */

  useEffect(() => {
    const currentUser = auth.getCurrentUser();

    if (currentUser) {
      setUsername(currentUser.username);
    }

    fetchWardrobe();
    fetchRecommendation();
  }, [fetchWardrobe, fetchRecommendation]);

  /* -------------------------------------------------------
     Derived values
  ------------------------------------------------------- */

  const firstName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : "there";

  const recentItems = wardrobeItems.slice(0, 4);

  const hasWardrobe = wardrobeItems.length > 0;

  /* -------------------------------------------------------
     Not logged in
  ------------------------------------------------------- */

  if (!username) {
    return (
      <AppShell>
        <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center justify-center">
            <div className="max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-violet-100">
                <Sparkles className="h-9 w-9 text-pink-500" />
              </div>

              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-pink-500">
                Zyvia AI Stylist
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                Your wardrobe,
                <br />
                <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  styled by AI.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-md text-base leading-7 text-zinc-500">
                Discover outfits, organize your wardrobe, and find your
                personal style with Zyvia.
              </p>

              <button
                onClick={() => router.push("/login")}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  /* -------------------------------------------------------
     Dashboard
  ------------------------------------------------------- */

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-[#fffafd] via-[#faf8ff] to-[#f7f4ff] px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">

          {/* =================================================
              TOP HEADER
          ================================================= */}

          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                Welcome back
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Hi, {firstName} ✨
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Ready to find your next look?
              </p>
            </div>

            <button
              onClick={() => router.push("/profile")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white shadow-md transition hover:scale-105"
            >
              {firstName.charAt(0).toUpperCase()}
            </button>
          </header>

          {/* =================================================
              HERO
          ================================================= */}

          <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f8dce9] via-[#eee1f5] to-[#ddd9f5] p-7 sm:p-10 lg:p-12">
            {/* Decorative circles */}
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                AI PERSONAL STYLIST
              </div>

              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
                Dress for the
                <br />
                <span className="italic text-pink-600">
                  way you feel.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                Let Zyvia create outfits from the clothes you already own.
                Discover combinations that match your style, occasion, and
                mood.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/generate")}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Wand2 className="h-4 w-4" />
                  Create an outfit
                </button>

                <button
                  onClick={() => router.push("/wardrobe")}
                  className="inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-3 text-sm font-semibold text-zinc-800 backdrop-blur transition hover:bg-white"
                >
                  View wardrobe
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              QUICK STATS
          ================================================= */}

          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                <Shirt className="h-5 w-5 text-pink-600" />
              </div>

              <p className="text-2xl font-semibold text-zinc-900">
                {wardrobeLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  wardrobeItems.length
                )}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Wardrobe items
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>

              <p className="text-2xl font-semibold text-zinc-900">
                AI
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Personal stylist
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                <Wand2 className="h-5 w-5 text-rose-600" />
              </div>

              <p className="text-2xl font-semibold text-zinc-900">
                4
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Style categories
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-100">
                <Heart className="h-5 w-5 text-fuchsia-600" />
              </div>

              <p className="text-2xl font-semibold text-zinc-900">
                Your
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Personal style
              </p>
            </div>
          </section>

          {/* =================================================
              CONTENT GRID
          ================================================= */}

          <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">

            {/* =============================================
                OUTFIT OF THE DAY
            ============================================= */}

            <section className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-sm backdrop-blur sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-500">
                    Curated for you
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                    Outfit of the day
                  </h2>
                </div>

                <button
                  onClick={fetchRecommendation}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
                  title="Refresh recommendation"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      recommendationLoading ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>

              {recommendationLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square animate-pulse rounded-2xl bg-zinc-100"
                    />
                  ))}
                </div>
              ) : recommendedOutfit ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <OutfitItem
                      item={recommendedOutfit.top}
                      label="Top"
                    />

                    <OutfitItem
                      item={recommendedOutfit.bottom}
                      label="Bottom"
                    />

                    <OutfitItem
                      item={recommendedOutfit.shoes}
                      label="Shoes"
                    />

                    <OutfitItem
                      item={recommendedOutfit.outerwear}
                      label="Outerwear"
                    />
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#faf7fb] p-4">
                    <p className="text-sm leading-6 text-zinc-600">
                      {recommendedOutfit.explanation}
                    </p>

                    {recommendedOutfit.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recommendedOutfit.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#faf5fa] to-[#f4f0fa] px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Sparkles className="h-6 w-6 text-pink-500" />
                  </div>

                  <h3 className="font-semibold text-zinc-800">
                    Your first look is waiting
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                    Add a few pieces to your wardrobe and Zyvia will create
                    personalized outfit recommendations.
                  </p>

                  <button
                    onClick={() => router.push("/upload")}
                    className="mt-5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Add clothing
                  </button>
                </div>
              )}
            </section>

            {/* =============================================
                QUICK ACTIONS
            ============================================= */}

            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">
                  Explore
                </p>

                <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                  What would you like to do?
                </h2>
              </div>

              <div className="space-y-4">

                {/* Generate */}
                <motion.button
                  whileHover={{ y: -3 }}
                  onClick={() => router.push("/generate")}
                  className="group flex w-full items-center gap-4 rounded-2xl bg-zinc-900 p-5 text-left text-white shadow-md transition"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Wand2 className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">
                      Generate an outfit
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/60">
                      Build a look around something you already own.
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.button>

                {/* Wardrobe */}
                <motion.button
                  whileHover={{ y: -3 }}
                  onClick={() => router.push("/wardrobe")}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-white/80 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-100">
                    <Shirt className="h-5 w-5 text-pink-600" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900">
                      Open my wardrobe
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Browse and organize your clothing collection.
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1" />
                </motion.button>

                {/* Explore */}
                <motion.button
                  whileHover={{ y: -3 }}
                  onClick={() => router.push("/explore")}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-white/80 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900">
                      Explore styles
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Discover inspiration and new outfit ideas.
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1" />
                </motion.button>

              </div>
            </section>
          </div>

          {/* =================================================
              RECENT WARDROBE
          ================================================= */}

          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-500">
                  Your collection
                </p>

                <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                  Recently added
                </h2>
              </div>

              <button
                onClick={() => router.push("/wardrobe")}
                className="hidden items-center gap-1 text-sm font-semibold text-zinc-600 transition hover:text-pink-600 sm:flex"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {wardrobeLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] animate-pulse rounded-2xl bg-white"
                  />
                ))}
              </div>
            ) : hasWardrobe ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {recentItems.map((item) => (
                    <ClothingCard
                      key={item.id}
                      item={item}
                      onClick={() => router.push("/wardrobe")}
                    />
                  ))}
                </div>

                <button
                  onClick={() => router.push("/wardrobe")}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white/70 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-white sm:hidden"
                >
                  View full wardrobe
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/50 px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50">
                  <Shirt className="h-6 w-6 text-pink-500" />
                </div>

                <h3 className="font-semibold text-zinc-800">
                  Your wardrobe is empty
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                  Upload your first clothing item and start building your
                  personal digital wardrobe.
                </p>

                <button
                  onClick={() => router.push("/upload")}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                  Add first item
                </button>
              </div>
            )}
          </section>

          {/* =================================================
              FOOTER SPACE
          ================================================= */}

          <div className="h-24" />
        </div>

        {/* ===================================================
            FLOATING UPLOAD BUTTON
        =================================================== */}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/upload")}
          className="fixed bottom-24 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl transition hover:shadow-2xl sm:bottom-8 sm:right-8 sm:flex"
          aria-label="Add clothing"
        >
          <Plus className="h-6 w-6" />
        </motion.button>

        {/* Small error indicator */}
        {error && (
          <div className="fixed bottom-6 left-6 z-40 hidden max-w-xs rounded-xl border border-red-100 bg-white px-4 py-3 text-xs text-red-500 shadow-lg lg:block">
            {error}
          </div>
        )}
      </div>
    </AppShell>
  );
}