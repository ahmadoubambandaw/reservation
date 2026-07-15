"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { uploadImage, type UploadType } from "@/lib/upload";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  type = "general",
  aspect = "square",
  className,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  type?: UploadType;
  aspect?: "square" | "wide";
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file, type);
      onChange(url);
      toast("Image téléversée.", "success");
    } catch (e) {
      toast(e instanceof ApiError ? (e.firstError ?? e.message) : "Erreur", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-dashed border-border bg-surface",
        aspect === "square" ? "aspect-square w-28" : "aspect-[16/6] w-full",
        className,
      )}
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="size-full object-cover" />
      ) : (
        <div className="grid size-full place-items-center text-muted-foreground">
          <ImagePlus className="size-6" />
        </div>
      )}

      {/* Overlay */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        {loading ? <Loader2 className="size-5 animate-spin" /> : value ? "Changer" : "Téléverser"}
      </button>

      {value && !loading && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Retirer"
        >
          <X className="size-3.5" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
