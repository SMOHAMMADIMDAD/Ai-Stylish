"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  ChevronRight,
  Eye,
  Lock,
  LogOut,
  Moon,
  Palette,
  Save,
  Sparkles,
  Sun,
  User,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import * as auth from "@/lib/auth";

interface CurrentUser {
  username?: string;
  email?: string;
  accessToken?: string;
}

interface SettingsState {
  aiPersonalization: boolean;
  outfitReminders: boolean;
  trendUpdates: boolean;
  emailNotifications: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  aiPersonalization: true,
  outfitReminders: true,
  trendUpdates: true,
  emailNotifications: false,
};

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [settings, setSettings] =
    useState<SettingsState>(DEFAULT_SETTINGS);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    setUser(currentUser);

    try {
      const stored = localStorage.getItem(
        "zyviaSettings"
      );

      if (stored) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(stored),
        });
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [router]);

  const updateSetting = (
    key: keyof SettingsState,
    value: boolean
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "zyviaSettings",
      JSON.stringify(settings)
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleLogout = () => {
    auth.logoutUser();
    router.push("/login");
  };

  const initial =
    user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-[#fff9fc] via-[#faf8ff] to-[#f7f3ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">

          {/* =========================================
              HEADER
          ========================================= */}

          <header className="mb-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-pink-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-pink-500">
                    Preferences
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  Settings
                </h1>

                <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
                  Customize your Zyvia experience and account
                  preferences.
                </p>
              </div>

              <button
                onClick={() => router.push("/profile")}
                className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-pink-200 hover:text-pink-500 sm:flex"
              >
                <User className="h-4 w-4" />
                Back to profile
              </button>
            </div>
          </header>

          {/* =========================================
              ACCOUNT CARD
          ========================================= */}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_10px_40px_rgba(120,80,140,0.07)] backdrop-blur-xl sm:p-7"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 text-xl font-bold text-pink-500">
                  {initial}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-500">
                    Signed in as
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-zinc-900">
                    {user?.username || "User"}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Your personal Zyvia account
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/profile")}
                className="flex items-center justify-center gap-2 rounded-full bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-pink-50 hover:text-pink-500"
              >
                View profile
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.section>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* =========================================
                AI PREFERENCES
            ========================================= */}

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[26px] border border-white bg-white/85 p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                    Zyvia AI
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-zinc-900">
                    Personalization
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-zinc-400">
                    Control how Zyvia uses your wardrobe preferences.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                </div>
              </div>

              <div className="space-y-2">
                <SettingToggle
                  icon={<Sparkles className="h-4 w-4" />}
                  title="AI personalization"
                  description="Use your wardrobe and style preferences for recommendations."
                  enabled={settings.aiPersonalization}
                  onChange={(value) =>
                    updateSetting(
                      "aiPersonalization",
                      value
                    )
                  }
                />

                <SettingToggle
                  icon={<Bell className="h-4 w-4" />}
                  title="Outfit reminders"
                  description="Receive reminders to discover and plan outfits."
                  enabled={settings.outfitReminders}
                  onChange={(value) =>
                    updateSetting(
                      "outfitReminders",
                      value
                    )
                  }
                />

                <SettingToggle
                  icon={<Eye className="h-4 w-4" />}
                  title="Trend updates"
                  description="Show fashion trend and styling inspiration updates."
                  enabled={settings.trendUpdates}
                  onChange={(value) =>
                    updateSetting(
                      "trendUpdates",
                      value
                    )
                  }
                />
              </div>
            </motion.section>

            {/* =========================================
                NOTIFICATIONS
            ========================================= */}

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[26px] border border-white bg-white/85 p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                    Notifications
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-zinc-900">
                    Stay updated
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-zinc-400">
                    Choose which updates you want to receive.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Bell className="h-5 w-5 text-violet-500" />
                </div>
              </div>

              <SettingToggle
                icon={<Bell className="h-4 w-4" />}
                title="Email notifications"
                description="Receive important Zyvia updates by email."
                enabled={settings.emailNotifications}
                onChange={(value) =>
                  updateSetting(
                    "emailNotifications",
                    value
                  )
                }
              />

              <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <Check className="h-4 w-4 text-emerald-500" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-zinc-700">
                      Your preferences are stored locally
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-400">
                      These settings are currently saved in this
                      browser. They can be connected to your backend
                      profile later.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* =========================================
                APPEARANCE
            ========================================= */}

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-[26px] border border-white bg-white/85 p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
                    Appearance
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-zinc-900">
                    Look & feel
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-zinc-400">
                    Choose how Zyvia should appear.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                  <Palette className="h-5 w-5 text-pink-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="rounded-2xl border-2 border-pink-300 bg-pink-50 p-4 text-left"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                    <Sun className="h-4 w-4 text-pink-500" />
                  </div>

                  <p className="text-sm font-bold text-zinc-800">
                    Light
                  </p>

                  <p className="mt-1 text-[11px] text-zinc-400">
                    Current theme
                  </p>
                </button>

                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-left opacity-60"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                    <Moon className="h-4 w-4 text-zinc-500" />
                  </div>

                  <p className="text-sm font-bold text-zinc-800">
                    Dark
                  </p>

                  <p className="mt-1 text-[11px] text-zinc-400">
                    Coming soon
                  </p>
                </button>
              </div>
            </motion.section>

            {/* =========================================
                SECURITY
            ========================================= */}

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[26px] border border-white bg-white/85 p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                    Security
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-zinc-900">
                    Account security
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-zinc-400">
                    Keep your Zyvia account secure.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <Lock className="h-5 w-5 text-violet-500" />
                </div>
              </div>

              <button
                type="button"
                disabled
                className="group flex w-full cursor-not-allowed items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-left opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-zinc-700">
                      Change password
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-400">
                      Password management
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
                  Coming soon
                </span>
              </button>

              <div className="mt-3 rounded-2xl bg-violet-50/60 p-4">
                <p className="text-xs font-semibold text-violet-600">
                  Secure authentication
                </p>

                <p className="mt-1 text-xs leading-5 text-violet-400">
                  Your authenticated requests continue to use the
                  existing Zyvia access-token system.
                </p>
              </div>
            </motion.section>
          </div>

          {/* =========================================
              SAVE BAR
          ========================================= */}

          <div className="sticky bottom-4 z-20 mt-6">
            <div className="flex flex-col gap-3 rounded-2xl border border-white bg-white/90 p-3 shadow-[0_10px_35px_rgba(80,60,100,0.12)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <div className="px-2">
                {saved ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-4 w-4" />
                    </div>

                    Settings saved
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    Changes are saved when you press Save preferences.
                  </p>
                )}
              </div>

              <button
                onClick={saveSettings}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-100 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Save className="h-4 w-4" />
                Save preferences
              </button>
            </div>
          </div>

          {/* =========================================
              LOGOUT
          ========================================= */}

          <section className="mb-8 mt-6 rounded-[26px] border border-red-100 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-800">
                  Sign out of Zyvia
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  You can sign back in whenever you want.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </section>

          {/* Mobile back button */}
          <button
            onClick={() => router.push("/profile")}
            className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-600 sm:hidden"
          >
            <User className="h-4 w-4" />
            Back to profile
          </button>
        </div>
      </div>
    </AppShell>
  );
}

/* =====================================================
   SETTING TOGGLE
===================================================== */

function SettingToggle({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl p-4 transition hover:bg-zinc-50">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            enabled
              ? "bg-pink-50 text-pink-500"
              : "bg-zinc-100 text-zinc-400"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-700">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-label={`Toggle ${title}`}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-gradient-to-r from-pink-500 to-violet-500"
            : "bg-zinc-200"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}