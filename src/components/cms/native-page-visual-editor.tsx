import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers3,
  Library,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Smartphone,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAdminPage, fetchAdminPages, saveAdminPage, uploadMedia } from "@/lib/visual-page-api";
import type { VisualAdminPage as AdminPage } from "@/lib/cms-visual";
import { CMS_ICON_OPTIONS, CmsIconPreview } from "@/lib/cms-icons";
import { MediaPicker } from "@/components/cms/media-picker";
import type {
  CmsDomInventory,
  CmsDomSection,
  CmsElementContext,
  CmsRepeatContext,
} from "@/components/cms/cms-dom-runtime";
import type {
  CmsElementLink,
  CmsNativeContent,
  CmsNativeField,
  CmsSectionClone,
} from "@/lib/cms-visual";

type Notice = { type: "success" | "error"; text: string } | null;

type Props = {
  page: Partial<AdminPage>;
  onChange: (page: Partial<AdminPage>) => void;
  setNotice: (notice: Notice) => void;
};

type InventoryMessage = {
  type: "bb-cms:inventory";
  page_id?: number;
  inventory: CmsDomInventory;
  native_content?: CmsNativeContent;
};

type SelectMessage = {
  type: "bb-cms:select";
  page_id?: number;
  fields: CmsNativeField[];
  repeat_context?: CmsRepeatContext | null;
  element_context?: CmsElementContext | null;
};

type StructureChangedMessage = {
  type: "bb-cms:structure-changed";
  page_id?: number;
  inventory: CmsDomInventory;
  native_content: CmsNativeContent;
};

type SectionExportMessage = {
  type: "bb-cms:section-export";
  request_id: string;
  section_key: string;
  label: string;
  html: string;
};

type NoticeMessage = {
  type: "bb-cms:notice";
  notice: Exclude<Notice, null>;
};

type EditorMessage =
  | InventoryMessage
  | SelectMessage
  | StructureChangedMessage
  | SectionExportMessage
  | NoticeMessage;

type SectionExport = Pick<SectionExportMessage, "section_key" | "label" | "html">;

function sameRecord(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
}

function buildMeta(fields: CmsNativeField[]) {
  return Object.fromEntries(
    fields.map((field) => {
      const { value: _value, ...meta } = field;
      return [field.key, meta];
    }),
  );
}

