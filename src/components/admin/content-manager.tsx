import {
  Archive,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Edit3,
  Eye,
  FilePlus2,
  History,
  Image as ImageIcon,
  Monitor,
  Video,
  Redo2,
  Undo2,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  bulkContent,
  createContent,
  deleteContent,
  duplicateContent,
  exportContent,
  getContentRevisions,
  importContent,
  listContent,
  restoreContentRevision,
  updateContent,
  type ContentItem,
  type ContentImportReport,
  type ContentSection,
} from "@/lib/admin-api";
import {
  AdminButton,
  AdminCard,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  EmptyState,
  FieldLabel,
  StatusBadge,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import { AdminShell } from "@/components/admin/admin-shell";
import { NativePageVisualEditor } from "@/components/cms/native-page-visual-editor";
import type { CmsNativeContent, VisualAdminPage } from "@/lib/cms-visual";
import { useUndoHistory } from "@/lib/use-undo-history";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaPicker } from "@/components/cms/media-picker";
import { contentPublicPath, isVisualEditableType, visualEditorPath } from "@/lib/content-routes";

const emptyItem = (type: ContentItem["content_type"]): Partial<ContentItem> => ({
  content_type: type,
  title: "",
  slug: "",
  status: "draft",
  featured: false,
  excerpt: "",
  featured_image: "",
  content_json: {
    body: "",
    sections: [],
    category: "",
    tags: [],
    quote: "",
    role: "",
    client_name: "",
    company: "",
    project_type: "",
    testimonial_type: "text",
    video_url: "",
    video_poster: "",
    client_image: "",
    author: "",
    author_role: "",
    article_type: "article",
    reading_time: "",
    source_name: "",
    source_url: "",
    sources: [],
    industry: "",
    client_logo: "",
    challenge: "",
    objectives: "",
    solution: "",
    work_completed: [],
    timeline: "",
    technology_stack: [],
    integrations: [],
    desktop_screenshots: [],
    mobile_screenshots: [],
    gallery: [],
    measurable_results: [],
    services: [],
    live_url: "",
    download_file: "",
    preview_image: "",
    file_type: "",
    file_size: "",
    includes: [],
    audience: "",
    related_service: "",
    problems: [],
    capabilities: [],
    workflow: [],
    technologies: [],
    faqs: [],
    related: [],
    use_cases: [],
  },
  seo_json: { title: "", description: "", canonical: "", noindex: false, og_image: "" },
  published_at: "",
  sort_order: 0,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ContentManagerPage({
  type,
  title,
  singular,
  description,
}: {
  type: ContentItem["content_type"];
  title: string;
  singular: string;
  description: string;
}) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [meta, setMeta] = useState<{
    page: number;
    pages: number;
    total: number;
    counters: Record<string, number>;
  }>({
    page: 1,
    pages: 1,
    total: 0,
    counters: {},
  });
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ContentItem>>(emptyItem(type));
  const [transferring, setTransferring] = useState(false);
  const [importReport, setImportReport] = useState<ContentImportReport | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const supportsJsonTransfer = [
    "insight",
    "case_study",
    "portfolio",
    "resource",
    "comparison",
    "engagement_model",
    "testimonial",
  ].includes(type);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listContent({ type, status, search, page, perPage: 25 });
      setItems(result.data);
      setMeta({
        page: result.meta.page || 1,
        pages: result.meta.pages || 1,
        total: result.meta.total || 0,
        counters: result.meta.counters || {},
      });
      setSelected([]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Could not load ${title.toLowerCase()}.`,
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status, title, type]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setEditing(emptyItem(type));
    setEditorOpen(true);
  }

  function openEdit(item: ContentItem) {
    setEditing({
      ...item,
      featured: Boolean(item.featured),
      content_json: {
        body: "",
        sections: [],
        category: "",
        tags: [],
        quote: "",
        role: "",
        client_name: "",
        company: "",
        project_type: "",
        testimonial_type: "text",
        video_url: "",
        video_poster: "",
        client_image: "",
        author: "",
        author_role: "",
        article_type: "article",
        reading_time: "",
        source_name: "",
        source_url: "",
        sources: [],
        industry: "",
        client_logo: "",
        challenge: "",
        objectives: "",
        solution: "",
        work_completed: [],
        timeline: "",
        technology_stack: [],
        integrations: [],
        desktop_screenshots: [],
        mobile_screenshots: [],
        gallery: [],
        measurable_results: [],
        services: [],
        live_url: "",
        download_file: "",
        preview_image: "",
        file_type: "",
        file_size: "",
        includes: [],
        audience: "",
        related_service: "",
        problems: [],
        capabilities: [],
        workflow: [],
        technologies: [],
        faqs: [],
        related: [],
        use_cases: [],
        ...(item.content_json || {}),
      },
      seo_json: {
        title: "",
        description: "",
        canonical: "",
        noindex: false,
        og_image: "",
        ...(item.seo_json || {}),
      },
    });
    setEditorOpen(true);
  }

  async function remove(id: number) {
    if (!window.confirm(`Move this ${singular.toLowerCase()} to the recycle bin?`)) return;
    try {
      await deleteContent(id);
      toast.success(`${singular} moved to the recycle bin.`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the item.");
    }
  }

  async function duplicate(id: number) {
    try {
      await duplicateContent(id);
      toast.success(`${singular} duplicated as a draft.`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not duplicate the item.");
    }
  }

  async function runBulk(action: string) {
    if (!selected.length) return;
    if (
      action === "delete" &&
      !window.confirm(`Move ${selected.length} selected items to the recycle bin?`)
    )
      return;
    try {
      await bulkContent(selected, action);
      toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} updated.`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bulk action failed.");
    }
  }

  async function downloadJson() {
    setTransferring(true);
    try {
      const payload = await exportContent(type);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logicsify-${type.replaceAll("_", "-")}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`${title} exported as JSON.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not export JSON.");
    } finally {
      setTransferring(false);
    }
  }

  async function uploadJson(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Choose a JSON file smaller than 5 MB.");
      return;
    }
    setTransferring(true);
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const record =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;
      if (record?.content_type && record.content_type !== type) {
        throw new Error(
          `This file contains ${String(record.content_type).replaceAll("_", " ")} records, not ${title.toLowerCase()}.`,
        );
      }
      const items = Array.isArray(parsed)
        ? parsed
        : Array.isArray(record?.items)
          ? record.items
          : record
            ? [record]
            : [];
      if (!items.length) throw new Error("The JSON file does not contain any importable items.");
      const report = await importContent(type, { items });
      setImportReport(report);
      toast.success(`${report.imported} of ${report.total} items imported as drafts.`);
      await load();
    } catch (error) {
      toast.error(
        error instanceof SyntaxError
          ? "The selected file is not valid JSON."
          : error instanceof Error
            ? error.message
            : "Could not import JSON.",
      );
    } finally {
      setTransferring(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  const allChecked = items.length > 0 && items.every((item) => selected.includes(item.id));
  const counters = meta.counters || {};

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Content Management"
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap gap-2">
            {supportsJsonTransfer ? (
              <>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadJson(file);
                  }}
                />
                <AdminButton
                  variant="secondary"
                  disabled={transferring}
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" /> Import JSON
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  disabled={transferring}
                  onClick={() => void downloadJson()}
                >
                  <Download className="h-4 w-4" /> Export JSON
                </AdminButton>
              </>
            ) : null}
            <AdminButton onClick={openNew}>
              <FilePlus2 className="h-4 w-4" /> Add {singular}
            </AdminButton>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          ["all", "All", meta.total],
          ["published", "Published", counters.published || 0],
          ["draft", "Draft", counters.draft || 0],
          ["scheduled", "Scheduled", counters.scheduled || 0],
          ["archived", "Archived", counters.archived || 0],
        ].map(([value, label, count]) => (
          <button
            key={String(value)}
            onClick={() => {
              setStatus(String(value));
              setPage(1);
            }}
            className={`rounded-2xl border p-4 text-left transition ${
              status === value
                ? "border-brand-red/30 bg-white shadow-[var(--shadow-glow)]"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <p className="text-2xl font-semibold text-ink">{Number(count)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              {String(label)}
            </p>
          </button>
        ))}
      </div>

      <AdminCard>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchInput.trim());
              setPage(1);
            }}
            className="flex w-full max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}…`}
                className={`${adminInputClass} pl-10`}
              />
            </div>
            <AdminButton type="submit" variant="secondary">
              Search
            </AdminButton>
            {search ? (
              <AdminButton
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
              >
                <X className="h-4 w-4" />
              </AdminButton>
            ) : null}
          </form>

          {selected.length ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-2">
              <span className="px-2 text-xs font-semibold text-slate-500">
                {selected.length} selected
              </span>
              <select
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) void runBulk(event.target.value);
                  event.currentTarget.value = "";
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold outline-none"
              >
                <option value="">Bulk actions</option>
                <option value="published">Publish</option>
                <option value="draft">Move to draft</option>
                <option value="archived">Archive</option>
                <option value="featured">Mark featured</option>
                <option value="unfeatured">Remove featured</option>
                <option value="delete">Move to recycle bin</option>
              </select>
            </div>
          ) : null}
        </div>

        {loading ? (
          <AdminLoading label={`Loading ${title.toLowerCase()}…`} />
        ) : !items.length ? (
          <EmptyState
            title={`${title} are coming soon`}
            description={`No ${title.toLowerCase()} match the current filters.`}
            action={
              <AdminButton onClick={openNew}>
                <Plus className="h-4 w-4" /> Add {singular}
              </AdminButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="w-14 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={(event) =>
                        setSelected(event.target.checked ? items.map((item) => item.id) : [])
                      }
                      className="h-4 w-4 cursor-pointer accent-brand-red"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-4">{singular}</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Featured</th>
                  <th className="px-4 py-4">Updated</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const checked = selected.includes(item.id);
                  const listImage =
                    type === "integration"
                      ? String(item.content_json?.logo || item.featured_image || "")
                      : item.featured_image || "";
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-100 transition hover:bg-slate-50/70 ${checked ? "bg-brand-red/[0.035]" : ""}`}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSelected((current) =>
                              event.target.checked
                                ? Array.from(new Set([...current, item.id]))
                                : current.filter((id) => id !== item.id),
                            )
                          }
                          className="h-4 w-4 cursor-pointer accent-brand-red"
                          aria-label={`Select ${item.title}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {listImage ? (
                              <img
                                src={listImage}
                                alt=""
                                className={`h-full w-full ${type === "integration" ? "object-contain p-2" : "object-cover"}`}
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => openEdit(item)}
                              className="block max-w-[420px] truncate text-left text-sm font-semibold text-ink hover:text-brand-red"
                            >
                              {item.title}
                            </button>
                            <p className="mt-1 max-w-[420px] truncate text-xs text-slate-400">
                              /{item.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4">
                        {item.featured ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                            <Star className="h-4 w-4 fill-current" /> Featured
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {item.updated_at
                          ? new Date(item.updated_at.replace(" ", "T")).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          {contentPublicPath(item.content_type, item.slug) ? (
                            <a
                              href={contentPublicPath(item.content_type, item.slug) || "/"}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          ) : null}
                          <button
                            onClick={() => void duplicate(item.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void remove(item.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-400">
            Showing {items.length} of {meta.total} {title.toLowerCase()}
          </p>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </AdminButton>
            <span className="px-2 text-xs font-semibold text-slate-500">
              Page {meta.page} of {meta.pages}
            </span>
            <AdminButton
              variant="secondary"
              disabled={page >= meta.pages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      <ContentEditor
        open={editorOpen}
        item={editing}
        singular={singular}
        onClose={() => setEditorOpen(false)}
        onSaved={async (saved) => {
          setEditing(saved);
          await load();
        }}
      />
      <AdminModal
        open={Boolean(importReport)}
        onClose={() => setImportReport(null)}
        title="JSON import details"
        description="Every valid JSON item is stored as a draft. Review field completeness before publishing."
        width="max-w-6xl"
      >
        {importReport ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <strong>{importReport.imported}</strong> of <strong>{importReport.total}</strong>{" "}
              items imported as drafts.
            </div>
            <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
              {importReport.items.map((row) => (
                <article
                  key={`${row.index}-${row.slug}`}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-ink">{row.title}</h3>
                      <p className="mt-1 text-xs text-slate-400">/{row.slug} · Draft</p>
                    </div>
                    <StatusBadge status={row.imported ? "draft" : "error"} />
                  </div>
                  {row.error ? (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                      {row.error}
                    </p>
                  ) : null}
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <FieldSummary label="Filled fields" fields={row.filled_fields} tone="filled" />
                    <FieldSummary
                      label="Missing fields"
                      fields={row.missing_fields}
                      tone="missing"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </AdminModal>
    </AdminShell>
  );
}

function FieldSummary({
  label,
  fields,
  tone,
}: {
  label: string;
  fields: string[];
  tone: "filled" | "missing";
}) {
  const filled = tone === "filled";
  return (
    <div
      className={`rounded-xl border p-3 ${filled ? "border-emerald-100 bg-emerald-50/60" : "border-amber-100 bg-amber-50/70"}`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.14em] ${filled ? "text-emerald-700" : "text-amber-700"}`}
      >
        {label} · {fields.length}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        {fields.length
          ? fields
              .map((field) => field.replace(/^content_json\.|^seo_json\./, "").replaceAll("_", " "))
              .join(", ")
          : filled
            ? "No required fields are filled yet."
            : "All required fields are filled."}
      </p>
    </div>
  );
}

function ContentEditor({
  open,
  item,
  singular,
  onClose,
  onSaved,
}: {
  open: boolean;
  item: Partial<ContentItem>;
  singular: string;
  onClose: () => void;
  onSaved: (saved: ContentItem) => Promise<void>;
}) {
  const {
    value: historyValue,
    change: changeHistory,
    reset: resetHistory,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
  } = useUndoHistory<Partial<ContentItem>>(20);
  const form = historyValue || item;
  const formRef = useRef<Partial<ContentItem>>(form);
  const originalRef = useRef("");
  formRef.current = form;
  const setForm = useCallback(
    (next: Partial<ContentItem> | ((current: Partial<ContentItem>) => Partial<ContentItem>)) => {
      const resolved = typeof next === "function" ? next(formRef.current) : next;
      formRef.current = resolved;
      changeHistory(resolved);
    },
    [changeHistory],
  );
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [tab, setTab] = useState<"visual" | "content" | "seo" | "history">(
    isVisualEditableType(item.content_type) ? "visual" : "content",
  );
  const [revisions, setRevisions] = useState<
    Array<{ id: number; snapshot: ContentItem; created_at: string }>
  >([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<
    "featured" | "client_image" | "video" | "video_poster" | "structured"
  >("featured");
  const [structuredMediaKey, setStructuredMediaKey] = useState("");
  const [structuredMediaKind, setStructuredMediaKind] = useState<
    "images" | "videos" | "documents" | "all"
  >("images");
  const [structuredMediaAppend, setStructuredMediaAppend] = useState(false);

  useEffect(() => {
    formRef.current = item;
    originalRef.current = JSON.stringify(item);
    resetHistory(item);
    setTab(isVisualEditableType(item.content_type) ? "visual" : "content");
    setRevisions([]);
  }, [item, open, resetHistory]);

  const contentJson = (form.content_json || {}) as NonNullable<ContentItem["content_json"]>;
  const seoJson = (form.seo_json || {}) as NonNullable<ContentItem["seo_json"]>;
  const sections = (contentJson.sections || []) as ContentSection[];

  function setField<K extends keyof ContentItem>(key: K, value: ContentItem[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateContentJson(key: string, value: unknown) {
    setForm((current) => ({
      ...current,
      content_json: { ...(current.content_json || {}), [key]: value },
    }));
  }

  function updateContentJsonFields(values: Record<string, unknown>) {
    setForm((current) => ({
      ...current,
      content_json: { ...(current.content_json || {}), ...values },
    }));
  }

  function updateSeo(key: string, value: unknown) {
    setForm((current) => ({
      ...current,
      seo_json: { ...(current.seo_json || {}), [key]: value },
    }));
  }

  function chooseMedia(target: "featured" | "client_image" | "video" | "video_poster") {
    setMediaTarget(target);
    setMediaOpen(true);
  }

  function chooseStructuredMedia(
    key: string,
    kind: "images" | "videos" | "documents" | "all" = "images",
    append = false,
  ) {
    setMediaTarget("structured");
    setStructuredMediaKey(key);
    setStructuredMediaKind(kind);
    setStructuredMediaAppend(append);
    setMediaOpen(true);
  }

  async function save() {
    if (!form.title?.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        featured: Boolean(form.featured),
        sort_order: Number(form.sort_order || 0),
      };
      const saved = form.id ? await updateContent(form.id, payload) : await createContent(payload);
      formRef.current = saved;
      originalRef.current = JSON.stringify(saved);
      resetHistory(saved);
      toast.success(`${singular} saved successfully. You can continue editing.`);
      await onSaved(saved);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Could not save ${singular.toLowerCase()}.`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveDraftAndClose() {
    if (saving || savingDraft) return;
    setSavingDraft(true);
    try {
      const current = formRef.current;
      const fallbackTitle = `Untitled ${singular}`;
      const title = current.title?.trim() || fallbackTitle;
      const payload = {
        ...current,
        title,
        slug: current.slug || `${slugify(title)}-${Date.now().toString(36)}`,
        status: "draft" as const,
        featured: Boolean(current.featured),
        sort_order: Number(current.sort_order || 0),
      };
      const saved = current.id
        ? await updateContent(current.id, payload)
        : await createContent(payload);
      formRef.current = saved;
      originalRef.current = JSON.stringify(saved);
      resetHistory(saved);
      await onSaved(saved);
      toast.success(`${singular} saved as a draft.`);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Could not preserve the ${singular.toLowerCase()} draft.`,
      );
    } finally {
      setSavingDraft(false);
    }
  }

  function closeEditor() {
    if (saving || savingDraft) return;

    // Existing records are only edited in local state until a save action is
    // chosen. Closing the modal is therefore a true cancel: restore the exact
    // server-backed snapshot and leave both its content and status untouched.
    if (formRef.current.id) {
      const original = JSON.parse(originalRef.current) as Partial<ContentItem>;
      formRef.current = original;
      resetHistory(original);
      onClose();
      return;
    }

    // A newly-created record has no server copy to return to, so preserve its
    // current fields as a draft when the editor is closed.
    void saveDraftAndClose();
  }

  const loadRevisions = useCallback(async () => {
    if (!form.id) return;
    setLoadingRevisions(true);
    try {
      setRevisions(await getContentRevisions(form.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load revisions.");
    } finally {
      setLoadingRevisions(false);
    }
  }, [form.id]);

  useEffect(() => {
    if (tab === "history" && form.id && !revisions.length) void loadRevisions();
  }, [tab, form.id, revisions.length, loadRevisions]);

  async function restore(revisionId: number) {
    if (
      !form.id ||
      !window.confirm("Restore this revision? The current version will be saved in history.")
    )
      return;
    try {
      const restored = await restoreContentRevision(form.id, revisionId);
      formRef.current = restored;
      originalRef.current = JSON.stringify(restored);
      resetHistory(restored);
      toast.success("Revision restored.");
      await onSaved(restored);
      await loadRevisions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not restore revision.");
    }
  }

  return (
    <>
      <AdminModal
        open={open}
        onClose={closeEditor}
        title={form.id ? `Edit ${singular}` : `Add ${singular}`}
        description={
          form.id
            ? "Close cancels unsaved changes. Use Save or Save as draft to keep edits."
            : "Closing a new item preserves its current fields as a draft."
        }
        width={isVisualEditableType(form.content_type) ? "max-w-[96vw]" : "max-w-6xl"}
      >
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {[
            ...(isVisualEditableType(form.content_type)
              ? [["visual", "Visual Page Editor", Monitor] as const]
              : []),
            ["content", form.content_type === "resource" ? "Guide & Download" : "Content & Page Settings", Edit3] as const,
            ...(form.content_type === "resource"
              ? []
              : [["seo", "SEO & Sharing", Search] as const]),
            ["history", "Revision History", History] as const,
          ].map(([value, label, Icon]) => (
            <button
              key={String(value)}
              onClick={() => setTab(value as typeof tab)}
              disabled={value === "history" && !form.id}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-40 ${tab === value ? "bg-ink text-white" : "bg-slate-100 text-slate-500 hover:text-ink"}`}
            >
              <Icon className="h-4 w-4" /> {String(label)}
            </button>
          ))}
          <span className="mx-1 h-10 w-px bg-slate-200" />
          <button
            type="button"
            onClick={undoHistory}
            disabled={!canUndo}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-500 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" /> Undo
          </button>
          <button
            type="button"
            onClick={redoHistory}
            disabled={!canRedo}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-500 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" /> Redo
          </button>
        </div>

        {tab === "visual" ? (
          form.id ? (
            <NativePageVisualEditor
              page={
                {
                  id: form.id,
                  title: form.title || "Untitled page",
                  slug: form.slug || "",
                  full_path:
                    visualEditorPath(form.content_type || "page", form.slug || "")?.replace(
                      /^\//,
                      "",
                    ) || "",
                  status: form.status,
                  updated_at: form.updated_at,
                  native_content:
                    (form.content_json?.native_content as CmsNativeContent | undefined) || {},
                } satisfies VisualAdminPage
              }
              onChange={(page) => {
                setForm((current) => ({
                  ...current,
                  content_json: {
                    ...(current.content_json || {}),
                    native_content: page.native_content || {},
                  },
                }));
              }}
              setNotice={(notice) => {
                if (!notice) return;
                if (notice.type === "success") toast.success(notice.text);
                else toast.error(notice.text);
              }}
            />
          ) : (
            <AdminCard className="p-10 text-center">
              <Monitor className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-ink">Save the page first</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Create the page once, then reopen it to edit the real Logicsify design visually.
              </p>
            </AdminCard>
          )
        ) : null}

        {tab === "content" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <div>
                <FieldLabel>
                  {form.content_type === "testimonial" ? "Client name" : "Title"}
                </FieldLabel>
                <input
                  value={form.title || ""}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title,
                      slug: current.id || current.slug ? current.slug : slugify(title),
                      content_json:
                        current.content_type === "testimonial"
                          ? { ...(current.content_json || {}), client_name: title }
                          : current.content_json,
                    }));
                  }}
                  className={`${adminInputClass} h-14 text-lg font-semibold`}
                  placeholder={
                    form.content_type === "testimonial"
                      ? "Client or company name"
                      : `${singular} title`
                  }
                />
              </div>
              {form.content_type !== "resource" ? (
                <div>
                  <FieldLabel>Slug</FieldLabel>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 pl-3 text-sm text-slate-400 focus-within:border-brand-red focus-within:ring-4 focus-within:ring-brand-red/10">
                    <span>/</span>
                    <input
                      value={form.slug || ""}
                      onChange={(event) => setField("slug", slugify(event.target.value))}
                      className="h-11 flex-1 bg-transparent px-1.5 text-ink outline-none"
                    />
                  </div>
                </div>
              ) : null}
              {form.content_type === "testimonial" ? (
                <AdminCard className="space-y-5 p-5">
                  <div>
                    <h3 className="text-base font-semibold text-ink">Testimonial details</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Publish a written quote or a hosted/embedded video testimonial.
                    </p>
                  </div>
                  <div>
                    <FieldLabel>Testimonial type</FieldLabel>
                    <select
                      value={String(contentJson.testimonial_type || "text")}
                      onChange={(event) =>
                        updateContentJson("testimonial_type", event.target.value)
                      }
                      className={adminInputClass}
                    >
                      <option value="text">Written testimonial</option>
                      <option value="video">Video testimonial</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Client quote</FieldLabel>
                    <textarea
                      rows={6}
                      value={String(contentJson.quote || form.excerpt || "")}
                      onChange={(event) => {
                        updateContentJson("quote", event.target.value);
                        setField("excerpt", event.target.value);
                      }}
                      className={adminTextareaClass}
                      placeholder="What the client said about the project and outcome."
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Role / position</FieldLabel>
                      <input
                        value={String(contentJson.role || "")}
                        onChange={(event) => updateContentJson("role", event.target.value)}
                        className={adminInputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>Company</FieldLabel>
                      <input
                        value={String(contentJson.company || "")}
                        onChange={(event) => updateContentJson("company", event.target.value)}
                        className={adminInputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>Project type</FieldLabel>
                      <input
                        value={String(contentJson.project_type || "")}
                        onChange={(event) => updateContentJson("project_type", event.target.value)}
                        className={adminInputClass}
                        placeholder="Website, SaaS, AI automation…"
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Client image / company logo</FieldLabel>
                    <div className="flex gap-2">
                      <input
                        value={String(contentJson.client_image || "")}
                        onChange={(event) => updateContentJson("client_image", event.target.value)}
                        className={adminInputClass}
                        placeholder="https://…"
                      />
                      <AdminButton variant="secondary" onClick={() => chooseMedia("client_image")}>
                        <ImageIcon className="h-4 w-4" /> Browse
                      </AdminButton>
                    </div>
                  </div>
                  {String(contentJson.testimonial_type || "text") === "video" ? (
                    <>
                      <div>
                        <FieldLabel>Video URL</FieldLabel>
                        <div className="flex gap-2">
                          <input
                            value={String(contentJson.video_url || "")}
                            onChange={(event) => updateContentJson("video_url", event.target.value)}
                            className={adminInputClass}
                            placeholder="YouTube, Vimeo, or uploaded MP4/WebM URL"
                          />
                          <AdminButton variant="secondary" onClick={() => chooseMedia("video")}>
                            <Video className="h-4 w-4" /> Browse
                          </AdminButton>
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Video poster / thumbnail</FieldLabel>
                        <div className="flex gap-2">
                          <input
                            value={String(contentJson.video_poster || "")}
                            onChange={(event) =>
                              updateContentJson("video_poster", event.target.value)
                            }
                            className={adminInputClass}
                            placeholder="https://…"
                          />
                          <AdminButton
                            variant="secondary"
                            onClick={() => chooseMedia("video_poster")}
                          >
                            <ImageIcon className="h-4 w-4" /> Browse
                          </AdminButton>
                        </div>
                      </div>
                    </>
                  ) : null}
                </AdminCard>
              ) : form.content_type === "resource" ? (
                <>
                  <AdminCard className="space-y-5 p-5">
                    <div>
                      <h3 className="text-base font-semibold text-ink">Guide listing & download</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Guides no longer have detail pages. Visitors click the listing card, submit the short lead form, and the attached file downloads immediately.
                      </p>
                    </div>
                    <div>
                      <FieldLabel>Short description</FieldLabel>
                      <textarea
                        rows={4}
                        value={form.excerpt || ""}
                        onChange={(event) => setField("excerpt", event.target.value)}
                        className={adminTextareaClass}
                        placeholder="A concise description shown on the Guides listing card."
                      />
                    </div>
                    <div>
                      <FieldLabel>Category</FieldLabel>
                      <input
                        value={String(contentJson.category || "")}
                        onChange={(event) => updateContentJson("category", event.target.value)}
                        className={adminInputClass}
                        placeholder="AI Automation, CRM, Website Planning…"
                      />
                    </div>
                    <div>
                      <FieldLabel>Guide download file</FieldLabel>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          value={String(contentJson.download_file || "")}
                          onChange={(event) => updateContentJson("download_file", event.target.value)}
                          className={adminInputClass}
                          placeholder="Upload or select the PDF/DOCX/XLSX file"
                        />
                        <AdminButton
                          variant="secondary"
                          onClick={() => chooseStructuredMedia("download_file", "documents")}
                        >
                          <Download className="h-4 w-4" /> Browse files
                        </AdminButton>
                      </div>
                    </div>
                  </AdminCard>
                </>
              ) : (
                <>
                  <div>
                    <FieldLabel>Excerpt / Summary</FieldLabel>
                    <textarea
                      rows={3}
                      value={form.excerpt || ""}
                      onChange={(event) => setField("excerpt", event.target.value)}
                      className={adminTextareaClass}
                      placeholder="A concise summary used on cards and search listings."
                    />
                  </div>
                  <div>
                    <FieldLabel>Main Body</FieldLabel>
                    <RichTextEditor
                      value={String(contentJson.body || "")}
                      onChange={(value) => updateContentJson("body", value)}
                    />
                  </div>
                  <StructuredContentFields
                    type={form.content_type}
                    content={contentJson}
                    update={updateContentJson}
                    updateMany={updateContentJsonFields}
                    chooseMedia={chooseStructuredMedia}
                  />
                  <SectionBuilder
                    sections={sections}
                    onChange={(next) => updateContentJson("sections", next)}
                    onPickMedia={() => chooseMedia("featured")}
                  />
                </>
              )}
            </div>

            <div className="space-y-5">
              <AdminCard className="p-5">
                <h3 className="mb-4 text-sm font-semibold text-ink">Publishing</h3>
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <select
                      value={form.status || "draft"}
                      onChange={(event) =>
                        setField("status", event.target.value as ContentItem["status"])
                      }
                      className={adminInputClass}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  {form.status === "scheduled" ? (
                    <div>
                      <FieldLabel>Publish date and time</FieldLabel>
                      <input
                        type="datetime-local"
                        value={
                          form.published_at ? form.published_at.replace(" ", "T").slice(0, 16) : ""
                        }
                        onChange={(event) =>
                          setField("published_at", event.target.value.replace("T", " "))
                        }
                        className={adminInputClass}
                      />
                    </div>
                  ) : null}
                  <div>
                    <FieldLabel>Sort order</FieldLabel>
                    <input
                      type="number"
                      value={Number(form.sort_order || 0)}
                      onChange={(event) => setField("sort_order", Number(event.target.value))}
                      className={adminInputClass}
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <input
                      type="checkbox"
                      checked={Boolean(form.featured)}
                      onChange={(event) => setField("featured", event.target.checked)}
                      className="h-4 w-4 accent-brand-red"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">Featured</span>
                      <span className="block text-xs text-slate-400">
                        Prioritize this item in website listings.
                      </span>
                    </span>
                  </label>
                </div>
              </AdminCard>

              <AdminCard className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">
                    {form.content_type === "testimonial" ? "Fallback image" : "Featured image"}
                  </h3>
                  <button
                    onClick={() => chooseMedia("featured")}
                    className="text-xs font-semibold text-brand-red"
                  >
                    Media library
                  </button>
                </div>
                <div className="mb-3 aspect-[16/9] overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  {form.featured_image ? (
                    <img
                      src={form.featured_image}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-slate-300">
                      <ImageIcon className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <input
                  value={form.featured_image || ""}
                  onChange={(event) => setField("featured_image", event.target.value)}
                  className={adminInputClass}
                  placeholder="https://…"
                />
                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                  Recommended website ratio: 1672 × 941. The frontend uses contain/crop rules
                  appropriate to each placement.
                </p>
              </AdminCard>

              {form.content_type !== "resource" ? (
                <AdminCard className="p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Classification</h3>
                  <div className="space-y-4">
                    <div>
                      <FieldLabel>Category</FieldLabel>
                      <input
                        value={String(contentJson.category || "")}
                        onChange={(event) => updateContentJson("category", event.target.value)}
                        className={adminInputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>Tags</FieldLabel>
                      <input
                        value={Array.isArray(contentJson.tags) ? contentJson.tags.join(", ") : ""}
                        onChange={(event) =>
                          updateContentJson(
                            "tags",
                            event.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean),
                          )
                        }
                        className={adminInputClass}
                        placeholder="AI, Automation, SaaS"
                      />
                    </div>
                  </div>
                </AdminCard>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "seo" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard className="space-y-5 p-5">
              <h3 className="text-base font-semibold text-ink">Search metadata</h3>
              <div>
                <FieldLabel>SEO title</FieldLabel>
                <input
                  value={seoJson.title || ""}
                  onChange={(event) => updateSeo("title", event.target.value)}
                  className={adminInputClass}
                  placeholder={form.title || "Page title"}
                />
              </div>
              <div>
                <FieldLabel>Meta description</FieldLabel>
                <textarea
                  rows={5}
                  value={seoJson.description || ""}
                  onChange={(event) => updateSeo("description", event.target.value)}
                  className={adminTextareaClass}
                  placeholder={form.excerpt || "Describe this page for search engines."}
                />
              </div>
              <div>
                <FieldLabel>Canonical URL</FieldLabel>
                <input
                  value={seoJson.canonical || ""}
                  onChange={(event) => updateSeo("canonical", event.target.value)}
                  className={adminInputClass}
                  placeholder="https://logicsify.com/…"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={Boolean(seoJson.noindex)}
                  onChange={(event) => updateSeo("noindex", event.target.checked)}
                  className="h-4 w-4 accent-brand-red"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    Hide from search engines
                  </span>
                  <span className="block text-xs text-slate-400">
                    Adds a noindex directive to this item.
                  </span>
                </span>
              </label>
            </AdminCard>
            <AdminCard className="space-y-5 p-5">
              <h3 className="text-base font-semibold text-ink">Social sharing</h3>
              <div>
                <FieldLabel>Open Graph image</FieldLabel>
                <input
                  value={seoJson.og_image || ""}
                  onChange={(event) => updateSeo("og_image", event.target.value)}
                  className={adminInputClass}
                  placeholder={form.featured_image || "https://…"}
                />
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {seoJson.og_image || form.featured_image ? (
                  <img
                    src={seoJson.og_image || form.featured_image || ""}
                    alt=""
                    className="aspect-[1.91/1] w-full object-cover"
                  />
                ) : (
                  <div className="grid aspect-[1.91/1] place-items-center text-slate-300">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                    logicsify.com
                  </p>
                  <p className="mt-1 font-semibold text-ink">
                    {seoJson.title || form.title || "Page title"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {seoJson.description || form.excerpt || "Page description will appear here."}
                  </p>
                </div>
              </div>
            </AdminCard>
          </div>
        ) : null}

        {tab === "history" ? (
          <AdminCard>
            {loadingRevisions ? (
              <AdminLoading label="Loading revisions…" />
            ) : !revisions.length ? (
              <EmptyState
                title="No revisions yet"
                description="A revision is stored whenever an existing item is updated."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {revisions.map((revision) => (
                  <div key={revision.id} className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-semibold text-ink">
                        {revision.snapshot.title || singular}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Saved {new Date(revision.created_at.replace(" ", "T")).toLocaleString()}
                      </p>
                    </div>
                    <AdminButton variant="secondary" onClick={() => void restore(revision.id)}>
                      <RotateCcw className="h-4 w-4" /> Restore
                    </AdminButton>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        ) : null}

        <div className="sticky bottom-0 mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-200 bg-white/95 pt-5 backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {form.id ? (
              <>
                <Clock3 className="h-4 w-4" /> Existing content item #{form.id}
              </>
            ) : (
              <>
                <CheckSquare2 className="h-4 w-4" /> New content item
              </>
            )}
          </div>
          <div className="flex gap-2">
            <AdminButton
              variant="secondary"
              disabled={saving || savingDraft}
              onClick={() => void saveDraftAndClose()}
            >
              {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {savingDraft
                ? "Saving draft…"
                : form.id
                  ? "Save as draft & close"
                  : "Save draft & close"}
            </AdminButton>
            <AdminButton onClick={() => void save()} disabled={saving || savingDraft}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save {singular}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        kind={
          mediaTarget === "structured"
            ? structuredMediaKind
            : mediaTarget === "video"
              ? "videos"
              : "images"
        }
        title={
          mediaTarget === "structured"
            ? "Choose media or document"
            : mediaTarget === "video"
              ? "Choose testimonial video"
              : "Choose image"
        }
        selectedUrl={
          mediaTarget === "featured"
            ? form.featured_image || ""
            : mediaTarget === "structured"
              ? String(
                  Array.isArray(contentJson[structuredMediaKey])
                    ? ""
                    : contentJson[structuredMediaKey] || "",
                )
              : String(contentJson[mediaTarget === "video" ? "video_url" : mediaTarget] || "")
        }
        multiple={mediaTarget === "structured" && structuredMediaAppend}
        selectedUrls={
          mediaTarget === "structured" && structuredMediaAppend
            ? textList(contentJson[structuredMediaKey])
            : []
        }
        onSelectMany={(urls) => {
          if (mediaTarget === "structured") updateContentJson(structuredMediaKey, urls);
          setMediaOpen(false);
        }}
        onSelect={(url) => {
          if (mediaTarget === "featured") setField("featured_image", url);
          else if (mediaTarget === "video") updateContentJson("video_url", url);
          else if (mediaTarget === "video_poster") updateContentJson("video_poster", url);
          else if (mediaTarget === "client_image") updateContentJson("client_image", url);
          else if (structuredMediaAppend) {
            const current = Array.isArray(contentJson[structuredMediaKey])
              ? (contentJson[structuredMediaKey] as unknown[]).map(String)
              : [];
            updateContentJson(structuredMediaKey, Array.from(new Set([...current, url])));
          } else updateContentJson(structuredMediaKey, url);
          setMediaOpen(false);
        }}
      />
    </>
  );
}

function textList(value: unknown) {
  return Array.isArray(value)
    ? value.map(String).map((item) => item.trim()).filter(Boolean)
    : String(value || "")
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

// Keep blank trailing rows while the user is actively typing. The previous
// list textarea normalized/filterered the value on every keystroke, which
// immediately removed a newly-entered line break and made it impossible to
// enter a second item. We only fully normalize the list when the field blurs.
function editableTextList(value: unknown) {
  return Array.isArray(value)
    ? value.map(String)
    : String(value || "").split(/\r?\n|,/);
}

function StructuredContentFields({
  type,
  content,
  update,
  updateMany,
  chooseMedia,
}: {
  type?: ContentItem["content_type"];
  content: NonNullable<ContentItem["content_json"]>;
  update: (key: string, value: unknown) => void;
  updateMany: (values: Record<string, unknown>) => void;
  chooseMedia: (
    key: string,
    kind?: "images" | "videos" | "documents" | "all",
    append?: boolean,
  ) => void;
}) {
  const listField = (label: string, key: string, placeholder: string, rows = 4) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        rows={rows}
        value={editableTextList(content[key]).join("\n")}
        onChange={(event) => update(key, editableTextList(event.target.value))}
        onBlur={(event) => update(key, textList(event.currentTarget.value))}
        className={adminTextareaClass}
        placeholder={placeholder}
      />
      <p className="mt-1 text-[11px] text-slate-400">
        Add multiple items using one item per line or commas.
      </p>
    </div>
  );

  const textField = (label: string, key: string, placeholder = "", textarea = false) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {textarea ? (
        <textarea
          rows={4}
          value={String(content[key] || "")}
          onChange={(event) => update(key, event.target.value)}
          className={adminTextareaClass}
          placeholder={placeholder}
        />
      ) : (
        <input
          value={String(content[key] || "")}
          onChange={(event) => update(key, event.target.value)}
          className={adminInputClass}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  const mediaField = (
    label: string,
    key: string,
    kind: "images" | "videos" | "documents" | "all" = "images",
  ) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        <input
          value={String(content[key] || "")}
          onChange={(event) => update(key, event.target.value)}
          className={adminInputClass}
          placeholder="https://…"
        />
        <AdminButton type="button" variant="secondary" onClick={() => chooseMedia(key, kind)}>
          <ImageIcon className="h-4 w-4" /> Browse
        </AdminButton>
      </div>
    </div>
  );

  const mediaList = (
    label: string,
    key: string,
    kind: "images" | "videos" | "documents" | "all" = "images",
  ) => {
    const values = textList(content[key]);
    return (
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <FieldLabel>{label}</FieldLabel>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => chooseMedia(key, kind, true)}
          >
            <Plus className="h-4 w-4" /> Add media
          </AdminButton>
        </div>
        {!values.length ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-400">
            No files selected.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {values.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2"
              >
                {kind === "images" ? (
                  <img src={url} alt="" className="h-12 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-12 w-16 place-items-center rounded-lg bg-white text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{url}</span>
                <button
                  type="button"
                  onClick={() =>
                    update(
                      key,
                      values.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${label} item ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const structuredListField = (
    label: string,
    key: string,
    leftLabel: string,
    rightLabel: string,
    rows = 5,
  ) => {
    const values = Array.isArray(content[key])
      ? content[key]
          .map((entry) => {
            if (!entry || typeof entry !== "object") return "";
            const item = entry as Record<string, unknown>;
            const left = String(item.title || item.q || item.question || "");
            const right = String(item.body || item.a || item.answer || "");
            return left || right ? `${left} | ${right}` : "";
          })
          .filter(Boolean)
      : [];
    return (
      <div>
        <FieldLabel>{label}</FieldLabel>
        <textarea
          rows={rows}
          value={values.join("\n")}
          onChange={(event) => {
            const parsed = event.target.value
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [left, ...rest] = line.split("|");
                return key === "faqs"
                  ? { q: left.trim(), a: rest.join("|").trim() }
                  : { title: left.trim(), body: rest.join("|").trim() };
              });
            update(key, parsed);
          }}
          className={adminTextareaClass}
          placeholder={`${leftLabel} | ${rightLabel}`}
        />
        <p className="mt-1 text-[11px] text-slate-400">One row per line, separated with |.</p>
      </div>
    );
  };

  if (type === "service") {
    return (
      <AdminCard className="space-y-5 p-5">
        <div>
          <h3 className="text-base font-semibold text-ink">Service page details</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Core and Other service placement is controlled by the approved service slug. All page
            copy remains editable here.
          </p>
        </div>
        {textField(
          "Main positioning / value proposition",
          "body",
          "Explain the connected business outcome.",
          true,
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {listField("Business problems solved", "problems", "Problem one\nProblem two")}
          {listField(
            "Use cases",
            "use_cases",
            "Appointment booking\nLead routing\nCustomer portal",
          )}
          {listField(
            "Workflow steps",
            "workflow",
            "Lead captured\nQualified\nCRM updated\nFollow-up",
          )}
          {listField("Platforms and technologies", "technologies", "HubSpot\nGoHighLevel\nTwilio")}
          {listField(
            "Related service slugs",
            "related",
            "ai-automation-voice-agents\ncrm-revenue-operations",
          )}
        </div>
        {structuredListField(
          "Capabilities",
          "capabilities",
          "Capability title",
          "Capability description",
          7,
        )}
        {structuredListField("FAQs", "faqs", "Question", "Answer", 6)}
      </AdminCard>
    );
  }

  if (type === "case_study") {
    return (
      <AdminCard className="space-y-5 p-5">
        <div>
          <h3 className="text-base font-semibold text-ink">Case study details</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Only publish claims and results supported by the client.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {textField("Client name", "client_name")}
          {textField("Industry", "industry")}
          {mediaField("Client logo", "client_logo")}
          {textField("Timeline", "timeline", "For example: 10 weeks")}
          {textField("Live URL", "live_url", "https://…")}
        </div>
        {textField("Challenge", "challenge", "Describe the verified business problem.", true)}
        {listField("Objectives", "objectives", "Objective one\nObjective two")}
        {textField("Solution", "solution", "Explain the implemented solution.", true)}
        {listField("Work completed", "work_completed", "Discovery\nProduct design\nDevelopment")}
        <div className="grid gap-4 md:grid-cols-2">
          {listField("Technology stack", "technology_stack", "React\nPHP\nMySQL")}
          {listField("Systems integrated", "integrations", "HubSpot\nStripe")}
          {listField("Related services", "services", "web-design-development\nai-automations")}
          {listField("Process", "process", "Discovery\nDesign\nDevelopment\nQA\nLaunch")}
        </div>
        {mediaList("Desktop screenshots", "desktop_screenshots")}
        {mediaList("Mobile screenshots", "mobile_screenshots")}
        {mediaList("Gallery", "gallery")}
        {listField(
          "Measurable or qualitative results",
          "measurable_results",
          "Reduced manual processing\nImproved mobile usability",
        )}
        {textField(
          "Client testimonial",
          "testimonial",
          "Leave empty unless supplied by the client.",
          true,
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {textField("Testimonial name", "testimonial_name")}
          {textField("Testimonial role", "testimonial_role")}
        </div>
      </AdminCard>
    );
  }

  if (type === "portfolio") {
    return (
      <AdminCard className="space-y-5 p-5">
        <div>
          <h3 className="text-base font-semibold text-ink">Portfolio project details</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Portfolio is intentionally separate from Case Studies. Use it for concise, visual project showcases rather than long-form client stories.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {textField("Client / brand", "client_name")}
          {textField("Project type", "project_type", "Website, CRM, AI automation, portal…")}
          {textField("Category", "category", "AI Automation, Web Platform, CRM…")}
          {textField("Year", "year", "2026")}
          {textField("Live URL", "live_url", "https://…")}
          {textField("Project role", "role", "Strategy, design, development, automation…")}
        </div>
        {textField("Portfolio summary", "summary", "A concise explanation of what was built and why.", true)}
        <div className="grid gap-4 md:grid-cols-2">
          {listField("Services used", "services", "ai-automation-voice-agents\ncustom-websites-portals-cms")}
          {listField("Technology stack", "technology_stack", "React\nPHP\nMySQL")}
          {listField("Project highlights", "highlights", "Connected lead routing\nCustom operations dashboard")}
          {listField("Deliverables", "deliverables", "UX design\nDevelopment\nIntegrations")}
        </div>
        {mediaList("Portfolio gallery", "gallery")}
      </AdminCard>
    );
  }

  if (type === "insight") {
    return (
      <AdminCard className="space-y-5 p-5">
        <div>
          <h3 className="text-base font-semibold text-ink">Insight and news details</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Use a source link for third-party technology updates and write an original summary.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {textField("Author", "author")}
          {textField("Author role", "author_role")}
          {textField("Reading time", "reading_time", "6 min read")}
          <div>
            <FieldLabel>Article type</FieldLabel>
            <select
              value={String(content.article_type || "article")}
              onChange={(e) => update("article_type", e.target.value)}
              className={adminInputClass}
            >
              <option value="article">Educational article</option>
              <option value="technology_update">Technology update</option>
              <option value="company_news">Company news</option>
              <option value="guide">Guide</option>
              <option value="project_announcement">Project announcement</option>
            </select>
          </div>
          {textField("Updated date", "updated_date", "YYYY-MM-DD")}
          {textField("Related service slug", "related_service")}
          {textField("Related case study slug", "related_case_study")}
          {textField("Related resource slugs", "related_resources", "slug-one, slug-two")}
          <SourceLinksField content={content} updateMany={updateMany} />
        </div>
      </AdminCard>
    );
  }


  if (type === "team") {
    return (
      <AdminCard className="space-y-5 p-5">
        <div>
          <h3 className="text-base font-semibold text-ink">Team profile</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Incomplete or draft profiles are not shown publicly.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {textField("Role", "role")}
          {textField("LinkedIn URL", "linkedin_url", "https://linkedin.com/in/…")}
        </div>
        {listField("Skills", "skills", "Product strategy\nReact\nAutomation")}
      </AdminCard>
    );
  }

  if (type === "comparison") {
    return (
      <AdminCard className="space-y-5 p-5">
        <h3 className="text-base font-semibold text-ink">Comparison details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {textField("Option A", "option_a")}
          {textField("Option B", "option_b")}
          {textField(
            "Best use case for option A",
            "best_a",
            "Describe when option A is the better fit.",
            true,
          )}
          {textField(
            "Best use case for option B",
            "best_b",
            "Describe when option B is the better fit.",
            true,
          )}
        </div>
        {listField(
          "Comparison table rows",
          "comparison_rows",
          "Setup speed | Option A explanation | Option B explanation\nFlexibility | Option A explanation | Option B explanation",
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {textField(
            "Cost considerations",
            "cost_considerations",
            "Balanced cost considerations for both options.",
            true,
          )}
          {textField("Setup time", "setup_time", "Balanced setup-time considerations.", true)}
          {textField("Flexibility", "flexibility", "Balanced flexibility considerations.", true)}
          {textField("Maintenance", "maintenance", "Balanced maintenance considerations.", true)}
          {textField("Integrations", "integrations", "Balanced integration considerations.", true)}
          {textField("Ownership", "ownership", "Balanced ownership considerations.", true)}
          {textField("Scalability", "scalability", "Balanced scalability considerations.", true)}
        </div>
        {textField(
          "Decision framework",
          "decision_framework",
          "Explain when each option is the better fit.",
          true,
        )}
        {listField(
          "Risks and assumptions",
          "risks",
          "Risk or assumption one\nRisk or assumption two",
        )}
        {listField("FAQs", "faqs", "Question | Answer\nQuestion | Answer")}
        {listField(
          "Related service slugs",
          "related_services",
          "web-design-development\ncrm-automation",
        )}
      </AdminCard>
    );
  }

  if (type === "engagement_model") {
    return (
      <AdminCard className="space-y-5 p-5">
        <h3 className="text-base font-semibold text-ink">Engagement model details</h3>
        {textField("Best for", "best_for", "Describe the right project fit.", true)}
        <div className="grid gap-4 md:grid-cols-2">
          {textField("Typical project type", "typical_project")}
          {textField("Delivery cadence", "delivery_cadence")}
          {textField("Communication format", "communication_format")}
          {textField("Optional starting price", "starting_price", "Leave empty when not approved")}
        </div>
        {textField(
          "How work is scoped",
          "scope",
          "Explain scope, capacity, milestones, and change control.",
          true,
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {textField(
            "Client responsibilities",
            "client_responsibilities",
            "Access, feedback, approvals, product ownership…",
            true,
          )}
          {textField(
            "Logicsify responsibilities",
            "logicsify_responsibilities",
            "Delivery planning, design, engineering, QA…",
            true,
          )}
        </div>
        {listField("Advantages", "advantages", "Advantage one\nAdvantage two")}
        {listField("Tradeoffs", "tradeoffs", "Tradeoff one\nTradeoff two")}
      </AdminCard>
    );
  }

  if (type === "integration") {
    return (
      <AdminCard className="space-y-5 p-5">
        <h3 className="text-base font-semibold text-ink">Integration details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {textField("Category", "category", "CRM, AI, Marketing…")}
          {mediaField("Platform logo", "logo")}
          {textField("Official platform URL", "platform_url", "https://…")}
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <input
            type="checkbox"
            checked={Boolean(content.formal_partnership)}
            onChange={(e) => update("formal_partnership", e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-red"
          />
          <span>
            <strong>Formal partnership verified.</strong> Keep unchecked unless Logicsify has
            documented authorization to make that claim.
          </span>
        </label>
      </AdminCard>
    );
  }

  return null;
}

function normalizeSources(value: unknown, legacyName: unknown, legacyUrl: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => ({
        name: String(item.name || item.label || ""),
        url: String(item.url || ""),
      }))
      .filter((item) => item.name || item.url);
  }
  return legacyUrl ? [{ name: String(legacyName || "Source"), url: String(legacyUrl) }] : [];
}

function sourceLinksText(sources: Array<{ name: string; url: string }>) {
  return sources
    .map((source) => {
      if (source.name && source.url) return `${source.name} | ${source.url}`;
      if (source.url) return `| ${source.url}`;
      return source.name;
    })
    .join("\n");
}

function parseSourceLinksText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      const separator = line.indexOf("|");
      if (separator === -1) return { name: line.trim(), url: "" };
      return {
        name: line.slice(0, separator).trim(),
        url: line.slice(separator + 1).trim(),
      };
    })
    .filter((source) => source.name || source.url);
}

function SourceLinksField({
  content,
  updateMany,
}: {
  content: NonNullable<ContentItem["content_json"]>;
  updateMany: (values: Record<string, unknown>) => void;
}) {
  const storedText = sourceLinksText(
    normalizeSources(content.sources, content.source_name, content.source_url),
  );
  const [draftText, setDraftText] = useState(storedText);
  const committedTextRef = useRef(storedText);

  useEffect(() => {
    if (storedText === committedTextRef.current) return;
    committedTextRef.current = storedText;
    setDraftText(storedText);
  }, [storedText]);

  return (
    <div className="md:col-span-2">
      <FieldLabel>Source links</FieldLabel>
      <textarea
        rows={5}
        value={draftText}
        onChange={(event) => {
          const nextText = event.target.value;
          const sources = parseSourceLinksText(nextText);
          setDraftText(nextText);
          committedTextRef.current = sourceLinksText(sources);
          updateMany({
            sources,
            source_name: sources[0]?.name || "",
            source_url: sources[0]?.url || "",
          });
        }}
        className={adminTextareaClass}
        placeholder={"OpenAI release notes | https://…\nResearch paper | https://…"}
      />
      <p className="mt-1 text-[11px] text-slate-400">
        One source per line: source name | URL. Add as many verified sources as needed.
      </p>
    </div>
  );
}

function SectionBuilder({
  sections,
  onChange,
  onPickMedia,
}: {
  sections: ContentSection[];
  onChange: (sections: ContentSection[]) => void;
  onPickMedia: () => void;
}) {
  function update(index: number, key: keyof ContentSection, value: string) {
    onChange(
      sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [key]: value } : section,
      ),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <AdminCard className="p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Page sections</h3>
          <p className="mt-1 text-xs text-slate-400">
            Create reusable visual sections below the main body.
          </p>
        </div>
        <AdminButton
          variant="secondary"
          onClick={() =>
            onChange([
              ...sections,
              {
                id: crypto.randomUUID?.() || String(Date.now()),
                type: "content",
                heading: "",
                body: "",
                alignment: "left",
              },
            ])
          }
        >
          <Plus className="h-4 w-4" /> Add section
        </AdminButton>
      </div>
      {!sections.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          No custom sections yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id || index}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <select
                    value={section.type || "content"}
                    onChange={(event) => update(index, "type", event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold outline-none"
                  >
                    <option value="content">Content</option>
                    <option value="image_text">Image + Text</option>
                    <option value="cta">CTA</option>
                    <option value="stats">Stats</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => move(index, -1)}
                    className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() =>
                      onChange(sections.filter((_, sectionIndex) => sectionIndex !== index))
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={section.eyebrow || ""}
                  onChange={(event) => update(index, "eyebrow", event.target.value)}
                  className={adminInputClass}
                  placeholder="Eyebrow"
                />
                <input
                  value={section.heading || ""}
                  onChange={(event) => update(index, "heading", event.target.value)}
                  className={adminInputClass}
                  placeholder="Heading"
                />
              </div>
              <div className="mt-3">
                <RichTextEditor
                  compact
                  value={section.body || ""}
                  onChange={(value) => update(index, "body", value)}
                />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={section.image || ""}
                  onChange={(event) => update(index, "image", event.target.value)}
                  className={adminInputClass}
                  placeholder="Image URL"
                />
                <AdminButton variant="secondary" onClick={onPickMedia}>
                  <ImageIcon className="h-4 w-4" /> Browse
                </AdminButton>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <input
                  value={section.button_label || ""}
                  onChange={(event) => update(index, "button_label", event.target.value)}
                  className={adminInputClass}
                  placeholder="Button label"
                />
                <input
                  value={section.button_url || ""}
                  onChange={(event) => update(index, "button_url", event.target.value)}
                  className={adminInputClass}
                  placeholder="Button URL"
                />
                <select
                  value={section.alignment || "left"}
                  onChange={(event) => update(index, "alignment", event.target.value)}
                  className={adminInputClass}
                >
                  <option value="left">Left aligned</option>
                  <option value="center">Centered</option>
                  <option value="right">Right aligned</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  );
}
