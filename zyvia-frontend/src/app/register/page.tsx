"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess(
          "Account created successfully. Redirecting you to login..."
        );

        setEmail("");
        setUsername("");
        setPassword("");

        setTimeout(() => {
          router.push("/login");
        }, 1800);
      } else {
        /*
         * Django may return validation errors in different formats.
         */
        let errorMessage = "Something went wrong.";

        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.username?.length) {
          errorMessage = `Username: ${data.username[0]}`;
        } else if (data.email?.length) {
          errorMessage = `Email: ${data.email[0]}`;
        } else if (data.password?.length) {
          errorMessage = `Password: ${data.password[0]}`;
        } else if (data.non_field_errors?.length) {
          errorMessage = data.non_field_errors[0];
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error(
        "[Register] Unexpected error:",
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

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-pink-200/40 blur-3xl" />

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
              Already a member?{" "}
              <Link
                href="/login"
                className="font-bold text-pink-500 transition hover:text-violet-500"
              >
                Sign in
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
                REGISTER FORM — LEFT ON DESKTOP
            ===================================== */}

            <section className="flex min-h-[720px] items-center justify-center bg-white/90 p-6 sm:p-10 lg:p-12 xl:p-16">

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
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">
                      Join Zyvia
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                    Create your account
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Start building your wardrobe and discover your
                    personal style.
                  </p>
                </div>

                {/* Success */}

                {success && (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

                    <p className="text-sm font-semibold leading-5 text-emerald-600">
                      {success}
                    </p>
                  </div>
                )}

                {/* Error */}

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm font-semibold leading-5 text-red-500">
                      {error}
                    </p>
                  </div>
                )}

                {/* Form */}

                <form
                  onSubmit={handleRegister}
                  className="space-y-5"
                >

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-300" />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        disabled={isLoading}
                        className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

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
                        placeholder="Choose a username"
                        autoComplete="username"
                        required
                        disabled={isLoading}
                        className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Password */}

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500"
                    >
                      Password
                    </label>

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
                        placeholder="Create a password"
                        autoComplete="new-password"
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

                  {/* Password hint */}

                  <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5">
                    <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-zinc-400" />

                    <p className="text-[11px] leading-4 text-zinc-400">
                      Choose a password you'll remember and keep it
                      private.
                    </p>
                  </div>

                  {/* Register button */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        Create account

                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Login link */}

                <div className="mt-7 rounded-2xl bg-gradient-to-r from-pink-50 to-violet-50 p-4">
                  <p className="text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-pink-500 transition hover:text-violet-500"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                {/* Footer */}

                <p className="mt-7 text-center text-[11px] leading-5 text-zinc-300">
                  Create your Zyvia account to organize your wardrobe
                  and discover AI-powered outfit ideas.
                </p>
              </div>
            </section>

            {/* =====================================
                RIGHT BRAND PANEL
            ===================================== */}

            <section className="relative hidden min-h-[720px] overflow-hidden bg-gradient-to-br from-[#e9def8] via-[#f3e5f7] to-[#f8dcea] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">

              {/* Decorative circles */}

              <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/35 blur-2xl" />

              <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />

              <div className="absolute left-16 top-1/3 h-24 w-24 rounded-full border border-white/50" />

              <div className="absolute bottom-24 left-24 h-14 w-14 rounded-full border border-white/60" />

              {/* Main message */}

              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 shadow-sm">
                  <Sparkles className="h-6 w-6 text-pink-500" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-500">
                  Start your style journey
                </p>

                <h2 className="mt-4 max-w-lg text-4xl font-bold leading-[1.08] tracking-tight text-zinc-900 xl:text-5xl">
                  Your clothes.
                  <br />
                  Your identity.
                  <br />
                  <span className="text-pink-500">
                    Your style.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-sm leading-7 text-zinc-600">
                  Build your digital wardrobe, discover new
                  combinations and let Zyvia become your personal AI
                  stylist.
                </p>
              </div>

              {/* Benefits */}

              <div className="relative space-y-3">
                {[
                  "Organize your digital wardrobe",
                  "Get personalized outfit recommendations",
                  "Generate looks for different occasions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 backdrop-blur-md"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80">
                      <CheckCircle2 className="h-4 w-4 text-pink-500" />
                    </div>

                    <p className="text-sm font-semibold text-zinc-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}