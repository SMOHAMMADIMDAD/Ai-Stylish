"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  User,
} from "lucide-react";
import * as auth from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await res.json();

      // Keep compatibility with your existing backend.
      const token = data.access || data.token;

      if (res.ok && token) {
        auth.loginUser(username, token);

        console.log(
          `[Login] ${username} logged in successfully.`
        );

        router.push("/");
      } else {
        const errorMessage =
          data.detail ||
          data.non_field_errors?.[0] ||
          "Invalid username or password.";

        console.warn(
          "[Login] Failed:",
          errorMessage
        );

        setError(errorMessage);
      }
    } catch (err) {
      console.error(
        "[Login] Unexpected error:",
        err
      );

      setError(
        "Could not connect to the server. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf7fb]">
      <div className="relative min-h-screen">

        {/* =========================================
            BACKGROUND DECORATION
        ========================================= */}

        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-32 h-[450px] w-[450px] rounded-full bg-violet-200/40 blur-3xl" />

        {/* =========================================
            HEADER
        ========================================= */}

        <header className="absolute left-0 right-0 top-0 z-20">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
            
            <Link
              href="/login"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 to-violet-300 shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div>
                <div className="text-xl font-bold tracking-tight text-zinc-900">
                  Zyvia
                </div>

                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                  AI Stylist
                </div>
              </div>
            </Link>

            <div className="text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-pink-500 transition hover:text-violet-500"
              >
                Register
              </Link>
            </div>
          </div>
        </header>

        {/* =========================================
            MAIN
        ========================================= */}

        <div className="relative mx-auto flex min-h-screen max-w-[1500px] items-center px-5 pb-10 pt-28 sm:px-8 lg:px-10 lg:pt-20">

          <div className="grid w-full overflow-hidden rounded-[36px] border border-white bg-white/70 shadow-[0_25px_80px_rgba(100,70,110,0.10)] backdrop-blur-xl lg:grid-cols-2">

            {/* =====================================
                LEFT BRAND / VISUAL PANEL
            ===================================== */}

            <section className="relative hidden min-h-[680px] overflow-hidden bg-gradient-to-br from-[#f8ddea] via-[#f2e5f7] to-[#e5def8] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">

              {/* Decorative circles */}

              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/35 blur-2xl" />

              <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />

              <div className="absolute right-16 top-1/3 h-24 w-24 rounded-full border border-white/50" />

              <div className="absolute bottom-24 right-24 h-14 w-14 rounded-full border border-white/60" />

              {/* Small label */}

              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 shadow-sm">
                  <Sparkles className="h-6 w-6 text-violet-500" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-500">
                  Welcome back
                </p>

                <h1 className="mt-4 max-w-lg text-4xl font-bold leading-[1.08] tracking-tight text-zinc-900 xl:text-5xl">
                  Your wardrobe.
                  <br />
                  Your style.
                  <br />
                  <span className="text-violet-500">
                    Your Zyvia.
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-zinc-600">
                  Pick a piece from your wardrobe and let Zyvia
                  help you discover what to wear next.
                </p>
              </div>

              {/* Fashion inspiration card */}

              <div className="relative">
                <div className="rounded-[28px] border border-white/60 bg-white/45 p-5 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80">
                      <Sparkles className="h-5 w-5 text-pink-500" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-zinc-800">
                        AI-powered styling
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Discover more from what you already own.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================
                LOGIN PANEL
            ===================================== */}

            <section className="flex min-h-[680px] items-center justify-center bg-white/90 p-6 sm:p-10 lg:p-12 xl:p-16">

              <div className="w-full max-w-[430px]">

                {/* Mobile logo */}

                <div className="mb-10 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 to-violet-300">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>

                  <div>
                    <p className="text-xl font-bold text-zinc-900">
                      Zyvia
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                      AI Stylist
                    </p>
                  </div>
                </div>

                {/* Heading */}

                <div className="mb-8">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-pink-500" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-pink-500">
                      Zyvia AI Stylist
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Sign in to continue styling your wardrobe.
                  </p>
                </div>

                {/* Error */}

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm font-semibold text-red-500">
                      {error}
                    </p>
                  </div>
                )}

                {/* Form */}

                <form
                  onSubmit={handleLogin}
                  className="space-y-5"
                >

                  {/* Username */}

                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500"
                    >
                      Username
                    </label>

                    <div className="relative">
                      <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-300" />

                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value)
                        }
                        placeholder="Enter your username"
                        autoComplete="username"
                        required
                        disabled={isLoading}
                        className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Password */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-xs font-bold uppercase tracking-wider text-zinc-500"
                      >
                        Password
                      </label>
                    </div>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-300" />

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                        className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-white hover:text-pink-500"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login button */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing you in...
                      </>
                    ) : (
                      <>
                        Sign in

                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}

                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-100" />

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                    or
                  </span>

                  <div className="h-px flex-1 bg-zinc-100" />
                </div>

                {/* Register */}

                <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-violet-50 p-4">
                  <p className="text-center text-sm text-zinc-500">
                    New to Zyvia?{" "}
                    <Link
                      href="/register"
                      className="font-bold text-pink-500 transition hover:text-violet-500"
                    >
                      Create your account
                    </Link>
                  </p>
                </div>

                {/* Footer */}

                <p className="mt-8 text-center text-[11px] leading-5 text-zinc-300">
                  By continuing, you agree to use Zyvia responsibly
                  and keep your account credentials secure.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}