function cryptoId(prefix = "cms"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeNativeContent(page: Partial<AdminPage>): CmsNativeContent {
  if (page.native_content && typeof page.native_content === "object") return page.native_content;
  if (page.native_content_json) {
    try {
      return JSON.parse(page.native_content_json) as CmsNativeContent;
    } catch {
      return { fields: {} };
    }
  }
  return { fields: {} };
}

export function NativePageVisualEditor({ page, onChange, setNotice }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewHostRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(page);
  const exportResolvers = useRef(
    new Map<
      string,
      { resolve: (value: SectionExport) => void; reject: (reason?: unknown) => void }
    >(),
  );
  const [inventory, setInventory] = useState<CmsDomInventory>({ fields: [], sections: [] });
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [repeatContext, setRepeatContext] = useState<CmsRepeatContext | null>(null);
  const [elementContext, setElementContext] = useState<CmsElementContext | null>(null);
  const [linkScope, setLinkScope] = useState<"element" | "item">("element");
  const [search, setSearch] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState("");
  const [fitScale, setFitScale] = useState(1);
  const [zoomMode, setZoomMode] = useState<"fit" | 0.5 | 0.75 | 1>(0.5);
  const [focusMode, setFocusMode] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [duplicateSection, setDuplicateSection] = useState<CmsDomSection | null>(null);
  const [duplicateStep, setDuplicateStep] = useState<"choice" | "another">("choice");
  const [targetPages, setTargetPages] = useState<AdminPage[]>([]);
  const [linkPages, setLinkPages] = useState<AdminPage[]>([]);
  const [targetPageId, setTargetPageId] = useState("");
  const [duplicating, setDuplicating] = useState(false);
  const [deleteSection, setDeleteSection] = useState<CmsDomSection | null>(null);
  const [mediaField, setMediaField] = useState<CmsNativeField | null>(null);

  pageRef.current = page;
  const nativeContent = useMemo(() => normalizeNativeContent(page), [page]);
  const values = useMemo(() => nativeContent.fields || {}, [nativeContent.fields]);
  const meta = useMemo(() => nativeContent.field_meta || {}, [nativeContent.field_meta]);

  useEffect(() => {
    if (loading) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "bb-cms:update", native_content: nativeContent },
      window.location.origin,
    );
  }, [loading, nativeContent]);

  function emit(next: CmsNativeContent) {
    // Update the synchronous ref before notifying React. This prevents a fast
    // Save click (or a second link-field change) from reading the page snapshot
    // from the previous render and dropping the most recent link change.
    const nextPage = { ...pageRef.current, native_content: next };
    pageRef.current = nextPage;
    onChange(nextPage);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "bb-cms:update", native_content: next },
      window.location.origin,
    );
  }

  useEffect(() => {
    let active = true;
    void fetchAdminPages()
      .then((pages) => {
        if (active) setLinkPages(pages.filter((candidate) => candidate.status === "published"));
      })
      .catch(() => {
        if (active) setLinkPages([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent<EditorMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      )
        return;

      if (event.data?.type === "bb-cms:section-export") {
        const resolver = exportResolvers.current.get(event.data.request_id);
        if (resolver) {
          exportResolvers.current.delete(event.data.request_id);
          resolver.resolve({
            section_key: event.data.section_key,
            label: event.data.label,
            html: event.data.html,
          });
        }
        return;
      }

      if (event.data?.type === "bb-cms:notice") {
        setNotice(event.data.notice);
        return;
      }

      if (event.data?.type === "bb-cms:structure-changed") {
        setInventory(event.data.inventory);
        setSelectedKeys([]);
        setRepeatContext(null);
        setElementContext(null);
        const nextPage = { ...pageRef.current, native_content: event.data.native_content };
        pageRef.current = nextPage;
        onChange(nextPage);
        return;
      }

      if (event.data?.type === "bb-cms:inventory") {
        setLoading(false);
        setInventory(event.data.inventory);
        const currentPage = pageRef.current;
        const base = event.data.native_content || normalizeNativeContent(currentPage);
        const inventoryFieldKeys = new Set(event.data.inventory.fields.map((field) => field.key));
        const inventorySectionKeys = new Set(
          event.data.inventory.sections.map((section) => section.key),
        );
        const mergedFields = { ...(base.fields || {}) };

        // Remove stale fields left behind when a coded website component changes its
        // internal markup. This prevents old plain hero titles and animated zero
        // counters from continuing to override the current design.
        Object.entries(base.field_meta || {}).forEach(([key, fieldMeta]) => {
          if (
            fieldMeta.section_key &&
            inventorySectionKeys.has(fieldMeta.section_key) &&
            !inventoryFieldKeys.has(key)
          ) {
            delete mergedFields[key];
          }
        });

        event.data.inventory.fields.forEach((field) => {
          const hasStoredValue = Object.prototype.hasOwnProperty.call(mergedFields, field.key);
          const storedValue = hasStoredValue ? String(mergedFields[field.key]) : "";
          const previousMeta = base.field_meta?.[field.key];
          const isLegacyZeroCounter =
            field.role === "counter" &&
            storedValue.trim() === "0" &&
            String(field.default_value || "").trim() !== "0" &&
            previousMeta?.role !== "counter";
          if (!hasStoredValue || isLegacyZeroCounter) mergedFields[field.key] = field.value;
        });
        const mergedMeta = { ...(base.field_meta || {}) };
        Object.keys(mergedMeta).forEach((key) => {
          const fieldMeta = mergedMeta[key];
          if (
            fieldMeta.section_key &&
            inventorySectionKeys.has(fieldMeta.section_key) &&
            !inventoryFieldKeys.has(key)
          ) {
            delete mergedMeta[key];
          }
        });
        Object.assign(mergedMeta, buildMeta(event.data.inventory.fields));
        const currentOrder = base.section_order || [];
        const sectionOrder = currentOrder.length
          ? currentOrder
          : event.data.inventory.sections.map((section) => section.key);
        const next: CmsNativeContent = {
          ...base,
          template_path: pageRef.current.full_path ? `/${pageRef.current.full_path}` : "/",
          template_version: 1,
          fields: mergedFields,
          field_meta: mergedMeta,
          section_order: sectionOrder,
          hidden_sections: base.hidden_sections || [],
          deleted_sections: base.deleted_sections || [],
          section_html: base.section_html || {},
          section_clones: base.section_clones || [],
          element_links: base.element_links || {},
        };
        const changed =
          !sameRecord(base.fields || {}, next.fields || {}) ||
          Object.keys(base.field_meta || {}).length !== Object.keys(next.field_meta || {}).length ||
          JSON.stringify(base.section_order || []) !== JSON.stringify(next.section_order || []) ||
          JSON.stringify(base.hidden_sections || []) !==
            JSON.stringify(next.hidden_sections || []) ||
          JSON.stringify(base.deleted_sections || []) !==
            JSON.stringify(next.deleted_sections || []) ||
          JSON.stringify(base.section_clones || []) !== JSON.stringify(next.section_clones || []) ||
          JSON.stringify(base.section_html || {}) !== JSON.stringify(next.section_html || {}) ||
          JSON.stringify(base.element_links || {}) !== JSON.stringify(next.element_links || {});
        if (changed) {
          const nextPage = { ...currentPage, native_content: next };
          pageRef.current = nextPage;
          onChange(nextPage);
        }
      }

      if (event.data?.type === "bb-cms:select") {
        setSelectedKeys(event.data.fields.map((field) => field.key));
        const nextRepeat = event.data.repeat_context || null;
        setRepeatContext(nextRepeat);
        setElementContext(event.data.element_context || null);
        setLinkScope(nextRepeat ? "item" : "element");
      }
    };
    const resolvers = exportResolvers.current;
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      resolvers.forEach(({ reject }) => reject(new Error("Editor closed.")));
      resolvers.clear();
    };
  }, [onChange, setNotice]);

  useEffect(() => {
    if (!page.id) return;
    const timer = window.setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "bb-cms:request-inventory" },
        window.location.origin,
      );
    }, 700);
    return () => window.clearTimeout(timer);
  }, [page.id]);

  const previewWidth = device === "desktop" ? 1440 : 390;
  const displayHeight = focusMode
    ? Math.max(560, viewportHeight - 118)
    : device === "desktop"
      ? 760
      : 720;
  const previewScale = device === "mobile" ? fitScale : zoomMode === "fit" ? fitScale : zoomMode;
  const iframeHeight = Math.max(
    displayHeight,
    Math.round(displayHeight / Math.max(previewScale, 0.1)),
  );

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  useEffect(() => {
    if (!focusMode) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusMode]);

  useEffect(() => {
    const host = previewHostRef.current;
    if (!host) return;
    const updateScale = () => {
      const available = Math.max(280, host.clientWidth - 32);
      setFitScale(Math.min(1, available / previewWidth));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(host);
    return () => observer.disconnect();
  }, [previewWidth, focusMode, inspectorOpen]);

  const allFields = useMemo(() => {
    const combined = new Map<string, CmsNativeField>();
    inventory.fields.forEach((field) => combined.set(field.key, field));
    Object.entries(meta).forEach(([key, fieldMeta]) => {
      if (!combined.has(key)) {
        combined.set(key, {
          ...fieldMeta,
          key,
          value: values[key] || fieldMeta.default_value || "",
        } as CmsNativeField);
      }
    });
    return Array.from(combined.values()).map((field) => ({
      ...field,
      value: Object.prototype.hasOwnProperty.call(values, field.key)
        ? values[field.key]
        : field.value,
    }));
  }, [inventory.fields, meta, values]);

  const selectedFields = selectedKeys
    .map((key) => allFields.find((field) => field.key === key))
    .filter((field): field is CmsNativeField => Boolean(field));

  const filteredFields = allFields.filter((field) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return [field.label, field.value, field.section_label, field.attribute, field.tag]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  function updateField(field: CmsNativeField, value: string) {
    const current = normalizeNativeContent(pageRef.current);
    emit({
      ...current,
      fields: { ...(current.fields || {}), [field.key]: value },
      field_meta: {
        ...(current.field_meta || {}),
        [field.key]: (() => {
          const { value: _value, ...rest } = field;
          return rest;
        })(),
      },
    });
  }

  async function uploadForField(field: CmsNativeField, file?: File) {
    if (!file) return;
    setUploadingKey(field.key);
    try {
      const result = await uploadMedia(file);
      updateField(field, result.url);
      setNotice({ type: "success", text: "Image uploaded and added to the page." });
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Image upload failed.",
      });
    } finally {
      setUploadingKey("");
    }
  }

  function focusField(key: string) {
    setSelectedKeys([key]);
    setRepeatContext(null);
    setElementContext(null);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "bb-cms:focus-field", key },
      window.location.origin,
    );
  }

  function updateSections(sectionOrder: string[], hiddenSections: string[]) {
    const current = normalizeNativeContent(pageRef.current);
    emit({ ...current, section_order: sectionOrder, hidden_sections: hiddenSections });
  }

  function moveSection(key: string, direction: -1 | 1) {
    const currentContent = normalizeNativeContent(pageRef.current);
    const current = currentContent.section_order?.length
      ? [...currentContent.section_order]
      : inventory.sections.map((section) => section.key);
    const index = current.indexOf(key);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return;
    [current[index], current[nextIndex]] = [current[nextIndex], current[index]];
    updateSections(current, currentContent.hidden_sections || []);
  }

  function toggleSection(key: string) {
    const current = normalizeNativeContent(pageRef.current);
    const hidden = new Set(current.hidden_sections || []);
    if (hidden.has(key)) hidden.delete(key);
    else hidden.add(key);
    updateSections(
      current.section_order?.length
        ? current.section_order
        : inventory.sections.map((section) => section.key),
      Array.from(hidden),
    );
  }

  function removeSectionCompletely(section: CmsDomSection) {
    const current = normalizeNativeContent(pageRef.current);
    const nextHtml = { ...(current.section_html || {}) };
    delete nextHtml[section.key];
    const nextLinks = Object.fromEntries(
      Object.entries(current.element_links || {}).filter(
        ([, link]) => link.section_key !== section.key,
      ),
    );
    emit({
      ...current,
      deleted_sections: section.is_clone
        ? current.deleted_sections || []
        : Array.from(new Set([...(current.deleted_sections || []), section.key])),
      section_clones: (current.section_clones || []).filter((clone) => clone.id !== section.key),
      section_html: nextHtml,
      element_links: nextLinks,
      section_order: (current.section_order || []).filter((key) => key !== section.key),
      hidden_sections: (current.hidden_sections || []).filter((key) => key !== section.key),
      fields: Object.fromEntries(
        Object.entries(current.fields || {}).filter(
          ([key]) => current.field_meta?.[key]?.section_key !== section.key,
        ),
      ),
      field_meta: Object.fromEntries(
        Object.entries(current.field_meta || {}).filter(
          ([, field]) => field.section_key !== section.key,
        ),
      ),
    });
    setDeleteSection(null);
    setSelectedKeys([]);
    setRepeatContext(null);
    setElementContext(null);
    setNotice({
      type: "success",
      text: section.is_clone
        ? "Duplicated section deleted from this page."
        : "Existing section deleted from this page.",
    });
  }

  function linkKeyFor(context: CmsElementContext): string {
    return `${context.section_key}|${context.element_path}`;
  }

  function updateElementLink(context: CmsElementContext, patch: Partial<CmsElementLink>) {
    const current = normalizeNativeContent(pageRef.current);
    const key = linkKeyFor(context);
    const existing = current.element_links?.[key];
    const next: CmsElementLink = {
      section_key: context.section_key,
      element_path: context.element_path,
      href: existing?.href || (linkPages[0] ? visualPagePath(linkPages[0]) : "/"),
      target: existing?.target || "_self",
      label: context.label,
      ...existing,
      ...patch,
    };
    emit({
      ...current,
      element_links: { ...(current.element_links || {}), [key]: next },
    });
  }

  function removeElementLink(context: CmsElementContext) {
    const current = normalizeNativeContent(pageRef.current);
    const nextLinks = { ...(current.element_links || {}) };
    delete nextLinks[linkKeyFor(context)];
    emit({ ...current, element_links: nextLinks });
  }

  function mutateRepeat(action: "duplicate" | "delete") {
    if (!repeatContext) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "bb-cms:mutate-repeat", action, context: repeatContext },
      window.location.origin,
    );
  }

  function requestSectionExport(sectionKey: string): Promise<SectionExport> {
    return new Promise((resolve, reject) => {
      const requestId = cryptoId("section-export");
      exportResolvers.current.set(requestId, { resolve, reject });
      iframeRef.current?.contentWindow?.postMessage(
        { type: "bb-cms:export-section", section_key: sectionKey, request_id: requestId },
        window.location.origin,
      );
      window.setTimeout(() => {
        const resolver = exportResolvers.current.get(requestId);
        if (!resolver) return;
        exportResolvers.current.delete(requestId);
        resolver.reject(new Error("Could not read the selected section from the preview."));
      }, 6000);
    });
  }

  async function duplicateToCurrent() {
    if (!duplicateSection) return;
    setDuplicating(true);
    try {
      const exported = await requestSectionExport(duplicateSection.key);
      if (!exported.html) throw new Error("The selected section could not be copied.");
      const current = normalizeNativeContent(pageRef.current);
      const cloneId = cryptoId("section-clone");
      const clone: CmsSectionClone = {
        id: cloneId,
        source_section_key: duplicateSection.key,
        label: `${exported.label} (Copy)`,
        html: exported.html,
      };
      const order = current.section_order?.length
        ? [...current.section_order]
        : inventory.sections.map((section) => section.key);
      const sourceIndex = order.indexOf(duplicateSection.key);
      order.splice(sourceIndex >= 0 ? sourceIndex + 1 : order.length, 0, cloneId);
      emit({
        ...current,
        section_clones: [...(current.section_clones || []), clone],
        section_order: order,
      });
      setNotice({ type: "success", text: "Section duplicated to the current page." });
      closeDuplicateDialog();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Could not duplicate section.",
      });
    } finally {
      setDuplicating(false);
    }
  }

  async function openAnotherPageStep() {
    setDuplicateStep("another");
    try {
      const pages = await fetchAdminPages();
      const candidates = pages.filter((candidate) => candidate.id !== page.id);
      setTargetPages(candidates);
      setTargetPageId(candidates[0]?.id ? String(candidates[0].id) : "");
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Could not load pages.",
      });
    }
  }

  async function duplicateToAnotherPage() {
    if (!duplicateSection || !targetPageId) return;
    setDuplicating(true);
    try {
      const exported = await requestSectionExport(duplicateSection.key);
      if (!exported.html) throw new Error("The selected section could not be copied.");
      const target = await fetchAdminPage(Number(targetPageId));
      const targetContent = normalizeNativeContent(target);
      const cloneId = cryptoId("section-clone");
      const clone: CmsSectionClone = {
        id: cloneId,
        source_section_key: duplicateSection.key,
        label: `${exported.label} (Copy)`,
        html: exported.html,
      };
      const nextOrder = targetContent.section_order?.length
        ? [...targetContent.section_order, cloneId]
        : [];
      await saveAdminPage({
        ...target,
        title: target.title,
        native_content: {
          ...targetContent,
          section_clones: [...(targetContent.section_clones || []), clone],
          section_order: nextOrder,
        },
      });
      setNotice({
        type: "success",
        text: `Section duplicated to “${target.title}”. Open that page in the editor to position or edit it.`,
      });
      closeDuplicateDialog();
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Could not duplicate section.",
      });
    } finally {
      setDuplicating(false);
    }
  }

  function closeDuplicateDialog() {
    setDuplicateSection(null);
    setDuplicateStep("choice");
    setTargetPages([]);
    setTargetPageId("");
  }

  const orderedSections: CmsDomSection[] = useMemo(() => {
    const byKey = new Map(inventory.sections.map((section) => [section.key, section]));
    const order = nativeContent.section_order?.length
      ? nativeContent.section_order
      : inventory.sections.map((section) => section.key);
    return order
      .map((key) => byKey.get(key))
      .filter((section): section is CmsDomSection => Boolean(section));
  }, [inventory.sections, nativeContent.section_order]);

  const linkSubject: CmsElementContext | null =
    linkScope === "item" && repeatContext
      ? {
          section_key: repeatContext.section_key,
          element_path: repeatContext.item_path,
          tag: "card",
          label: repeatContext.label,
        }
      : elementContext;
  const selectedElementLink = linkSubject
    ? nativeContent.element_links?.[linkKeyFor(linkSubject)]
    : undefined;

  if (!page.id) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Save this page once, then reopen it to use the full visual editor.
      </div>
    );
  }

  return (
    <>
      <section
        className={
          focusMode
            ? "fixed inset-0 z-[90] flex flex-col overflow-hidden bg-white shadow-2xl"
            : "overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 px-5 py-4">
          <div>
            <h3 className="font-semibold">Full visual page editor</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Desktop preview uses a real 1440px viewport. Click content, cards, icons, images, or
              links to edit them.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center rounded-xl border border-black/10 bg-white p-1">
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${device === "desktop" ? "bg-black text-white" : "text-black hover:bg-black/5"}`}
                onClick={() => setDevice("desktop")}
              >
                <Monitor className="mr-1.5 inline size-3.5" /> Desktop
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${device === "mobile" ? "bg-black text-white" : "text-black hover:bg-black/5"}`}
                onClick={() => setDevice("mobile")}
              >
                <Smartphone className="mr-1.5 inline size-3.5" /> Mobile
              </button>
            </div>

            {device === "desktop" ? (
              <select
                aria-label="Preview zoom"
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium outline-none hover:bg-black/5 focus:border-violet-400"
                value={String(zoomMode)}
                onChange={(event) => {
                  const value = event.target.value;
                  setZoomMode(value === "fit" ? "fit" : (Number(value) as 0.5 | 0.75 | 1));
                }}
              >
                <option value="fit">Fit to workspace</option>
                <option value="0.5">50% readable</option>
                <option value="0.75">75%</option>
                <option value="1">100% actual size</option>
              </select>
            ) : null}

            <button
              type="button"
              className={`rounded-lg border p-2 ${inspectorOpen ? "border-violet-200 bg-violet-50 text-violet-700" : "border-black/10 bg-white hover:bg-black/5"}`}
              title={inspectorOpen ? "Hide editor panel" : "Show editor panel"}
              onClick={() => setInspectorOpen((open) => !open)}
            >
              {inspectorOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </button>

            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${focusMode ? "border-black bg-black text-white" : "border-black/10 bg-white hover:bg-black/5"}`}
              title={focusMode ? "Exit focus mode (Esc)" : "Open large visual editor"}
              onClick={() => {
                setFocusMode((current) => {
                  const next = !current;
                  if (next && device === "desktop") setZoomMode("fit");
                  return next;
                });
              }}
            >
              {focusMode ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              {focusMode ? "Exit focus" : "Large editor"}
            </button>

            <button
              type="button"
              className="rounded-lg border border-black/10 bg-white p-2 hover:bg-black/5"
              title="Reload preview"
              onClick={() => {
                setLoading(true);
                iframeRef.current?.contentWindow?.location.reload();
              }}
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>

        <div
          className={
            focusMode
              ? `grid min-h-0 flex-1 ${inspectorOpen ? "grid-cols-[minmax(0,1fr)_400px]" : "grid-cols-1"}`
              : `grid min-h-[800px] ${inspectorOpen ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1"}`
          }
        >
          <div
            ref={previewHostRef}
            className="relative min-w-0 overflow-auto bg-[#e9e9e5] p-4 sm:p-6"
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-3 bg-white/85 text-sm">
                <Loader2 className="size-5 animate-spin" /> Loading page content…
              </div>
            )}
            <div
              className="mx-auto overflow-hidden rounded-xl bg-white shadow-xl"
              style={{ width: previewWidth * previewScale, height: displayHeight }}
            >
              <iframe
                key={`${page.id}:${page.full_path || "/"}`}
                ref={iframeRef}
                title="Editable page preview"
                src={`${page.full_path ? `/${page.full_path}` : "/"}?cms_edit=1&cms_page_id=${page.id}`}
                className="origin-top-left border-0 bg-white"
                style={{
                  width: previewWidth,
                  height: iframeHeight,
                  transform: `scale(${previewScale})`,
                }}
                onLoad={() => {
                  window.setTimeout(() => {
                    iframeRef.current?.contentWindow?.postMessage(
                      { type: "bb-cms:request-inventory" },
                      window.location.origin,
                    );
                  }, 500);
                }}
              />
            </div>
            <div className="mx-auto mt-3 w-fit rounded-full bg-black/75 px-3 py-1 text-[10px] font-medium text-white">
              {device === "desktop"
                ? `1440px desktop · ${Math.round(previewScale * 100)}% scale`
                : "390px mobile"}
            </div>
          </div>

          {inspectorOpen ? (
            <aside className="min-h-0 overflow-y-auto border-t border-black/8 bg-[#fafaf8] xl:border-l xl:border-t-0">
              <div className="border-b border-black/8 p-5">
                <h4 className="text-sm font-semibold">Selected element</h4>
                {selectedFields.length || elementContext ? (
                  <div className="mt-4 space-y-4">
                    {selectedFields.map((field) => (
                      <FieldControl
                        key={field.key}
                        field={field}
                        value={values[field.key] ?? field.value}
                        uploading={uploadingKey === field.key}
                        onChange={(next) => updateField(field, next)}
                        onReset={() => updateField(field, field.default_value || "")}
                        onUpload={(file) => void uploadForField(field, file)}
                        onChooseMedia={() => setMediaField(field)}
                        pages={linkPages}
                      />
                    ))}
                    {repeatContext ? (
                      <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">
                          Repeating card / item
                        </div>
                        <div className="mt-1 text-xs font-semibold text-violet-950">
                          {repeatContext.label}
                        </div>
                        <div className="mt-1 text-[11px] text-violet-800/75">
                          {repeatContext.item_count} items in this group
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-800"
                            onClick={() => mutateRepeat("duplicate")}
                          >
                            <Plus className="size-3.5" /> Add / duplicate
                          </button>
                          <button
                            type="button"
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            onClick={() => mutateRepeat("delete")}
                          >
                            <Trash2 className="size-3.5" /> Delete item
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {elementContext && linkSubject ? (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                          Clickable link
                        </div>
                        <div className="mt-1 text-xs font-semibold text-blue-950">
                          {linkSubject.label || "Selected element"}
                        </div>
                        {repeatContext ? (
                          <div className="mt-3 grid grid-cols-2 rounded-lg border border-blue-200 bg-white p-1">
                            <button
                              type="button"
                              className={`rounded-md px-2 py-1.5 text-[11px] font-semibold ${linkScope === "item" ? "bg-blue-700 text-white" : "text-blue-900 hover:bg-blue-50"}`}
                              onClick={() => setLinkScope("item")}
                            >
                              Entire card
                            </button>
                            <button
                              type="button"
                              className={`rounded-md px-2 py-1.5 text-[11px] font-semibold ${linkScope === "element" ? "bg-blue-700 text-white" : "text-blue-900 hover:bg-blue-50"}`}
                              onClick={() => setLinkScope("element")}
                            >
                              Selected text/element
                            </button>
                          </div>
                        ) : null}
                        <label className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-white px-3 py-2 text-[11px] font-semibold text-blue-950">
                          Make this {linkScope === "item" && repeatContext ? "card" : "element"} a
                          link
                          <input
                            type="checkbox"
                            checked={Boolean(selectedElementLink)}
                            onChange={(event) => {
                              if (event.target.checked) updateElementLink(linkSubject, {});
                              else removeElementLink(linkSubject);
                            }}
                          />
                        </label>
                        {selectedElementLink ? (
                          <div className="mt-3">
                            <VisualLinkControl
                              value={selectedElementLink.href}
                              pages={linkPages}
                              onChange={(href) => updateElementLink(linkSubject, { href })}
                            />
                            <select
                              className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-400"
                              value={selectedElementLink.target || "_self"}
                              onChange={(event) =>
                                updateElementLink(linkSubject, {
                                  target: event.target.value as "_self" | "_blank",
                                })
                              }
                            >
                              <option value="_self">Open in same tab</option>
                              <option value="_blank">Open in new tab</option>
                            </select>
                          </div>
                        ) : (
                          <p className="mt-2 text-[10px] leading-relaxed text-blue-800/75">
                            Enable this to link any text block, heading, icon, or complete card
                            without changing its design.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-black/15 bg-white p-4 text-xs leading-relaxed text-muted-foreground">
                    Click any editable item inside the preview. Cards can be duplicated or deleted,
                    and SVG icons now open an icon picker.
                  </p>
                )}
              </div>

              <div className="border-b border-black/8 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold">Sections</h4>
                  <span className="text-xs text-muted-foreground">{orderedSections.length}</span>
                </div>
                <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
                  {orderedSections.map((section, index) => {
                    const hidden = (nativeContent.hidden_sections || []).includes(section.key);
                    return (
                      <div
                        key={section.key}
                        className="flex items-center gap-1.5 rounded-xl border border-black/8 bg-white p-2.5"
                      >
                        <button
                          type="button"
                          className="min-w-0 flex-1 truncate text-left text-xs font-medium"
                          title={section.label}
                          onClick={() => {
                            const first = allFields.find(
                              (field) => field.section_key === section.key,
                            );
                            if (first) focusField(first.key);
                          }}
                        >
                          {index + 1}. {section.label}
                          {section.is_clone ? (
                            <span className="ml-1 text-[9px] uppercase text-violet-600">copy</span>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-1 hover:bg-black/5"
                          title="Move up"
                          onClick={() => moveSection(section.key, -1)}
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-1 hover:bg-black/5"
                          title="Move down"
                          onClick={() => moveSection(section.key, 1)}
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-1 hover:bg-black/5"
                          title={hidden ? "Show section" : "Hide section"}
                          onClick={() => toggleSection(section.key)}
                        >
                          {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-1 text-violet-700 hover:bg-violet-50"
                          title="Duplicate section"
                          onClick={() => {
                            setDuplicateSection(section);
                            setDuplicateStep("choice");
                          }}
                        >
                          <Copy className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-1 text-red-600 hover:bg-red-50"
                          title={
                            section.is_clone
                              ? "Delete duplicated section"
                              : "Delete existing section"
                          }
                          onClick={() => setDeleteSection(section)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold">All page content</h4>
                  <span className="text-xs text-muted-foreground">{allFields.length} fields</span>
                </div>
                <label className="relative mt-3 block">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-black/30"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search text, links, images, icons…"
                  />
                </label>
                <div className="mt-3 max-h-80 space-y-1.5 overflow-auto pr-1">
                  {filteredFields.map((field) => (
                    <button
                      type="button"
                      key={field.key}
                      onClick={() => focusField(field.key)}
                      className={`block w-full rounded-xl border p-3 text-left transition ${selectedKeys.includes(field.key) ? "border-violet-300 bg-violet-50" : "border-black/8 bg-white hover:border-black/20"}`}
                    >
                      <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        {field.section_label || "Page"} ·{" "}
                        {field.type === "attribute"
                          ? field.attribute
                          : field.type === "icon"
                            ? "icon"
                            : field.tag}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs leading-relaxed">
                        {field.type === "icon" ? (
                          <CmsIconPreview
                            name={values[field.key] ?? field.value}
                            className="size-4 shrink-0"
                          />
                        ) : null}
                        <span className="line-clamp-2">
                          {(values[field.key] ?? field.value) || field.label}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {duplicateSection ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
          onMouseDown={(event) => event.target === event.currentTarget && closeDuplicateDialog()}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <Layers3 className="size-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold">Duplicate section</h3>
                <p className="mt-1 text-sm text-muted-foreground">{duplicateSection.label}</p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-black/5"
                onClick={closeDuplicateDialog}
              >
                <X className="size-5" />
              </button>
            </div>

            {duplicateStep === "choice" ? (
              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  disabled={duplicating}
                  className="rounded-2xl border border-black/10 p-4 text-left hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60"
                  onClick={() => void duplicateToCurrent()}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {duplicating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    Duplicate to Current Page
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Creates a fully editable copy directly after this section.
                  </p>
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-black/10 p-4 text-left hover:border-violet-300 hover:bg-violet-50"
                  onClick={() => void openAnotherPageStep()}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Layers3 className="size-4" /> Duplicate to Another Page
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Copies the complete section layout and current content to another CMS page.
                  </p>
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <label className="text-xs font-semibold">Choose destination page</label>
                <select
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400"
                  value={targetPageId}
                  onChange={(event) => setTargetPageId(event.target.value)}
                >
                  {targetPages.length ? null : (
                    <option value="">No other native pages available</option>
                  )}
                  {targetPages.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.title} — /
                      {candidate.full_path === "__home__" ? "" : candidate.full_path}
                    </option>
                  ))}
                </select>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold"
                    onClick={() => setDuplicateStep("choice")}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!targetPageId || duplicating}
                    className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    onClick={() => void duplicateToAnotherPage()}
                  >
                    {duplicating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    Duplicate Section
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <MediaPicker
        open={Boolean(mediaField)}
        selectedUrl={mediaField ? values[mediaField.key] || mediaField.value : ""}
        title="Choose image for page"
        onClose={() => setMediaField(null)}
        onSelect={(url) => {
          if (mediaField) updateField(mediaField, url);
          setMediaField(null);
        }}
      />

      {deleteSection ? (
        <div
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/55 p-4"
          onMouseDown={(event) => event.target === event.currentTarget && setDeleteSection(null)}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex size-11 items-center justify-center rounded-full bg-red-100 text-red-700">
              <Trash2 className="size-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Delete section?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This will remove <strong className="text-black">{deleteSection.label}</strong> and all
              of its saved text, links, cards, and images from this page.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold"
                onClick={() => setDeleteSection(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => removeSectionCompletely(deleteSection)}
              >
                <Trash2 className="size-4" /> Delete Section
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function visualPagePath(page: Pick<AdminPage, "full_path">): string {
  return page.full_path === "__home__" ? "/" : `/${page.full_path}`;
}

function VisualLinkControl({
  value,
  pages,
  onChange,
}: {
  value: string;
  pages: AdminPage[];
  onChange: (value: string) => void;
}) {
  const matchingPage = pages.find((page) => visualPagePath(page) === value);
  const [custom, setCustom] = useState(() => !matchingPage);

  useEffect(() => {
    if (matchingPage) setCustom(false);
  }, [matchingPage]);

  return (
    <div className="mt-3">
      <label className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold">
        <input
          type="checkbox"
          checked={custom}
          onChange={(event) => {
            const next = event.target.checked;
            setCustom(next);
            if (!next) onChange(pages[0] ? visualPagePath(pages[0]) : "/");
          }}
        />
        External or custom URL
      </label>
      {custom ? (
        <input
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-black/30"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://…, mailto:…, tel:…, or #section"
        />
      ) : (
        <select
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-black/30"
          value={matchingPage?.id != null ? String(matchingPage.id) : ""}
          onChange={(event) => {
            const page = pages.find((candidate) => String(candidate.id) === event.target.value);
            if (page) onChange(visualPagePath(page));
          }}
        >
          <option value="">Select a page</option>
          {pages.map((page) => (
            <option key={page.id} value={String(page.id)}>
              {page.title} ({visualPagePath(page)})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function FieldControl({
  field,
  value,
  uploading,
  onChange,
  onReset,
  onUpload,
  onChooseMedia,
  pages,
}: {
  field: CmsNativeField;
  value: string;
  uploading: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
  onUpload: (file?: File) => void;
  onChooseMedia: () => void;
  pages: AdminPage[];
}) {
  const isImage = field.type === "attribute" && field.attribute === "src" && field.tag === "img";
  const isLongText = field.type === "text" && (value.length > 90 || /\n/.test(value));
  return (
    <div className="rounded-xl border border-black/8 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {field.section_label || "Page"}
          </div>
          <div className="mt-1 truncate text-xs font-semibold">
            {field.label || field.attribute || "Content"}
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-black/5 hover:text-black"
          title="Reset to original"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
      {field.type === "icon" ? (
        <div className="mt-3">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-[#fafaf8] p-3">
            <CmsIconPreview name={value} className="size-7" />
            <div>
              <div className="text-xs font-semibold">Current icon</div>
              <div className="text-[10px] text-muted-foreground">{value}</div>
            </div>
          </div>
          <select
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-violet-400"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            {CMS_ICON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : field.attribute === "href" ? (
        <VisualLinkControl value={value} pages={pages} onChange={onChange} />
      ) : field.attribute === "target" ? (
        <select
          className="mt-3 w-full rounded-lg border border-black/10 px-3 py-2 text-xs"
          value={value || "_self"}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="_self">Open in same tab</option>
          <option value="_blank">Open in new tab</option>
        </select>
      ) : isLongText ? (
        <textarea
          className="mt-3 min-h-28 w-full resize-y rounded-lg border border-black/10 px-3 py-2 text-xs leading-relaxed outline-none focus:border-black/30"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="mt-3 w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-black/30"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {isImage && (
        <div className="mt-3">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="mb-2 aspect-video w-full rounded-lg border border-black/8 object-cover"
            />
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onChooseMedia}
              className="flex items-center justify-center gap-2 rounded-lg border border-black/15 px-3 py-2 text-xs font-medium hover:bg-black/5"
            >
              <Library className="size-3.5" /> Choose from Media
            </button>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/15 px-3 py-2 text-xs font-medium hover:bg-black/5">
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload new"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(event) => onUpload(event.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      )}
      {!isImage && field.attribute === "src" ? (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <ImageIcon className="size-3" /> External media URL
        </div>
      ) : null}
    </div>
  );
}
