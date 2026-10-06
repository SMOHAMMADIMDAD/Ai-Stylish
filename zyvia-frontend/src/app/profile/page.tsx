"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  ChevronRight,
  Edit3,
  LogOut,
  Mail,
  Shirt,
  Sparkles,
  User,
  Wand2,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import * as auth from "@/lib/auth";

interface UserData {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface ClothingItem {
  id: number;
  name: string;
  image: string;
  clothing_type: string;
  style: string;
}

const API_BASE = "http://127.0.0.1:8000";

function getImageUrl(url: string) {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  return `${API_BASE}${url}`;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    try {
      /*
       * Get profile information from the backend.
       */
      const userResponse = await fetch(`${API_BASE}/api/user/`, {
        headers: {
          Authorization: `Bearer ${currentUser.accessToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else {
        /*
         * Fallback to the locally stored username
         * if the profile endpoint doesn't return data.
         */
        setUser({
          username: currentUser.username,
        });
      }

      /*
       * Load wardrobe statistics.
       */
      const wardrobeResponse = await fetch(
        `${API_BASE}/api/clothing/`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
        }
      );

      if (wardrobeResponse.ok) {
        const wardrobeData = await wardrobeResponse.json();

        if (Array.isArray(wardrobeData)) {
          setWardrobeItems(wardrobeData);
        }
      }
    } catch {
      setUser({
        username: currentUser.username,
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const username =
    user?.username ||
    auth.getCurrentUser()?.username ||
    "User";

  const displayName =
    user?.first_name || user?.last_name
      ? `${user.first_name || ""} ${
          user.last_name || ""
        }`.trim()
      : username;

  const initial = displayName.charAt(0).toUpperCase();

  const wardrobeCount = wardrobeItems.length;

  const styleStats = useMemo(() => {
    const styles: Record<string, number> = {};

    wardrobeItems.forEach((item) => {
      const style = item.style?.toLowerCase();

      if (style) {
        styles[style] = (styles[style] || 0) + 1;
      }
    });

    return Object.entries(styles)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [wardrobeItems]);

  const categoryStats = useMemo(() => {
    const categories: Record<string, number> = {};

    wardrobeItems.forEach((item) => {
      const category = item.clothing_type?.toLowerCase();

      if (category) {
        categories[category] =
          (categories[category] || 0) + 1;
      }
    });

    return categories;
  }, [wardrobeItems]);

  const handleLogout = () => {
    auth.logoutUser();
    router.push("/login");
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-[#fff9fc] via-[#faf8ff] to-[#f7f3ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">

          {/* =========================================
              HEADER
          ========================================= */}

          <header className="mb-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-pink-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-pink-500">
                    Account
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  Your profile
                </h1>

                <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
                  Manage your account and see your personal style
                  overview.
                </p>
              </div>

              <button
                onClick={() => router.push("/settings")}
                className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-pink-200 hover:text-pink-500 sm:flex"
              >
                <Edit3 className="h-4 w-4" />
                Edit profile
              </button>
            </div>
          </header>

          {/* =========================================
              PROFILE HERO
          ========================================= */}

          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-7 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#f8ddea] via-[#f3e6f7] to-[#e7def8] p-6 shadow-[0_12px_40px_rgba(120,80,140,0.08)] sm:p-8"
          >
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/30 blur-3xl" />

            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-pink-200/30 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white text-3xl font-bold text-pink-500 shadow-sm sm:h-28 sm:w-28 sm:text-4xl">
                    {loading ? "…" : initial}
                  </div>

                  <button
                    onClick={() => router.push("/settings")}
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition hover:scale-105"
                    aria-label="Change profile photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                    Zyvia member
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">
                    {loading ? "Loading..." : displayName}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                    <Mail className="h-4 w-4" />

                    <span>
                      {user?.email || "Personal wardrobe"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/60 px-5 py-4 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Your wardrobe
                </p>

                <p className="mt-1 text-3xl font-bold text-zinc-900">
                  {wardrobeCount}
                </p>

                <p className="text-xs text-zinc-400">
                  pieces available
                </p>
              </div>
            </div>
          </motion.section>

          {/* =========================================
              STAT CARDS
          ========================================= */}

          <section className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Wardrobe",
                value: wardrobeCount,
                description: "pieces",
                icon: Shirt,
              },
              {
                label: "Styles",
                value: Object.keys(
                  styleStats.reduce(
                    (acc, [style]) => ({
                      ...acc,
                      [style]: true,
                    }),
                    {} as Record<string, boolean>
                  )
                ).length,
                description: "style types",
                icon: Sparkles,
              },
              {
                label: "Tops",
                value: categoryStats["top"] || 0,
                description: "in wardrobe",
                icon: Shirt,
              },
              {
                label: "Bottoms",
                value: categoryStats["bottom"] || 0,
                description: "in wardrobe",
                icon: Shirt,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-[22px] border border-white bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {stat.label}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-zinc-900">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        {stat.description}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                      <Icon className="h-5 w-5 text-pink-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>

          {/* =========================================
              MAIN CONTENT
          ========================================= */}

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

            {/* Style overview */}
            <section className="rounded-[26px] border border-white bg-white/80 p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                    Personal style
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-zinc-900">
                    Your style overview
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Based on the pieces in your wardrobe.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </div>
              </div>

              {styleStats.length > 0 ? (
                <div className="space-y-5">
                  {styleStats.map(([style, count]) => {
                    const percentage =
                      wardrobeCount > 0
                        ? Math.round(
                            (count / wardrobeCount) * 100
                          )
                        : 0;

                    return (
                      <div key={style}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold capitalize text-zinc-700">
                            {style}
                          </span>

                          <span className="text-xs font-medium text-zinc-400">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${percentage}%`,
                            }}
                            transition={{ duration: 0.7 }}
                            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl bg-zinc-50 p-7 text-center">
                  <Sparkles className="mx-auto h-7 w-7 text-pink-300" />

                  <p className="mt-3 text-sm font-semibold text-zinc-600">
                    Add clothing to discover your style profile.
                  </p>

                  <button
                    onClick={() => router.push("/upload")}
                    className="mt-3 text-sm font-bold text-pink-500"
                  >
                    Add clothing →
                  </button>
                </div>
              )}
            </section>

            {/* Account actions */}
            <section className="rounded-[26px] border border-white bg-white/80 p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                  Account
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  Manage your account
                </h2>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => router.push("/settings")}
                  className="group flex w-full items-center justify-between rounded-2xl p-4 text-left transition hover:bg-pink-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 group-hover:bg-white">
                      <User className="h-4 w-4 text-zinc-500" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-zinc-700">
                        Profile settings
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-400">
                        Update your account details
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => router.push("/wardrobe")}
                  className="group flex w-full items-center justify-between rounded-2xl p-4 text-left transition hover:bg-pink-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 group-hover:bg-white">
                      <Shirt className="h-4 w-4 text-zinc-500" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-zinc-700">
                        My wardrobe
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-400">
                        Manage your clothing collection
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => router.push("/recommended")}
                  className="group flex w-full items-center justify-between rounded-2xl p-4 text-left transition hover:bg-pink-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 group-hover:bg-white">
                      <Sparkles className="h-4 w-4 text-zinc-500" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-zinc-700">
                        AI recommendations
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-400">
                        See your personalized looks
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1" />
                </button>
              </div>

              <div className="my-5 h-px bg-zinc-100" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl p-4 text-left text-red-500 transition hover:bg-red-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <LogOut className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Log out
                  </p>

                  <p className="mt-0.5 text-xs text-red-300">
                    Sign out of your Zyvia account
                  </p>
                </div>
              </button>
            </section>
          </div>

          {/* =========================================
              RECENT WARDROBE
          ========================================= */}

          <section className="mt-6 rounded-[26px] border border-white bg-white/80 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                  Your collection
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  Recent wardrobe
                </h2>
              </div>

              <button
                onClick={() => router.push("/wardrobe")}
                className="flex items-center gap-1 text-sm font-semibold text-pink-500"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {wardrobeItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {wardrobeItems.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      router.push(
                        `/generate?item=${item.id}`
                      )
                    }
                    className="group overflow-hidden rounded-2xl bg-zinc-50 text-left transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="aspect-square overflow-hidden bg-[#f6f4f6]">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-3">
                      <p className="truncate text-xs font-bold text-zinc-700">
                        {item.name}
                      </p>

                      <p className="mt-1 text-[10px] capitalize text-zinc-400">
                        {item.style}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-zinc-50 p-8 text-center">
                <Shirt className="mx-auto h-8 w-8 text-zinc-300" />

                <p className="mt-3 text-sm font-semibold text-zinc-600">
                  Your wardrobe is waiting.
                </p>

                <button
                  onClick={() => router.push("/upload")}
                  className="mt-3 text-sm font-bold text-pink-500"
                >
                  Add clothing →
                </button>
              </div>
            )}
          </section>

          {/* =========================================
              FINAL CTA
          ========================================= */}

          <section className="mt-6 mb-8 overflow-hidden rounded-[26px] bg-gradient-to-r from-[#fce6f1] to-[#eee8fb] p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                  Your AI stylist
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  Ready for your next look?
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Let Zyvia turn your wardrobe into something new.
                </p>
              </div>

              <button
                onClick={() => router.push("/generate")}
                className="flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Wand2 className="h-4 w-4" />
                Create an outfit
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Mobile edit button */}
          <button
            onClick={() => router.push("/settings")}
            className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl sm:hidden"
            aria-label="Edit profile"
          >
            <Edit3 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}