import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  GripVertical,
  ImagePlus,
  LayoutGrid,
  Link2,
  ListTree,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminButton,
  AdminCard,
  AdminLoading,
  AdminPageHeader,
  EmptyState,
  FieldLabel,
  adminInputClass,
} from "@/components/admin/admin-ui";
import {
  listContent,
  listMenus,
  saveMenu,
  restoreDefaultServicesMenu,
  uploadMedia,
  type ContentItem,
  type Menu,
  type MenuItem,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/menus")({ component: MenusPage });

type EditableMenuItem = Omit<MenuItem, "parent_index"> & {
  client_id: string;
  parent_client_id: string;
};

const contentTypes: Array<{ type: ContentItem["content_type"]; label: string }> = [
  { type: "page", label: "Pages" },
  { type: "service", label: "Services" },
  { type: "case_study", label: "Case Studies" },
  { type: "portfolio", label: "Portfolio" },
  { type: "insight", label: "Insights" },
  { type: "resource", label: "Guides" },
  { type: "comparison", label: "Comparisons" },
  { type: "engagement_model", label: "Engagement Models" },
  { type: "career", label: "Careers" },
];

function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [linkTargets, setLinkTargets] = useState<ContentItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [items, setItems] = useState<EditableMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoringDefault, setRestoringDefault] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const load = useCallback(async (preferredId: number | null = null) => {
    setLoading(true);
    try {
      const [menuResult, contentResults] = await Promise.all([
        listMenus(),
        Promise.all(
          contentTypes.map(({ type }) =>
            listContent({ type, status: "all", page: 1, perPage: 250 }),
          ),
        ),
      ]);
      setMenus(menuResult);
      setLinkTargets(contentResults.flatMap((result) => result.data));
      const firstId = preferredId || menuResult[0]?.id || null;
      setSelectedId(firstId);
      const selected = menuResult.find((menu) => menu.id === firstId) || menuResult[0];
      setItems(normalizeMenuItems(selected?.items || []));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load menus.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedId) || null,
    [menus, selectedId],
  );

  const groupedTargets = useMemo(
    () =>
      contentTypes.map((group) => ({
        ...group,
        items: linkTargets
          .filter((item) => item.content_type === group.type)
          .sort((a, b) => a.title.localeCompare(b.title)),
      })),
    [linkTargets],
  );

  function chooseMenu(id: number) {
    setSelectedId(id);
    const menu = menus.find((entry) => entry.id === id);
    setItems(normalizeMenuItems(menu?.items || []));
  }

  function update(clientId: string, key: keyof EditableMenuItem, value: unknown) {
    setItems((current) =>
      current.map((item) => (item.client_id === clientId ? { ...item, [key]: value } : item)),
    );
  }

  function addItem(parentClientId = "", overrides: Partial<EditableMenuItem> = {}) {
    setItems((current) => [...current, createEmptyItem(current.length, parentClientId, overrides)]);
  }

  function duplicateItem(clientId: string) {
    setItems((current) => {
      const source = current.find((item) => item.client_id === clientId);
      if (!source) return current;
      return [
        ...current,
        {
          ...source,
          id: undefined,
          client_id: createClientId(),
          label: `${source.label} Copy`,
          sort_order: current.length,
        },
      ];
    });
  }

  function removeItem(clientId: string) {
    setItems((current) => {
      const toDelete = new Set<string>([clientId]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const item of current) {
          if (
            item.parent_client_id &&
            toDelete.has(item.parent_client_id) &&
            !toDelete.has(item.client_id)
          ) {
            toDelete.add(item.client_id);
            changed = true;
          }
        }
      }
      return current
        .filter((item) => !toDelete.has(item.client_id))
        .map((item, index) => ({ ...item, sort_order: index }));
    });
  }

  function move(clientId: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.client_id === clientId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, itemIndex) => ({ ...item, sort_order: itemIndex }));
    });
  }

  function indent(clientId: string) {
    setItems((current) => {
      const index = current.findIndex((item) => item.client_id === clientId);
      if (index <= 0) return current;
      const previous = current[index - 1];
      if (isDescendant(current, previous.client_id, clientId)) return current;
      return current.map((item) =>
        item.client_id === clientId ? { ...item, parent_client_id: previous.client_id } : item,
      );
    });
  }

  function outdent(clientId: string) {
    setItems((current) => {
      const item = current.find((entry) => entry.client_id === clientId);
      if (!item?.parent_client_id) return current;
      const parent = current.find((entry) => entry.client_id === item.parent_client_id);
      return current.map((entry) =>
        entry.client_id === clientId
          ? { ...entry, parent_client_id: parent?.parent_client_id || "" }
          : entry,
      );
    });
  }

  async function uploadForItem(
    clientId: string,
    key: "icon_url" | "image_url" | "mega_promo_image",
    file?: File,
  ) {
    if (!file) return;
    const uploadKey = `${clientId}-${key}`;
    setUploadingKey(uploadKey);
    try {
      const uploaded = await uploadMedia(file, "Menu image");
      update(clientId, key, uploaded.url);
      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function restoreOriginalServicesMegaMenu() {
    if (!selectedMenu || selectedMenu.location !== "header") return;
    if (
      !window.confirm(
        "Restore the current Logicsify Services mega menu defaults? This replaces only the current Services mega-menu children and promo content. Other header links stay unchanged.",
      )
    )
      return;
    setRestoringDefault(true);
    try {
      await restoreDefaultServicesMenu(selectedMenu.id);
      toast.success("The original Logicsify Services mega menu was restored.");
      await load(selectedMenu.id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not restore the default mega menu.",
      );
    } finally {
      setRestoringDefault(false);
    }
  }

  async function save() {
    if (!selectedMenu) return;
    if (items.some((item) => !item.label.trim())) {
      toast.error("Every menu item and heading needs a label.");
      return;
    }
    const indexByClientId = new Map(items.map((item, index) => [item.client_id, index]));
    setSaving(true);
    try {
      await saveMenu(
        selectedMenu.id,
        items.map(({ client_id, parent_client_id, ...item }, index) => ({
          ...item,
          sort_order: index,
          parent_index: parent_client_id ? (indexByClientId.get(parent_client_id) ?? "") : "",
        })),
      );
      toast.success(`${selectedMenu.name} saved.`);
      await load(selectedId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save menu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Navigation"
        title="Menus & Mega Menus"
        description="Build standard links, dropdowns and fully managed mega menus with columns, headings, descriptions, badges, promo cards and visibility controls."
        actions={
          <>
            {selectedMenu?.location === "header" ? (
              <AdminButton
                variant="secondary"
                onClick={() => void restoreOriginalServicesMegaMenu()}
                disabled={restoringDefault}
              >
                <RotateCcw className="h-4 w-4" />
                {restoringDefault ? "Restoring…" : "Restore default Services mega menu"}
              </AdminButton>
            ) : null}
            <AdminButton onClick={() => void save()} disabled={!selectedMenu || saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save menu"}
            </AdminButton>
          </>
        }
      />

      {loading ? (
        <AdminLoading label="Loading menus…" />
      ) : !menus.length ? (
        <EmptyState
          title="No menus configured"
          description="Run the backend installer or create header and footer menu records in the database."
        />
      ) : (
        <div className="grid gap-7 xl:grid-cols-[260px_1fr]">
          <AdminCard className="h-fit p-3">
            <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Menu locations
            </p>
            {menus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => chooseMenu(menu.id)}
                className={`mb-1 w-full rounded-xl px-4 py-3 text-left transition ${selectedId === menu.id ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <span className="block text-sm font-semibold">{menu.name}</span>
                <span
                  className={`mt-1 block text-[11px] uppercase tracking-[0.12em] ${selectedId === menu.id ? "text-white/45" : "text-slate-400"}`}
                >
                  {menu.location}
                </span>
              </button>
            ))}
          </AdminCard>

          <div className="space-y-5">
            <AdminCard className="overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-ink">{selectedMenu?.name}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    The numbered cards below are the exact display order. Use parent items to create
                    nesting.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="secondary" onClick={() => addItem()}>
                    <Plus className="h-4 w-4" /> Add root item
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    onClick={() => {
                      const root = items.find(
                        (item) => !item.parent_client_id && item.menu_style === "mega",
                      );
                      addItem(root?.client_id || "", {
                        label: "New group",
                        is_heading: true,
                        is_external: false,
                        page_id: null,
                      });
                    }}
                  >
                    <LayoutGrid className="h-4 w-4" /> Add mega group
                  </AdminButton>
                </div>
              </div>

              {!items.length ? (
                <EmptyState
                  title="This menu is empty"
                  description="Add the first navigation item to this location."
                  action={
                    <AdminButton onClick={() => addItem()}>
                      <Plus className="h-4 w-4" /> Add item
                    </AdminButton>
                  }
                />
              ) : (
                <div className="space-y-4 p-5">
                  {items.map((item, index) => {
                    const depth = getDepth(items, item.client_id);
                    const megaRoot = findMegaRoot(items, item.client_id);
                    const availableParents = items.filter(
                      (parent) =>
                        parent.client_id !== item.client_id &&
                        !isDescendant(items, parent.client_id, item.client_id),
                    );
                    const isRoot = !item.parent_client_id;
                    const isMegaRoot = isRoot && item.menu_style === "mega";
                    const maxColumns =
                      megaRoot?.mega_columns || (isMegaRoot ? item.mega_columns : 3) || 3;

                    return (
                      <div
                        key={item.client_id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
                        style={{ marginLeft: Math.min(depth, 3) * 18 }}
                      >
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-xs font-bold text-white">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-ink">
                                {item.label || "New menu item"}
                              </span>
                              <span className="mt-0.5 flex flex-wrap gap-1 text-[10px] uppercase tracking-wider text-slate-400">
                                {isMegaRoot
                                  ? "Mega menu"
                                  : item.is_heading
                                    ? "Group heading"
                                    : isRoot
                                      ? "Root link"
                                      : `Level ${depth + 1}`}
                                {item.coming_soon ? " · Coming Soon" : ""}
                                {item.hide_desktop ? " · Hidden desktop" : ""}
                                {item.hide_mobile ? " · Hidden mobile" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => outdent(item.client_id)}
                              disabled={!item.parent_client_id}
                              title="Move one level left"
                              className="rounded-lg p-2 text-slate-400 hover:bg-white disabled:opacity-30"
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => indent(item.client_id)}
                              disabled={index === 0}
                              title="Nest under previous item"
                              className="rounded-lg p-2 text-slate-400 hover:bg-white disabled:opacity-30"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(item.client_id, -1)}
                              disabled={index === 0}
                              title="Move up"
                              className="rounded-lg p-2 text-slate-400 hover:bg-white disabled:opacity-30"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(item.client_id, 1)}
                              disabled={index === items.length - 1}
                              title="Move down"
                              className="rounded-lg p-2 text-slate-400 hover:bg-white disabled:opacity-30"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateItem(item.client_id)}
                              title="Duplicate"
                              className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-ink"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => addItem(item.client_id)}
                              title="Add child"
                              className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-ink"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.client_id)}
                              title="Delete item and its children"
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <FieldLabel>Label</FieldLabel>
                            <input
                              value={item.label}
                              onChange={(event) =>
                                update(item.client_id, "label", event.target.value)
                              }
                              className={adminInputClass}
                              placeholder="Menu label"
                            />
                          </div>
                          <div>
                            <FieldLabel>Item purpose</FieldLabel>
                            <select
                              value={item.is_heading ? "heading" : "link"}
                              onChange={(event) => {
                                const heading = event.target.value === "heading";
                                update(item.client_id, "is_heading", heading);
                                if (heading) {
                                  update(item.client_id, "page_id", null);
                                  update(item.client_id, "external_url", "");
                                  update(item.client_id, "is_external", false);
                                }
                              }}
                              className={adminInputClass}
                            >
                              <option value="link">Clickable link</option>
                              <option value="heading">Non-clickable group heading</option>
                            </select>
                          </div>

                          {!item.is_heading ? (
                            <>
                              <div>
                                <FieldLabel>Link type</FieldLabel>
                                <select
                                  value={item.is_external ? "custom" : "content"}
                                  onChange={(event) =>
                                    update(
                                      item.client_id,
                                      "is_external",
                                      event.target.value === "custom",
                                    )
                                  }
                                  className={adminInputClass}
                                >
                                  <option value="content">Choose managed content</option>
                                  <option value="custom">Custom or external URL</option>
                                </select>
                              </div>
                              <div>
                                <FieldLabel>Parent item</FieldLabel>
                                <select
                                  value={item.parent_client_id}
                                  onChange={(event) =>
                                    update(item.client_id, "parent_client_id", event.target.value)
                                  }
                                  className={adminInputClass}
                                >
                                  <option value="">No parent — top level</option>
                                  {availableParents.map((parent) => (
                                    <option key={parent.client_id} value={parent.client_id}>
                                      {"— ".repeat(
                                        Math.min(getDepth(items, parent.client_id) + 1, 4),
                                      )}
                                      {parent.label || "Untitled item"}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {item.is_external ? (
                                <div className="lg:col-span-2">
                                  <FieldLabel>Custom or external URL</FieldLabel>
                                  <div className="relative">
                                    <ExternalLink className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                      value={item.external_url || ""}
                                      onChange={(event) =>
                                        update(item.client_id, "external_url", event.target.value)
                                      }
                                      className={`${adminInputClass} pl-10`}
                                      placeholder="/services/example or https://example.com"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="lg:col-span-2">
                                  <FieldLabel>Managed content</FieldLabel>
                                  <div className="relative">
                                    <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <select
                                      value={item.page_id || ""}
                                      onChange={(event) =>
                                        update(
                                          item.client_id,
                                          "page_id",
                                          event.target.value ? Number(event.target.value) : null,
                                        )
                                      }
                                      className={`${adminInputClass} pl-10`}
                                    >
                                      <option value="">Choose content</option>
                                      {groupedTargets.map((group) =>
                                        group.items.length ? (
                                          <optgroup key={group.type} label={group.label}>
                                            {group.items.map((target) => (
                                              <option key={target.id} value={target.id}>
                                                {target.title} ({contentPath(target)})
                                              </option>
                                            ))}
                                          </optgroup>
                                        ) : null,
                                      )}
                                    </select>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div>
                              <FieldLabel>Parent item</FieldLabel>
                              <select
                                value={item.parent_client_id}
                                onChange={(event) =>
                                  update(item.client_id, "parent_client_id", event.target.value)
                                }
                                className={adminInputClass}
                              >
                                <option value="">No parent — top level</option>
                                {availableParents.map((parent) => (
                                  <option key={parent.client_id} value={parent.client_id}>
                                    {"— ".repeat(
                                      Math.min(getDepth(items, parent.client_id) + 1, 4),
                                    )}
                                    {parent.label || "Untitled item"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {isRoot ? (
                            <div>
                              <FieldLabel>Desktop presentation</FieldLabel>
                              <select
                                value={item.menu_style || "link"}
                                onChange={(event) =>
                                  update(
                                    item.client_id,
                                    "menu_style",
                                    event.target.value as EditableMenuItem["menu_style"],
                                  )
                                }
                                className={adminInputClass}
                              >
                                <option value="link">Standard link / automatic dropdown</option>
                                <option value="dropdown">Compact dropdown</option>
                                <option value="mega">Full-width mega menu</option>
                              </select>
                            </div>
                          ) : megaRoot ? (
                            <div>
                              <FieldLabel>Mega-menu column</FieldLabel>
                              <select
                                value={item.column_number || 1}
                                onChange={(event) =>
                                  update(
                                    item.client_id,
                                    "column_number",
                                    Number(event.target.value),
                                  )
                                }
                                className={adminInputClass}
                              >
                                {Array.from(
                                  { length: Math.min(5, Math.max(2, Number(maxColumns))) },
                                  (_, column) => (
                                    <option key={column + 1} value={column + 1}>
                                      Column {column + 1}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>
                          ) : null}

                          <div className="lg:col-span-2">
                            <FieldLabel>Description</FieldLabel>
                            <input
                              value={item.description || ""}
                              onChange={(event) =>
                                update(item.client_id, "description", event.target.value)
                              }
                              className={adminInputClass}
                              placeholder="Optional short description shown in dropdowns and mega menus"
                            />
                          </div>
                          <div>
                            <FieldLabel>Badge text</FieldLabel>
                            <input
                              value={item.badge_text || ""}
                              onChange={(event) =>
                                update(item.client_id, "badge_text", event.target.value)
                              }
                              className={adminInputClass}
                              placeholder="New, Popular, Beta…"
                            />
                          </div>
                          <ImageUrlField
                            label="Icon URL"
                            value={item.icon_url || ""}
                            uploadKey={`${item.client_id}-icon_url`}
                            uploadingKey={uploadingKey}
                            onChange={(value) => update(item.client_id, "icon_url", value)}
                            onUpload={(file) =>
                              void uploadForItem(item.client_id, "icon_url", file)
                            }
                          />
                          <div className="lg:col-span-2">
                            <ImageUrlField
                              label="Optional card image"
                              value={item.image_url || ""}
                              uploadKey={`${item.client_id}-image_url`}
                              uploadingKey={uploadingKey}
                              onChange={(value) => update(item.client_id, "image_url", value)}
                              onUpload={(file) =>
                                void uploadForItem(item.client_id, "image_url", file)
                              }
                            />
                          </div>

                          <div className="grid gap-3 lg:col-span-2 sm:grid-cols-2 xl:grid-cols-4">
                            <MenuToggle
                              checked={toBoolean(item.target_blank)}
                              label="Open in new tab"
                              onChange={(value) => update(item.client_id, "target_blank", value)}
                            />
                            <MenuToggle
                              checked={toBoolean(item.coming_soon)}
                              label="Coming Soon"
                              help="Disables the link"
                              onChange={(value) => update(item.client_id, "coming_soon", value)}
                            />
                            <MenuToggle
                              checked={toBoolean(item.hide_desktop)}
                              label="Hide on desktop"
                              onChange={(value) => update(item.client_id, "hide_desktop", value)}
                            />
                            <MenuToggle
                              checked={toBoolean(item.hide_mobile)}
                              label="Hide on mobile"
                              onChange={(value) => update(item.client_id, "hide_mobile", value)}
                            />
                          </div>
                        </div>

                        {isMegaRoot ? (
                          <div className="mt-5 rounded-2xl border border-brand-red/15 bg-white p-4">
                            <div className="mb-4 flex items-center gap-2">
                              <LayoutGrid className="h-4 w-4 text-brand-red" />
                              <h3 className="text-sm font-semibold text-ink">
                                Mega-menu settings
                              </h3>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <FieldLabel>Number of content columns</FieldLabel>
                                <select
                                  value={item.mega_columns || 3}
                                  onChange={(event) =>
                                    update(
                                      item.client_id,
                                      "mega_columns",
                                      Number(event.target.value),
                                    )
                                  }
                                  className={adminInputClass}
                                >
                                  {[2, 3, 4, 5].map((column) => (
                                    <option key={column} value={column}>
                                      {column} columns
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-end">
                                <MenuToggle
                                  checked={toBoolean(item.mega_promo_enabled)}
                                  label="Show featured promo card"
                                  onChange={(value) =>
                                    update(item.client_id, "mega_promo_enabled", value)
                                  }
                                />
                              </div>
                              {item.mega_promo_enabled ? (
                                <>
                                  <div>
                                    <FieldLabel>Promo eyebrow</FieldLabel>
                                    <input
                                      value={item.mega_promo_eyebrow || ""}
                                      onChange={(event) =>
                                        update(
                                          item.client_id,
                                          "mega_promo_eyebrow",
                                          event.target.value,
                                        )
                                      }
                                      className={adminInputClass}
                                      placeholder="Featured"
                                    />
                                  </div>
                                  <div>
                                    <FieldLabel>Promo title</FieldLabel>
                                    <input
                                      value={item.mega_promo_title || ""}
                                      onChange={(event) =>
                                        update(
                                          item.client_id,
                                          "mega_promo_title",
                                          event.target.value,
                                        )
                                      }
                                      className={adminInputClass}
                                      placeholder="Start a project with our senior team"
                                    />
                                  </div>
                                  <div className="lg:col-span-2">
                                    <FieldLabel>Promo description</FieldLabel>
                                    <textarea
                                      value={item.mega_promo_description || ""}
                                      onChange={(event) =>
                                        update(
                                          item.client_id,
                                          "mega_promo_description",
                                          event.target.value,
                                        )
                                      }
                                      className={`${adminInputClass} min-h-24`}
                                      placeholder="Short supporting copy"
                                    />
                                  </div>
                                  <div>
                                    <FieldLabel>Button label</FieldLabel>
                                    <input
                                      value={item.mega_promo_button_label || ""}
                                      onChange={(event) =>
                                        update(
                                          item.client_id,
                                          "mega_promo_button_label",
                                          event.target.value,
                                        )
                                      }
                                      className={adminInputClass}
                                      placeholder="Book a Strategy Call"
                                    />
                                  </div>
                                  <div>
                                    <FieldLabel>Button URL</FieldLabel>
                                    <input
                                      value={item.mega_promo_button_url || ""}
                                      onChange={(event) =>
                                        update(
                                          item.client_id,
                                          "mega_promo_button_url",
                                          event.target.value,
                                        )
                                      }
                                      className={adminInputClass}
                                      placeholder="/book-a-call"
                                    />
                                  </div>
                                  <ImageUrlField
                                    label="Promo background image"
                                    value={item.mega_promo_image || ""}
                                    uploadKey={`${item.client_id}-mega_promo_image`}
                                    uploadingKey={uploadingKey}
                                    onChange={(value) =>
                                      update(item.client_id, "mega_promo_image", value)
                                    }
                                    onUpload={(file) =>
                                      void uploadForItem(item.client_id, "mega_promo_image", file)
                                    }
                                  />
                                  <div className="flex items-end">
                                    <MenuToggle
                                      checked={toBoolean(item.mega_promo_new_tab)}
                                      label="Promo opens in new tab"
                                      onChange={(value) =>
                                        update(item.client_id, "mega_promo_new_tab", value)
                                      }
                                    />
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </AdminCard>

            <AdminCard className="p-5">
              <div className="flex items-start gap-3">
                <ListTree className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                <div>
                  <h3 className="font-semibold text-ink">How mega-menu hierarchy works</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Set a top-level item to <strong>Mega menu</strong>. Add group headings under it,
                    assign each group to a column, then add clickable links under those groups. The
                    frontend now renders this structure dynamically on desktop and mobile.
                  </p>
                </div>
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function ImageUrlField({
  label,
  value,
  uploadKey,
  uploadingKey,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  uploadKey: string;
  uploadingKey: string | null;
  onChange: (value: string) => void;
  onUpload: (file?: File) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={adminInputClass}
          placeholder="https://…"
        />
        <label className="inline-flex h-[46px] shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-brand-red/30 hover:text-brand-red">
          <ImagePlus className="h-4 w-4" />
          {uploadingKey === uploadKey ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*,.svg,.ico"
            className="hidden"
            disabled={uploadingKey === uploadKey}
            onChange={(event) => {
              onUpload(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

function MenuToggle({
  checked,
  label,
  help,
  onChange,
}: {
  checked: boolean;
  label: string;
  help?: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${checked ? "border-brand-red/30 bg-brand-red/[0.04]" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${checked ? "border-brand-red bg-brand-red text-white" : "border-slate-300 bg-white text-transparent"}`}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-slate-700">{label}</span>
        {help ? <span className="block text-[10px] text-slate-400">{help}</span> : null}
      </span>
    </button>
  );
}

function normalizeMenuItems(items: MenuItem[]): EditableMenuItem[] {
  const clientById = new Map<number, string>();
  for (const item of items) {
    if (item.id) clientById.set(Number(item.id), `db-${item.id}`);
  }

  return items.map((item, index) => ({
    ...item,
    client_id: item.id ? clientById.get(Number(item.id)) || createClientId() : createClientId(),
    parent_client_id: item.parent_id ? clientById.get(Number(item.parent_id)) || "" : "",
    is_external: toBoolean(item.is_external),
    target_blank: toBoolean(item.target_blank),
    coming_soon: toBoolean(item.coming_soon),
    is_heading: toBoolean(item.is_heading),
    hide_desktop: toBoolean(item.hide_desktop),
    hide_mobile: toBoolean(item.hide_mobile),
    mega_promo_enabled: toBoolean(item.mega_promo_enabled),
    mega_promo_new_tab: toBoolean(item.mega_promo_new_tab),
    menu_style:
      item.menu_style === "mega" || item.menu_style === "dropdown" ? item.menu_style : "link",
    column_number: clampNumber(item.column_number, 1, 1, 5),
    mega_columns: clampNumber(item.mega_columns, 3, 2, 5),
    sort_order: index,
  }));
}

function createEmptyItem(
  sortOrder: number,
  parentClientId = "",
  overrides: Partial<EditableMenuItem> = {},
): EditableMenuItem {
  return {
    client_id: createClientId(),
    parent_client_id: parentClientId,
    label: "",
    page_id: null,
    external_url: "",
    is_external: false,
    target_blank: false,
    coming_soon: false,
    description: "",
    badge_text: "",
    icon_url: "",
    image_url: "",
    menu_style: "link",
    column_number: 1,
    is_heading: false,
    hide_desktop: false,
    hide_mobile: false,
    mega_columns: 3,
    mega_promo_enabled: false,
    mega_promo_eyebrow: "Featured",
    mega_promo_title: "",
    mega_promo_description: "",
    mega_promo_button_label: "",
    mega_promo_button_url: "",
    mega_promo_image: "",
    mega_promo_new_tab: false,
    sort_order: sortOrder,
    ...overrides,
  };
}

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `menu-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDepth(items: EditableMenuItem[], clientId: string) {
  const byId = new Map(items.map((item) => [item.client_id, item]));
  let depth = 0;
  let current = byId.get(clientId);
  const visited = new Set<string>();
  while (current?.parent_client_id && !visited.has(current.parent_client_id) && depth < 8) {
    visited.add(current.parent_client_id);
    depth += 1;
    current = byId.get(current.parent_client_id);
  }
  return depth;
}

function findMegaRoot(items: EditableMenuItem[], clientId: string) {
  const byId = new Map(items.map((item) => [item.client_id, item]));
  let current = byId.get(clientId);
  const visited = new Set<string>();
  while (current && !visited.has(current.client_id)) {
    visited.add(current.client_id);
    if (!current.parent_client_id) return current.menu_style === "mega" ? current : null;
    current = byId.get(current.parent_client_id);
  }
  return null;
}

function isDescendant(items: EditableMenuItem[], possibleDescendantId: string, ancestorId: string) {
  const byId = new Map(items.map((item) => [item.client_id, item]));
  let current = byId.get(possibleDescendantId);
  const visited = new Set<string>();
  while (current?.parent_client_id && !visited.has(current.parent_client_id)) {
    if (current.parent_client_id === ancestorId) return true;
    visited.add(current.parent_client_id);
    current = byId.get(current.parent_client_id);
  }
  return false;
}

function toBoolean(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function contentPath(item: ContentItem) {
  const slug = item.slug.replace(/^\/+/, "");
  if (item.content_type === "page") return slug === "home" ? "/" : `/${slug}`;
  if (item.content_type === "service") return `/services/${slug}`;
  if (item.content_type === "case_study") return `/work/${slug}`;
  if (item.content_type === "portfolio") return `/portfolio/${slug}`;
  if (item.content_type === "insight") return `/insights/${slug}`;
  if (item.content_type === "career") return `/careers#${slug}`;
  return `/${slug}`;
}
