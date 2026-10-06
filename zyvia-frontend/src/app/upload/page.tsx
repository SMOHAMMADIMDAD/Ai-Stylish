"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Sparkles,
  X,
  Shirt,
  Tag,
  Palette,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "../components/layout/AppShell";

export default function UploadClothing() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [clothingType, setClothingType] = useState("Top");
  const [style, setStyle] = useState("casual");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const [message, setMessage] = useState("");

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please select a valid image file.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStatus("idle");
    setMessage("");
  };

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const file = event.dataTransfer.files?.[0];

      if (file) {
        handleImageChange(file);
      }
    },
    [preview]
  );

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);
    setStatus("idle");
    setMessage("");
  };

  const resetForm = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setName("");
    setClothingType("Top");
    setStyle("casual");
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      setStatus("error");
      setMessage("Please select an image before adding your item.");
      return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.accessToken) {
      setStatus("error");
      setMessage("You must be logged in to add clothing.");
      return;
    }

    setStatus("uploading");
    setMessage("Analyzing and adding your item...");

    const formData = new FormData();

    formData.append(
      "name",
      name.trim() || image.name.split(".")[0]
    );

    formData.append("clothing_type", clothingType);
    formData.append("style", style);
    formData.append("image", image);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/clothing/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
          body: formData,
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("success");
        setMessage(
          "Your item has been added to your wardrobe successfully."
        );

        resetForm();
      } else {
        let errorMessage = "Unable to add this item.";

        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.image?.[0]) {
          errorMessage = data.image[0];
        } else if (data.clothing_type?.[0]) {
          errorMessage = data.clothing_type[0];
        } else if (data.style?.[0]) {
          errorMessage = data.style[0];
        } else {
          errorMessage = JSON.stringify(data);
        }

        setStatus("error");
        setMessage(errorMessage);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        "Could not connect to the server. Please make sure your Django backend is running."
      );
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push("/wardrobe")}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft size={17} />
                Back to Wardrobe
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 text-violet-600">
                  <Shirt size={22} />
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Add to Wardrobe
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Add a new piece and let Zyvia understand your style.
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md sm:flex sm:items-center sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-violet-100">
                <Sparkles size={17} className="text-violet-600" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  AI-Powered Wardrobe
                </p>
                <p className="text-[11px] text-slate-500">
                  Automatic clothing analysis
                </p>
              </div>
            </div>
          </div>

          {/* Main layout */}
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

            {/* LEFT — Image upload */}
            <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_60px_rgba(124,58,237,0.08)] backdrop-blur-xl sm:p-7">

              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <ImagePlus size={19} className="text-violet-600" />
                  <h2 className="font-semibold text-slate-900">
                    Clothing photo
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Upload a clear photo of the clothing item.
                </p>
              </div>

              {/* Upload area */}
              <div
                onClick={() =>
                  document.getElementById("file-upload")?.click()
                }
                onDrop={onDrop}
                onDragOver={onDragOver}
                className={`group relative min-h-[360px] cursor-pointer overflow-hidden rounded-[24px] border-2 border-dashed transition-all duration-300 ${
                  preview
                    ? "border-violet-200 bg-violet-50/30"
                    : "border-slate-200 bg-gradient-to-br from-pink-50/60 via-white to-violet-50/70 hover:border-violet-300 hover:bg-violet-50/50"
                }`}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(
                      e.target.files?.[0] || null
                    )
                  }
                  className="hidden"
                />

                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Clothing preview"
                      className="h-[360px] w-full object-contain p-4"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-600 shadow-lg backdrop-blur-md transition hover:bg-white hover:text-red-500"
                    >
                      <X size={18} />
                    </button>

                    {/* Selected label */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md">
                        <CheckCircle
                          size={18}
                          className="text-emerald-500"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {image?.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            Image selected
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-pink-100 to-violet-100 shadow-sm transition duration-300 group-hover:scale-105">
                      <UploadCloud
                        size={34}
                        strokeWidth={1.8}
                        className="text-violet-600"
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800">
                      Drop your clothing photo here
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Or click anywhere in this area to browse
                      your device.
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
                        PNG
                      </span>

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
                        JPG
                      </span>

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
                        GIF
                      </span>
                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-xs font-medium text-violet-600">
                      <Sparkles size={13} />
                      Zyvia will analyze your item automatically
                    </div>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">
                    Clear photo
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Avoid blurry images.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">
                    Good lighting
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Natural light works well.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">
                    Single item
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    One clothing piece per photo.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT — Details */}
            <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_60px_rgba(124,58,237,0.08)] backdrop-blur-xl sm:p-7">

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Tag size={19} className="text-violet-600" />
                  <h2 className="font-semibold text-slate-900">
                    Item details
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Tell us a little about this piece.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Item name
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. White Oversized Hoodie"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>

                  <div className="relative">
                    <Shirt
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={clothingType}
                      onChange={(e) =>
                        setClothingType(e.target.value)
                      }
                      className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="Top">Top</option>
                      <option value="Bottom">Bottom</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Outerwear">Outerwear</option>
                    </select>
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Style
                  </label>

                  <div className="relative">
                    <Palette
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={style}
                      onChange={(e) =>
                        setStyle(e.target.value)
                      }
                      className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="party">Party</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>
                </div>

                {/* AI information */}
                <div className="rounded-[22px] border border-violet-100 bg-gradient-to-br from-pink-50/70 to-violet-50/70 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Sparkles
                        size={17}
                        className="text-violet-600"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        AI analysis
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Zyvia will automatically analyze the
                        image for color and clothing features
                        after you upload it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                {message && (
                  <div
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                      status === "success"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : status === "error"
                        ? "border-red-100 bg-red-50 text-red-700"
                        : "border-blue-100 bg-blue-50 text-blue-700"
                    }`}
                  >
                    {status === "success" && (
                      <CheckCircle
                        size={19}
                        className="mt-0.5 shrink-0"
                      />
                    )}

                    {status === "error" && (
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0"
                      />
                    )}

                    <span className="leading-5">
                      {message}
                    </span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "uploading"}
                  className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(168,85,247,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(168,85,247,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "uploading" ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>

                      <span>Analyzing your item...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud
                        size={19}
                        className="transition-transform group-hover:-translate-y-0.5"
                      />

                      <span>Add to My Wardrobe</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  By adding this item, it will become available
                  for your personalized outfit recommendations.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}