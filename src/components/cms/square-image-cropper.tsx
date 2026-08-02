import { Crop, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminButton } from "@/components/admin/admin-ui";
import { uploadMedia, type MediaItem } from "@/lib/admin-api";
import { API_BASE } from "@/lib/logicsify-api";

type Props = {
  sourceUrl: string;
  sourceName: string;
  onCancel: () => void;
  onComplete: (item: MediaItem) => void;
};

type LoadedSource = { image: HTMLImageElement; objectUrl: string };

export function SquareImageCropper({ sourceUrl, sourceName, onCancel, onComplete }: Props) {
  const [source, setSource] = useState<LoadedSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    setLoading(true);
    fetch(`${API_BASE}/public/connect-image?src=${encodeURIComponent(sourceUrl)}`, {
      credentials: "omit",
    })
      .then((response) => {
        if (!response.ok) throw new Error("The selected image could not be loaded for cropping.");
        return response.blob();
      })
      .then(async (blob) => {
        objectUrl = URL.createObjectURL(blob);
        const image = new Image();
        image.src = objectUrl;
        await image.decode();
        if (active) setSource({ image, objectUrl });
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Could not crop image.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [sourceUrl]);

  async function saveCrop() {
    if (!source) return;
    setSaving(true);
    try {
      const size = 1000;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not create the cropped image.");

      const image = source.image;
      const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
      const scale = baseScale * zoom;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const maxOffsetX = Math.max(0, (drawWidth - size) / 2);
      const maxOffsetY = Math.max(0, (drawHeight - size) / 2);
      const drawX = (size - drawWidth) / 2 + (positionX / 100) * maxOffsetX;
      const drawY = (size - drawHeight) / 2 + (positionY / 100) * maxOffsetY;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size, size);
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new Error("The crop could not be saved."))),
          "image/jpeg",
          0.94,
        ),
      );
      const baseName = sourceName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-") || "image";
      const file = new File([blob], `${baseName}-square.jpg`, { type: "image/jpeg" });
      const uploaded = await uploadMedia(file, `Square crop of ${sourceName}`);
      onComplete(uploaded);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the crop.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[340] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <section className="w-full max-w-4xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
        <header className="border-b border-black/8 px-6 py-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#190A2F]">
            <Crop className="h-5 w-5 text-[#FE3434]" /> Crop square image
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Adjust the image for square placements. The original Media Library file remains
            unchanged.
          </p>
        </header>
        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-3xl bg-slate-100 shadow-inner">
            {loading ? (
              <div className="grid h-full place-items-center text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
            ) : source ? (
              <img
                src={source.objectUrl}
                alt="Square crop preview"
                className="h-full w-full object-cover will-change-transform"
                style={{
                  transform: `translate(${positionX * 0.12}%, ${positionY * 0.12}%) scale(${zoom})`,
                }}
              />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center text-sm text-red-600">
                This image could not be loaded. Keep the original and choose another image.
              </div>
            )}
          </div>
          <div className="space-y-5">
            <CropControl label="Zoom" value={zoom} min={1} max={3} step={0.01} onChange={setZoom} />
            <CropControl
              label="Horizontal position"
              value={positionX}
              min={-100}
              max={100}
              step={1}
              onChange={setPositionX}
            />
            <CropControl
              label="Vertical position"
              value={positionY}
              min={-100}
              max={100}
              step={1}
              onChange={setPositionY}
            />
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPositionX(0);
                setPositionY(0);
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#190A2F]"
            >
              <RotateCcw className="h-4 w-4" /> Reset crop
            </button>
            <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
              The cropped copy is saved at 1000 × 1000 pixels. Images of any original dimensions can
              still be uploaded.
            </div>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-black/8 px-6 py-4">
          <AdminButton variant="secondary" disabled={saving} onClick={onCancel}>
            Back to Media
          </AdminButton>
          <AdminButton disabled={!source || saving} onClick={() => void saveCrop()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crop className="h-4 w-4" />}
            {saving ? "Saving crop…" : "Use square crop"}
          </AdminButton>
        </footer>
      </section>
    </div>
  );
}

function CropControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-semibold text-[#190A2F]">
        {label}
        <span className="text-xs font-normal text-slate-400">
          {value.toFixed(step < 1 ? 2 : 0)}
        </span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#FE3434]"
      />
    </label>
  );
}
