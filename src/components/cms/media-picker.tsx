import { Check, FileText, Image as ImageIcon, Loader2, Search, Upload, Video, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listMedia as fetchMediaRaw, uploadMedia, type MediaItem } from "@/lib/admin-api";

async function fetchMedia(_deleted = false) {
  return fetchMediaRaw();
}

type MediaKind = "images" | "videos" | "documents" | "all";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, item?: MediaItem) => void;
  selectedUrl?: string;
  title?: string;
  kind?: MediaKind;
};

function isImage(item: MediaItem) {
  return item.mime_type.startsWith("image/");
}

function isVideo(item: MediaItem) {
  return item.mime_type.startsWith("video/");
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  selectedUrl = "",
  title = "Choose from Media",
  kind = "images",
}: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchMedia(false));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    void load();
  }, [load, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      if (kind === "images" && !isImage(item)) return false;
      if (kind === "videos" && !isVideo(item)) return false;
      if (kind === "documents" && item.mime_type !== "application/pdf") return false;
      if (!needle) return true;
      return [item.original_name, item.filename, item.mime_type].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(needle),
      );
    });
  }, [items, kind, search]);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await uploadMedia(file);
      if (kind === "documents" && result.mime_type !== "application/pdf") {
        throw new Error("Please upload a PDF document.");
      }
      if (kind === "images" && !result.mime_type.startsWith("image/")) {
        throw new Error("Please upload an image file.");
      }
      if (kind === "videos" && !result.mime_type.startsWith("video/")) {
        throw new Error("Please upload an MP4, WebM, MOV, or OGV video.");
      }
      await load();
      onSelect(result.url, result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (!open) return null;
  const label =
    kind === "documents" ? "PDF" : kind === "images" ? "image" : kind === "videos" ? "video" : "file";
  const accept =
    kind === "documents"
      ? "application/pdf,.pdf"
      : kind === "images"
        ? "image/*"
        : kind === "videos"
          ? "video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogv"
          : "image/*,video/mp4,video/webm,video/quicktime,video/ogg,application/pdf,.pdf,.mp4,.webm,.mov,.ogv";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <button className="absolute inset-0" aria-label="Close media picker" onClick={onClose} />
      <section className="relative z-10 flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Select an existing {label} or upload a new one to the shared library.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="admin-primary-button cursor-pointer">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload new
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                disabled={uploading}
                onChange={(event) => void upload(event.target.files?.[0])}
              />
            </label>
            <button
              className="rounded-xl border border-black/10 p-2.5 hover:bg-black hover:text-white"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="border-b border-black/8 px-5 py-4 sm:px-7">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="form-input pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${label}s by filename…`}
              autoFocus
            />
          </label>
          {error ? (
            <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> Loading media…
            </div>
          ) : filtered.length === 0 ? (
            <button
              className="flex min-h-72 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 text-center hover:bg-[#fafaf8]"
              onClick={() => inputRef.current?.click()}
            >
              {kind === "documents" ? (
                <FileText className="size-8" />
              ) : kind === "videos" ? (
                <Video className="size-8" />
              ) : (
                <ImageIcon className="size-8" />
              )}
              <span className="mt-3 font-semibold">No matching {label}s</span>
              <span className="mt-1 text-sm text-muted-foreground">
                Upload a {label} to add it to Media.
              </span>
            </button>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => {
                const selected = item.url === selectedUrl;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.url, item);
                      onClose();
                    }}
                    className={`group overflow-hidden rounded-2xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg ${selected ? "border-violet-500 ring-2 ring-violet-200" : "border-black/10"}`}
                  >
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#eee]">
                      {isImage(item) ? (
                        <img
                          src={item.url}
                          alt={item.original_name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : isVideo(item) ? (
                        <div className="relative h-full w-full">
                          <video src={item.url} className="h-full w-full object-cover" muted preload="metadata" />
                          <span className="absolute inset-0 grid place-items-center bg-black/25 text-white">
                            <Video className="size-10" />
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FileText className="mx-auto size-12 text-red-600" />
                          <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                            PDF document
                          </span>
                        </div>
                      )}
                      {selected ? (
                        <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-violet-600 text-white">
                          <Check className="size-4" />
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3">
                      <div className="truncate text-xs font-semibold">{item.original_name}</div>
                      <div className="mt-1 truncate text-[10px] text-muted-foreground">
                        {item.mime_type}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
