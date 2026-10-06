"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  Shirt,
  Wand2,
  X,
} from "lucide-react";
import AppShell from "../components/layout/AppShell";
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
  explanation?: string;
  tags?: string[];
}

const API_BASE = "http://127.0.0.1:8000";

const occasions = [
  {
    value: "casual",
    label: "Casual",
    description: "Relaxed everyday style",
  },
  {
    value: "formal",
    label: "Formal",
    description: "Polished and sophisticated",
  },
  {
    value: "party",
    label: "Party",
    description: "Stylish evening look",
  },
  {
    value: "work",
    label: "Work",
    description: "Smart professional style",
  },
];

function getImageUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

function normalizeType(type?: string) {
  return type?.toLowerCase().trim() || "";
}

function OutfitPiece({
  label,
  item,
}: {
  label: string;
  item?: ClothingItem;
}) {
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-w-0"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f6f4f6]">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
        />

        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold tracking-wide text-zinc-600 shadow-sm backdrop-blur-sm">
          {label}
        </div>
      </div>

      <div className="mt-2 min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-800">
          {item.name}
        </p>
        <p className="text-xs capitalize text-zinc-400">
          {item.clothing_type}
        </p>
      </div>
    </motion.div>
  );
}

export default function GenerateOutfitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [baseItemId, setBaseItemId] = useState<number | null>(null);
  const [occasion, setOccasion] = useState("casual");

  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);

  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [wardrobeError, setWardrobeError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [showWardrobe, setShowWardrobe] = useState(false);

  // --------------------------------------------------
  // Load wardrobe
  // --------------------------------------------------

  const fetchWardrobe = useCallback(async () => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    setIsLoadingWardrobe(true);
    setWardrobeError(null);

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

      if (!Array.isArray(data)) {
        throw new Error("Unexpected wardrobe response.");
      }

      setWardrobeItems(data);

      // ------------------------------------------------
      // If /generate?item=ID was used, select that item
      // ------------------------------------------------

      const queryItem = searchParams.get("item");

      if (queryItem) {
        const requestedId = Number(queryItem);

        const requestedItem = data.find(
          (item: ClothingItem) => item.id === requestedId
        );

        if (requestedItem) {
          setBaseItemId(requestedItem.id);
          return;
        }
      }

      // Otherwise select the first wardrobe item
      if (data.length > 0) {
        setBaseItemId((current) => current ?? data[0].id);
      }
    } catch (error) {
      setWardrobeError(
        error instanceof Error
          ? error.message
          : "Unable to load your wardrobe."
      );
    } finally {
      setIsLoadingWardrobe(false);
    }
  }, [router, searchParams]);

  useEffect(() => {
    fetchWardrobe();
  }, [fetchWardrobe]);

  // --------------------------------------------------
  // Selected base item
  // --------------------------------------------------

  const baseItem = useMemo(() => {
    return (
      wardrobeItems.find((item) => item.id === baseItemId) || null
    );
  }, [wardrobeItems, baseItemId]);

  // --------------------------------------------------
  // Select base item
  // --------------------------------------------------

  const handleSelectBaseItem = (id: number) => {
    setBaseItemId(id);
    setGeneratedOutfits([]);
    setGenerationError(null);
    setShowWardrobe(false);
  };

  // --------------------------------------------------
  // Clear base item
  // --------------------------------------------------

  const handleClearBaseItem = () => {
    setBaseItemId(null);
    setGeneratedOutfits([]);
    setGenerationError(null);
  };

  // --------------------------------------------------
  // Generate outfit
  // --------------------------------------------------

  const handleGenerateOutfit = async () => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!baseItemId) {
      setGenerationError("Please select a base item first.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedOutfits([]);

    try {
      const response = await fetch(
        `${API_BASE}/api/clothing/generate_outfit/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base_item_id: baseItemId,
            occasion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Failed to generate your outfit."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected outfit response from server.");
      }

      setGeneratedOutfits(data);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Failed to generate your outfit."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (isLoadingWardrobe) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fff9fc] via-[#faf8ff] to-[#f7f3ff]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-violet-400 shadow-lg">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>

            <p className="text-sm font-medium text-zinc-500">
              Loading your wardrobe...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-[#fff9fc] via-[#faf8ff] to-[#f7f3ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-400" />

                <span className="text-xs font-bold uppercase tracking-[0.22em] text-pink-500">
                  Zyvia AI
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Create your perfect outfit
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Pick an item and let Zyvia style the rest.
              </p>
            </div>

            <div className="hidden rounded-full border border-pink-100 bg-white/80 px-4 py-2 text-xs font-semibold text-zinc-500 shadow-sm sm:block">
              AI Stylist
            </div>
          </div>

          {/* Error */}
          {(wardrobeError || generationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <span>
                {generationError || wardrobeError}
              </span>

              <button
                onClick={() => {
                  setGenerationError(null);
                  setWardrobeError(null);
                }}
                className="ml-3 rounded-full p-1 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* Main layout */}
          <div className="grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)]">
            {/* =========================================
                LEFT - CONTROLS
            ========================================= */}

            <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_10px_40px_rgba(120,80,140,0.07)] backdrop-blur-xl sm:p-7">
              {/* STEP 1 */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                      Step 1
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-zinc-900">
                      Choose a base item
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                    <Shirt className="h-5 w-5 text-pink-500" />
                  </div>
                </div>

                {/* Selected base item */}
                {baseItem ? (
                  <motion.div
                    layout
                    className="overflow-hidden rounded-[22px] border border-pink-100 bg-[#fffafd]"
                  >
                    <div className="relative h-[280px] overflow-hidden bg-[#f8f5f7] sm:h-[320px]">
                      <img
                        src={getImageUrl(baseItem.image)}
                        alt={baseItem.name}
                        className="h-full w-full object-contain"
                      />

                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-pink-500 shadow-sm">
                        Selected
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-zinc-900">
                          {baseItem.name}
                        </p>

                        <p className="mt-1 text-sm capitalize text-zinc-400">
                          {baseItem.clothing_type} · {baseItem.style}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleClearBaseItem}
                        className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700"
                        aria-label="Clear base item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex h-[300px] flex-col items-center justify-center rounded-[22px] border border-dashed border-pink-200 bg-pink-50/30 text-center">
                    <Shirt className="mb-3 h-10 w-10 text-pink-300" />

                    <p className="font-semibold text-zinc-700">
                      Choose an item
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      Select something from your wardrobe below.
                    </p>
                  </div>
                )}

                {/* Wardrobe selector */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Your wardrobe
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowWardrobe(!showWardrobe)}
                      className="flex items-center gap-1 text-xs font-semibold text-pink-500 sm:hidden"
                    >
                      {showWardrobe ? "Hide" : "View all"}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          showWardrobe ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className={`grid grid-cols-4 gap-3 ${
                      showWardrobe ? "grid" : "hidden sm:grid"
                    }`}
                  >
                    {wardrobeItems.map((item) => {
                      const selected =
                        item.id === baseItemId;

                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() =>
                            handleSelectBaseItem(item.id)
                          }
                          className={`group relative aspect-square overflow-hidden rounded-2xl border-2 bg-[#f7f5f7] transition ${
                            selected
                              ? "border-pink-400 shadow-[0_6px_20px_rgba(236,72,153,0.18)]"
                              : "border-transparent hover:border-pink-100"
                          }`}
                        >
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          />

                          {selected && (
                            <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white shadow-md">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {wardrobeItems.length === 0 && (
                    <div className="rounded-2xl bg-zinc-50 p-5 text-center">
                      <p className="text-sm font-medium text-zinc-600">
                        Your wardrobe is empty.
                      </p>

                      <button
                        onClick={() => router.push("/upload")}
                        className="mt-2 text-sm font-semibold text-pink-500"
                      >
                        Add your first item →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="my-7 h-px bg-zinc-100" />

              {/* STEP 2 */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Step 2
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  What's the occasion?
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  We'll match the outfit to your style.
                </p>

                {/* Occasion cards */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {occasions.map((item) => {
                    const selected = occasion === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setOccasion(item.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-pink-300 bg-pink-50 shadow-sm"
                            : "border-zinc-100 bg-white hover:border-pink-100 hover:bg-pink-50/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-bold ${
                              selected
                                ? "text-pink-600"
                                : "text-zinc-700"
                            }`}
                          >
                            {item.label}
                          </span>

                          {selected && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] text-zinc-400">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Generate button */}
                <motion.button
                  whileHover={{ scale: baseItem ? 1.01 : 1 }}
                  whileTap={{ scale: baseItem ? 0.98 : 1 }}
                  type="button"
                  onClick={handleGenerateOutfit}
                  disabled={!baseItem || isGenerating}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-pink-200/40 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating your look...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Generate Outfit
                    </>
                  )}
                </motion.button>
              </div>
            </section>

            {/* =========================================
                RIGHT - RESULTS
            ========================================= */}

            <section className="min-h-[650px] rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_10px_40px_rgba(120,80,140,0.07)] backdrop-blur-xl sm:p-7">
              {/* Results header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
                    Zyvia AI
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-zinc-900">
                    Your generated looks
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    AI-curated combinations from your wardrobe.
                  </p>
                </div>

                {generatedOutfits.length > 0 && (
                  <div className="rounded-full bg-pink-50 px-4 py-2 text-xs font-bold text-pink-500">
                    {generatedOutfits.length}{" "}
                    {generatedOutfits.length === 1
                      ? "look"
                      : "looks"}
                  </div>
                )}
              </div>

              {/* Loading */}
              {isGenerating && (
                <div className="space-y-5">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-[24px] border border-zinc-100 bg-white p-5"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-3 w-20 rounded bg-zinc-100" />
                          <div className="h-5 w-36 rounded bg-zinc-100" />
                        </div>

                        <div className="h-8 w-20 rounded-full bg-zinc-100" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[1, 2, 3, 4].map((piece) => (
                          <div
                            key={piece}
                            className="aspect-square rounded-2xl bg-zinc-100"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!isGenerating &&
                generatedOutfits.length === 0 && (
                  <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[24px] border border-dashed border-zinc-200 bg-white/50 px-6 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100">
                      <Sparkles className="h-7 w-7 text-pink-500" />
                    </div>

                    <h3 className="text-lg font-bold text-zinc-800">
                      Your next look starts here
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                      Choose a base item, select an occasion, and
                      let Zyvia create a complete outfit from your
                      wardrobe.
                    </p>

                    {!baseItem && (
                      <button
                        onClick={() => {
                          const first = wardrobeItems[0];

                          if (first) {
                            setBaseItemId(first.id);
                          }
                        }}
                        className="mt-5 flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2.5 text-sm font-semibold text-pink-500 transition hover:bg-pink-100"
                      >
                        Choose an item
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

              {/* Results */}
              {!isGenerating && generatedOutfits.length > 0 && (
                <div className="space-y-5">
                  {generatedOutfits.map((outfit, index) => {
                    /*
                     * IMPORTANT FIX:
                     *
                     * The backend returns the selected item as `base`.
                     * If that base item is itself a Top, Bottom, or Shoes,
                     * the same item may also appear under that category.
                     *
                     * We therefore hide the duplicate category here.
                     */

                    const baseType = normalizeType(
                      outfit.base?.clothing_type
                    );

                    const displayTop =
                      baseType === "top"
                        ? undefined
                        : outfit.top;

                    const displayBottom =
                      baseType === "bottom"
                        ? undefined
                        : outfit.bottom;

                    const displayShoes =
                      baseType === "shoes"
                        ? undefined
                        : outfit.shoes;

                    const displayOuterwear =
                      baseType === "outerwear" ||
                      baseType === "outwear"
                        ? undefined
                        : outfit.outerwear;

                    const score =
                      typeof outfit.score === "number"
                        ? Math.round(outfit.score * 100)
                        : null;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.08,
                        }}
                        className="rounded-[24px] border border-zinc-100 bg-white p-5 shadow-sm sm:p-6"
                      >
                        {/* Look header */}
                        <div className="mb-5 flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-500">
                              Look {index + 1}
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-zinc-800">
                              {occasion === "casual"
                                ? "Casual look"
                                : occasion === "formal"
                                ? "Formal look"
                                : occasion === "party"
                                ? "Party look"
                                : "Work look"}
                            </h3>
                          </div>

                          {score !== null && (
                            <div className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-500">
                              Match {score}%
                            </div>
                          )}
                        </div>

                        {/* Outfit pieces */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          {outfit.base && (
                            <OutfitPiece
                              label="BASE"
                              item={outfit.base}
                            />
                          )}

                          {displayTop && (
                            <OutfitPiece
                              label="TOP"
                              item={displayTop}
                            />
                          )}

                          {displayBottom && (
                            <OutfitPiece
                              label="BOTTOM"
                              item={displayBottom}
                            />
                          )}

                          {displayShoes && (
                            <OutfitPiece
                              label="SHOES"
                              item={displayShoes}
                            />
                          )}

                          {displayOuterwear && (
                            <OutfitPiece
                              label="OUTERWEAR"
                              item={displayOuterwear}
                            />
                          )}
                        </div>

                        {/* Why it works */}
                        {outfit.explanation && (
                          <div className="mt-6 rounded-2xl bg-[#faf7fb] p-4">
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                              Why it works
                            </p>

                            <p className="text-sm leading-6 text-zinc-500">
                              {outfit.explanation}
                            </p>
                          </div>
                        )}

                        {/* Tags */}
                        {outfit.tags &&
                          outfit.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {outfit.tags.map((tag, tagIndex) => (
                                <span
                                  key={`${tag}-${tagIndex}`}
                                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium capitalize text-zinc-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* Action */}
                        <button
                          type="button"
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-500"
                        >
                          <Sparkles className="h-4 w-4" />
                          Save this look
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}