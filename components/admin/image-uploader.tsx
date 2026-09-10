"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface UploadedImage {
  url: string;
  publicId: string;
}

async function uploadToCloudinary(file: File): Promise<UploadedImage> {
  const sigRes = await fetch("/api/admin/cloudinary-signature", { method: "POST" });
  if (!sigRes.ok) {
    const body = await sigRes.json().catch(() => ({}));
    throw new Error(body.error || "Could not get an upload signature");
  }
  const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed");
  const data = await uploadRes.json();
  return { url: data.secure_url, publicId: data.public_id };
}

/** Single-image uploader — used for category/banner images and OG images. */
export function ImageUploader({
  value,
  onChange,
  label = "Image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    setError(null);
    try {
      const { url } = await uploadToCloudinary(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-charcoal">{label}</p>
      {value ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-sm border border-border">
          <Image src={value} alt="" fill sizes="128px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border text-ink-400 hover:border-maroon-400 disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-xs">{isUploading ? "Uploading..." : "Upload"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

/** Multi-image uploader — used for the product editor's gallery. */
export function MultiImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadToCloudinary));
      onChange([...images, ...uploaded.map((u) => u.url)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveToFront(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-charcoal">Product Images</p>
      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-sm border border-border">
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded-sm bg-maroon-600 px-1 text-[10px] text-white">
                Primary
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 py-0.5">
              {index !== 0 ? (
                <button type="button" onClick={() => moveToFront(index)} className="text-[10px] text-white hover:underline">
                  Make Primary
                </button>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => removeAt(index)} aria-label="Remove image">
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border text-ink-400 hover:border-maroon-400 disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-xs">{isUploading ? "Uploading..." : "Add"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
