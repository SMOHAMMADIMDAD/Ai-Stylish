"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Shirt,
  Sparkles,
  WandSparkles,
  Compass,
  TrendingUp,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import * as auth from "@/lib/auth";

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Wardrobe",
    href: "/wardrobe",
    icon: Shirt,
  },
  {
    name: "Recommended",
    href: "/recommended",
    icon: Sparkles,
  },
  {
    name: "Generate Outfit",
    href: "/generate",
    icon: WandSparkles,
  },
  {
    name: "Explore",
    href: "/explore",
    icon: Compass,
  },
  {
    name: "Trends",
    href: "/trends",
    icon: TrendingUp,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [username, setUsername] = useState("User");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();

    if (currentUser?.username) {
      setUsername(currentUser.username);
    }
  }, []);

  const initial = username.charAt(0).toUpperCase();

  const handleLogout = () => {
    auth.logoutUser();
    router.push("/login");
  };

  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);
  };

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="hidden lg:flex fixed left-0 top-0 z-50 h-screen w-[270px] flex-col border-r border-zinc-200/60 bg-white/90 backdrop-blur-2xl">

        {/* Brand */}
        <div className="px-6 pt-7 pb-5">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-pink-300 via-fuchsia-300 to-violet-300 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Sparkles
                className="h-5 w-5 text-white"
                strokeWidth={2}
              />
            </div>

            <div>
              <div className="text-[20px] font-semibold tracking-tight text-zinc-900">
                Zyvia
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                AI Stylist
              </div>
            </div>
          </Link>
        </div>

        {/* Create outfit */}
        <div className="px-5 pb-6">
          <button
            type="button"
            onClick={() => router.push("/generate")}
            className="group flex w-full items-center gap-3 rounded-2xl bg-zinc-900 px-4 py-3.5 text-left text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <WandSparkles
                className="h-[17px] w-[17px]"
                strokeWidth={1.8}
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">
                Create an outfit
              </p>

              <p className="mt-0.5 text-[10px] text-white/50">
                Let AI style you
              </p>
            </div>

            <span className="text-white/40 transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-4">

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Discover
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-pink-50 to-violet-50 text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-pink-400 to-violet-500" />
                  )}

                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                      active
                        ? "bg-white shadow-sm"
                        : "bg-transparent group-hover:bg-white"
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] ${
                        active
                          ? "text-pink-500"
                          : "text-zinc-400 group-hover:text-zinc-600"
                      }`}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span
                    className={`text-sm ${
                      active
                        ? "font-semibold"
                        : "font-medium"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Account */}
          <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Account
          </p>

          <div className="space-y-1">

            <Link
              href="/profile"
              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200 ${
                isActive("/profile")
                  ? "bg-gradient-to-r from-pink-50 to-violet-50 text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 group-hover:bg-white">
                <User
                  className="h-[18px] w-[18px] text-zinc-400 group-hover:text-zinc-600"
                  strokeWidth={1.8}
                />
              </div>

              <span className="text-sm font-medium">
                Profile
              </span>
            </Link>

            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-zinc-500 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-transparent group-hover:bg-white">
                <Settings
                  className="h-[18px] w-[18px] text-zinc-400 group-hover:text-zinc-600"
                  strokeWidth={1.8}
                />
              </div>

              <span className="text-sm font-medium">
                Settings
              </span>
            </button>

          </div>
        </nav>

        {/* User */}
        <div className="border-t border-zinc-200/60 p-4">

          <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2.5">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-violet-200 text-sm font-semibold text-zinc-700">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-800">
                {username}
              </p>

              <p className="text-[10px] text-zinc-400">
                Personal wardrobe
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
          >
            <LogOut
              className="h-[17px] w-[17px] transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.8}
            />

            <span className="text-xs font-medium">
              Log out
            </span>
          </button>

        </div>
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200/60 bg-white/85 px-5 py-3 backdrop-blur-xl lg:hidden">

        <Link
          href="/"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-300 to-violet-300">
            <Sparkles
              className="h-[18px] w-[18px] text-white"
              strokeWidth={2}
            />
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight text-zinc-900">
              Zyvia
            </p>

            <p className="-mt-1 text-[8px] font-medium uppercase tracking-[0.16em] text-zinc-400">
              AI Stylist
            </p>
          </div>
        </Link>

        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white shadow-sm"
        >
          {initial}
        </Link>
      </header>

      {/* =====================================================
          MOBILE MORE MENU
      ===================================================== */}

      {moreOpen && (
        <>
          <button
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-40 bg-black/10 lg:hidden"
          />

          <div className="fixed bottom-[76px] right-4 z-50 w-52 rounded-2xl border border-zinc-200/70 bg-white p-2 shadow-xl lg:hidden">

            <Link
              href="/trends"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              Trends
            </Link>

            <Link
              href="/profile"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <User className="h-4 w-4 text-zinc-400" />
              Profile
            </Link>

            <Link
              href="/settings"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              Settings
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>

          </div>
        </>
      )}

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/60 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-2xl lg:hidden">

        <div className="mx-auto flex h-[62px] max-w-lg items-center justify-around">

          {/* Home */}
          <Link
            href="/"
            className={`flex min-w-[54px] flex-col items-center justify-center gap-1 ${
              isActive("/")
                ? "text-pink-500"
                : "text-zinc-400"
            }`}
          >
            <Home
              className="h-[20px] w-[20px]"
              strokeWidth={isActive("/") ? 2.2 : 1.8}
            />

            <span className="text-[9px] font-medium">
              Home
            </span>
          </Link>

          {/* Wardrobe */}
          <Link
            href="/wardrobe"
            className={`flex min-w-[54px] flex-col items-center justify-center gap-1 ${
              isActive("/wardrobe")
                ? "text-pink-500"
                : "text-zinc-400"
            }`}
          >
            <Shirt
              className="h-[20px] w-[20px]"
              strokeWidth={isActive("/wardrobe") ? 2.2 : 1.8}
            />

            <span className="text-[9px] font-medium">
              Wardrobe
            </span>
          </Link>

          {/* Generate */}
          <Link
            href="/generate"
            className="relative -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg"
          >
            <WandSparkles
              className="h-6 w-6"
              strokeWidth={1.8}
            />

            <span className="absolute -bottom-4 text-[9px] font-medium text-zinc-500">
              Create
            </span>
          </Link>

          {/* Recommended */}
          <Link
            href="/recommended"
            className={`flex min-w-[54px] flex-col items-center justify-center gap-1 ${
              isActive("/recommended")
                ? "text-pink-500"
                : "text-zinc-400"
            }`}
          >
            <Sparkles
              className="h-[20px] w-[20px]"
              strokeWidth={
                isActive("/recommended") ? 2.2 : 1.8
              }
            />

            <span className="text-[9px] font-medium">
              For you
            </span>
          </Link>

          {/* More */}
          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            className={`flex min-w-[54px] flex-col items-center justify-center gap-1 ${
              moreOpen
                ? "text-pink-500"
                : "text-zinc-400"
            }`}
          >
            <MoreHorizontal
              className="h-[20px] w-[20px]"
              strokeWidth={1.8}
            />

            <span className="text-[9px] font-medium">
              More
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}