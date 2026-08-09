import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

export function NavigableLightbox({
  images,
  index,
  title,
  onIndexChange,
  onClose,
}: {
  images: string[];
  index: number;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") onIndexChange((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [images.length, index, onClose, onIndexChange]);

  if (!images.length) return null;
  return (
    <div
      className="fixed inset-0 z-[250] grid place-items-center bg-ink/95 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image viewer`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="Close image viewer"
      />
      <div className="relative z-10 flex h-full w-full max-w-7xl flex-col items-center justify-center">
        <div className="absolute right-0 top-0 flex items-center gap-3 text-white">
          <span className="text-xs font-semibold text-white/60">
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/10 p-3 transition hover:bg-white hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <img
          src={images[index]}
          alt={`${title} ${index + 1}`}
          className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
              className="absolute left-0 rounded-full border border-white/15 bg-white/10 p-3 text-white transition hover:bg-white hover:text-ink"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => onIndexChange((index + 1) % images.length)}
              className="absolute right-0 rounded-full border border-white/15 bg-white/10 p-3 text-white transition hover:bg-white hover:text-ink"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}
        <p className="mt-4 text-sm font-semibold text-white/75">{title}</p>
      </div>
    </div>
  );
}
