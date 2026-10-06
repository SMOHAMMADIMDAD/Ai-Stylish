"use client";

import AppShell from "../components/layout/AppShell";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Loader2,
  RefreshCw,
  Sparkles,
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

function getImageUrl(url?: string) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

function OutfitPiece({
  item,
  label,
}: {
  item?: ClothingItem;
  label: string;
}) {
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#f4eef5]">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 backdrop-blur">
          {label}
        </div>
      </div>

      <h3 className="mt-3 truncate text-sm font-semibold text-zinc-900">
        {item.name}
      </h3>

      <p className="mt-1 text-xs capitalize text-zinc-400">
        {item.style || item.clothing_type}
      </p>
    </motion.div>
  );
}

export default function RecommendedPage() {
  const router = useRouter();

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = useCallback(async () => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser?.accessToken) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
            `Request failed with status ${response.status}`
        );
      }

      if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
      ) {
        setOutfit(data as Outfit);
      } else {
        setOutfit(null);
      }
    } catch (err) {
      console.error("Recommendation API error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate your recommendation."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-[#fffafd] via-[#faf8ff] to-[#f7f4ff] px-5 py-6 pb-28 sm:px-8 lg:px-10 lg:pb-10">

        <div className="mx-auto max-w-[1300px]">

          {/* Header */}

          <header className="mb-8">
            <button
              onClick={() => router.push("/")}
              className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition hover:text-zinc-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back home
            </button>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100">
                    <Sparkles className="h-6 w-6 text-pink-500" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
                      AI curated
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                      Recommended for you
                    </h1>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                  Zyvia looks through your wardrobe and creates a
                  combination designed around your existing pieces.
                </p>
              </div>

              <button
                onClick={fetchRecommendation}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh look
              </button>

            </div>
          </header>

          {/* AI banner */}

          <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#f8dce9] via-[#eee1f5] to-[#ddd9f5] p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/65">
                <WandSparkles className="h-6 w-6 text-pink-500" />
              </div>

              <div>
                <p className="text-lg font-semibold text-zinc-900">
                  Your wardrobe, styled intelligently.
                </p>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
                  We combine your available pieces to create a look
                  that works together — without needing to buy anything
                  new.
                </p>
              </div>

            </div>
          </section>

          {/* Loading */}

          {loading && (
            <section className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-sm backdrop-blur sm:p-8">

              <div className="mb-7 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-pink-500" />

                <div>
                  <p className="text-sm font-semibold text-zinc-800">
                    Creating your look...
                  </p>

                  <p className="text-xs text-zinc-400">
                    Zyvia is styling your wardrobe
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="aspect-[4/5] animate-pulse rounded-[1.5rem] bg-zinc-100"
                  />
                ))}
              </div>

            </section>
          )}

          {/* Error */}

          {!loading && error && (
            <section className="rounded-[2rem] border border-red-100 bg-white/80 p-10 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <Sparkles className="h-6 w-6 text-red-400" />
              </div>

              <h2 className="font-semibold text-zinc-900">
                We couldn't create your recommendation
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                {error}
              </p>

              <button
                onClick={fetchRecommendation}
                className="mt-6 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Try again
              </button>

            </section>
          )}

          {/* Empty */}

          {!loading && !error && !outfit && (
            <section className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-violet-100">
                <ShirtIcon />
              </div>

              <h2 className="text-xl font-semibold text-zinc-900">
                Add more to your wardrobe
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Zyvia needs a few clothing pieces before it can
                create a complete recommendation.
              </p>

              <button
                onClick={() => router.push("/upload")}
                className="mt-6 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white"
              >
                Add clothing
              </button>

            </section>
          )}

          {/* Recommendation */}

          {!loading && !error && outfit && (
            <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-sm backdrop-blur">

              <div className="border-b border-zinc-100 px-6 py-6 sm:px-8">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-500">
                      Today's look
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
                      Styled from your wardrobe
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-xs font-semibold text-pink-600">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Pick
                  </div>

                </div>
              </div>

              <div className="p-6 sm:p-8">

                {/* Pieces */}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <OutfitPiece
                    item={outfit.top}
                    label="Top"
                  />

                  <OutfitPiece
                    item={outfit.bottom}
                    label="Bottom"
                  />

                  <OutfitPiece
                    item={outfit.shoes}
                    label="Shoes"
                  />

                  <OutfitPiece
                    item={outfit.outerwear}
                    label="Outerwear"
                  />
                </div>

                {/* Explanation */}

                <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_auto]">

                  <div className="rounded-2xl bg-[#faf7fb] p-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Why this works
                    </p>

                    <p className="mt-3 text-sm leading-7 text-zinc-600">
                      {outfit.explanation}
                    </p>

                    {outfit.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {outfit.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>

                  <button
                    className="flex min-h-[90px] min-w-[150px] items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    <Heart className="h-4 w-4" />
                    Save look
                  </button>

                </div>

              </div>
            </section>
          )}

          <div className="h-20" />

        </div>
      </div>
    </AppShell>
  );
}

function ShirtIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="text-pink-500"
      >
        <path d="M20 7.5 16 5l-2 2h-4L8 5 4 7.5l2 4 2-1v8h8v-8l2 1 2-4Z" />
      </svg>
    </div>
  );
}