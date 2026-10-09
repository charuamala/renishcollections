"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVariantSelection } from "@/components/products/variant-selection";

interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
  /** Set when the photo shows one specific variant (e.g. a colour). */
  variantId?: string | null;
}

const HOVER_ZOOM = 2;
const LIGHTBOX_ZOOM = 2.5;

export function ImageGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const selection = useVariantSelection();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hoverOrigin, setHoverOrigin] = useState<string | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openerRef = useRef<HTMLButtonElement>(null);

  // When a colour is picked, jump to its first photo — unless a photo of that colour is already showing.
  // Adjusting state during render (not in an effect) avoids a flash of the previous photo.
  const selectedVariantId = selection?.variantId ?? null;
  const [syncedVariantId, setSyncedVariantId] = useState<string | null>(null);
  if (selectedVariantId !== syncedVariantId) {
    setSyncedVariantId(selectedVariantId);
    if (selectedVariantId && images[activeIndex]?.variantId !== selectedVariantId) {
      const firstForVariant = images.findIndex((img) => img.variantId === selectedVariantId);
      if (firstForVariant !== -1) setActiveIndex(firstForVariant);
    }
  }

  /** Show a photo and, when it belongs to a colour, select that colour too. */
  const showImage = useCallback(
    (index: number) => {
      const next = (index + images.length) % images.length;
      setActiveIndex(next);
      const variantId = images[next]?.variantId;
      if (variantId && selection) {
        setSyncedVariantId(variantId);
        selection.setVariantId(variantId);
      }
    },
    [images, selection],
  );

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return <div className="aspect-[3/4] w-full rounded-sm bg-cream" />;
  }

  return (
    // min-w-0 lets a long thumbnail row scroll instead of widening the page grid.
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row-reverse">
      <button
        ref={openerRef}
        type="button"
        aria-label="Open photo full screen to zoom"
        onClick={() => setLightboxOpen(true)}
        // Hover magnifier only on devices with a real pointer; touch devices tap to open the viewer.
        onMouseMove={(e) => {
          if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setHoverOrigin(`${x}% ${y}%`);
        }}
        onMouseLeave={() => setHoverOrigin(null)}
        className="group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-sm bg-cream sm:flex-1"
      >
        {/* The magnifier transform lives on a wrapper: next/image owns the <img> style attribute. */}
        <span
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={hoverOrigin ? { transform: `scale(${HOVER_ZOOM})`, transformOrigin: hoverOrigin } : undefined}
        >
          <Image
            key={active.id}
            src={active.url}
            alt={active.altText || productName}
            fill
            loading="eager"
            fetchPriority={activeIndex === 0 ? "high" : undefined}
            // Requested larger than displayed so the 2× hover zoom stays sharp.
            sizes="(max-width: 640px) 100vw, 1100px"
            className="object-cover"
          />
        </span>
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-xs font-medium text-charcoal shadow-sm transition-opacity group-hover:opacity-0">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
          <span className="sm:hidden">Tap to zoom</span>
          <span className="hidden sm:inline">Hover or click to zoom</span>
        </span>
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:max-h-[min(80vh,720px)] sm:w-20 sm:flex-col sm:overflow-y-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              ref={(el) => {
                thumbnailRefs.current[index] = el;
              }}
              type="button"
              onClick={() => showImage(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border-2",
                index === activeIndex ? "border-maroon-600" : "border-transparent",
              )}
            >
              <Image src={image.url} alt={image.altText || productName} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={images}
          index={activeIndex}
          productName={productName}
          onNavigate={showImage}
          onClose={() => {
            setLightboxOpen(false);
            openerRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}

/** Full-screen photo viewer: arrows, keyboard, swipe, and tap/click-to-zoom with drag to pan. */
function Lightbox({
  images,
  index,
  productName,
  onNavigate,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  productName: string;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  // No easing while a finger/mouse is dragging, so panning tracks the pointer exactly.
  const [dragging, setDragging] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointer = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean } | null>(null);
  const image = images[index];

  const go = useCallback(
    (delta: number) => {
      setZoomed(false);
      setPan({ x: 0, y: 0 });
      onNavigate(index + delta);
    },
    [index, onNavigate],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  if (!image) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} photos`}
      className="fixed inset-0 z-[60] flex flex-col bg-charcoal text-ivory"
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <p className="text-sm" aria-live="polite">
          {index + 1} / {images.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        className={cn(
          "relative flex-1 select-none overflow-hidden",
          zoomed ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-zoom-in touch-pinch-zoom",
        )}
        onPointerDown={(e) => {
          pointer.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y, moved: false };
          if (zoomed) {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
          }
        }}
        onPointerMove={(e) => {
          const p = pointer.current;
          if (!p) return;
          const dx = e.clientX - p.startX;
          const dy = e.clientY - p.startY;
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) p.moved = true;
          if (zoomed) setPan({ x: p.panX + dx, y: p.panY + dy });
        }}
        onPointerUp={(e) => {
          const p = pointer.current;
          pointer.current = null;
          setDragging(false);
          if (!p) return;
          const dx = e.clientX - p.startX;
          if (!zoomed && p.moved && Math.abs(dx) > 50) {
            go(dx < 0 ? 1 : -1); // swipe between photos
            return;
          }
          if (!p.moved) {
            // Tap/click toggles zoom, centred on where the shopper tapped.
            if (zoomed) {
              setZoomed(false);
              setPan({ x: 0, y: 0 });
            } else {
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetX = e.clientX - (rect.left + rect.width / 2);
              const offsetY = e.clientY - (rect.top + rect.height / 2);
              setPan({ x: -offsetX * (LIGHTBOX_ZOOM - 1), y: -offsetY * (LIGHTBOX_ZOOM - 1) });
              setZoomed(true);
            }
          }
        }}
        onPointerCancel={() => {
          pointer.current = null;
          setDragging(false);
        }}
      >
        <div
          className={cn("absolute inset-0", !dragging && "transition-transform duration-200 ease-out")}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? LIGHTBOX_ZOOM : 1})` }}
        >
          <Image
            key={image.id}
            src={image.url}
            alt={image.altText || productName}
            fill
            sizes="100vw"
            quality={90}
            className="pointer-events-none object-contain"
            draggable={false}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex h-16 shrink-0 items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <p className="text-xs text-ivory/70">{zoomed ? "Drag to look around · tap to zoom out" : "Tap to zoom"}</p>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
