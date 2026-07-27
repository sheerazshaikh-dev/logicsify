import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  FileText,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminButton,
  AdminCard,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  EmptyState,
  FieldLabel,
  adminInputClass,
} from "@/components/admin/admin-ui";
import { deleteMedia, listMedia, uploadMedia, type MediaItem } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/media")({ component: MediaPage });

function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMedia());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.original_name.toLowerCase().includes(query) ||
        (item.alt_text || "").toLowerCase().includes(query),
    );
  }, [items, search]);

  async function remove(item: MediaItem) {
    if (!window.confirm(`Move “${item.original_name}” to the recycle bin?`)) return;
    try {
      await deleteMedia(item.id);
      toast.success("Media moved to the recycle bin.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete media.");
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success("Media URL copied.");
  }

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Assets"
        title="Media Library"
        description="Upload and manage images, testimonial videos, PDFs and downloadable documents used across Logicsify content."
        actions={
          <AdminButton onClick={() => setUploadOpen(true)}>
            <UploadCloud className="h-4 w-4" /> Upload media
          </AdminButton>
        }
      />

      <AdminCard>
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={`${adminInputClass} pl-10`}
              placeholder="Search media…"
            />
          </div>
        </div>
        {loading ? (
          <AdminLoading label="Loading media…" />
        ) : !filtered.length ? (
          <EmptyState
            title="Media library is empty"
            description="Upload images, testimonial videos, PDFs or documents to start building your website library."
            action={
              <AdminButton onClick={() => setUploadOpen(true)}>
                <UploadCloud className="h-4 w-4" /> Upload media
              </AdminButton>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-[#FE3434]/30 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {item.mime_type.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.original_name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : item.mime_type.startsWith("video/") ? (
                    <div className="relative h-full w-full">
                      <video src={item.url} className="h-full w-full object-cover" muted preload="metadata" />
                      <span className="absolute inset-0 grid place-items-center bg-black/25 text-white">
                        <Video className="h-10 w-10" />
                      </span>
                    </div>
                  ) : (
                    <div className="grid h-full place-items-center text-slate-300">
                      <FileText className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 transition group-hover:translate-y-0">
                    <button
                      onClick={() => void copyUrl(item.url)}
                      className="rounded-lg bg-white/90 p-2 text-[#190A2F]"
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void remove(item)}
                      className="rounded-lg bg-white/90 p-2 text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-[#190A2F]">
                    {item.original_name}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {formatBytes(item.size_bytes)} · {item.mime_type}
                  </p>
                  {item.alt_text ? (
                    <p className="mt-2 line-clamp-2 text-[11px] text-slate-500">{item.alt_text}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminCard>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={async () => {
          setUploadOpen(false);
          await load();
        }}
      />
    </AdminShell>
  );
}

function UploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setAlt("");
    }
  }, [open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      await uploadMedia(file, alt);
      toast.success("Media uploaded.");
      await onUploaded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Upload media"
      description="Images and documents up to 12 MB. Testimonial videos support MP4, WebM, MOV and OGV; hosting limits still apply."
      width="max-w-xl"
    >
      <form onSubmit={submit} className="space-y-5">
        <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#FE3434]/50 hover:bg-[#FE3434]/[0.025]">
          {file?.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="mb-4 max-h-36 max-w-full rounded-xl object-contain"
            />
          ) : file?.type.startsWith("video/") ? (
            <video
              src={URL.createObjectURL(file)}
              className="mb-4 max-h-36 max-w-full rounded-xl object-contain"
              muted
              controls
            />
          ) : (
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#FE3434] shadow-sm">
              <UploadCloud className="h-6 w-6" />
            </span>
          )}
          <span className="text-sm font-semibold text-[#190A2F]">
            {file ? file.name : "Choose a file or drop it here"}
          </span>
          <span className="mt-2 text-xs text-slate-400">JPG, PNG, WebP, GIF, MP4, WebM, MOV, OGV, PDF or DOCX</span>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/ogg,application/pdf,.docx,.mp4,.webm,.mov,.ogv"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <div>
          <FieldLabel>Alt text</FieldLabel>
          <input
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            className={adminInputClass}
            placeholder="Describe the image/video for accessibility and internal reference"
          />
        </div>
        <div className="flex justify-end gap-2">
          <AdminButton variant="secondary" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={!file || uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}{" "}
            Upload
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}
