import { createFileRoute } from "@tanstack/react-router";
import { ArchiveRestore, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminButton,
  AdminCard,
  AdminLoading,
  AdminPageHeader,
  EmptyState,
  adminInputClass,
} from "@/components/admin/admin-ui";
import {
  listTrash,
  permanentlyDeleteTrashItem,
  restoreTrashItem,
  type TrashItem,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/trash")({ component: TrashPage });

function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listTrash());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the recycle bin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return items;
    return items.filter((item) =>
      `${item.title} ${item.subtitle || ""} ${item.entity_type}`.toLowerCase().includes(query),
    );
  }, [items, search]);

  async function restore(item: TrashItem) {
    try {
      await restoreTrashItem(item);
      toast.success("Item restored.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not restore item.");
    }
  }

  async function permanentlyDelete(item: TrashItem) {
    if (!window.confirm(`Permanently delete “${item.title}”? This cannot be undone.`)) return;
    const verification = window.prompt("Type DELETE to confirm permanent deletion.");
    if (verification !== "DELETE") return;
    try {
      await permanentlyDeleteTrashItem(item);
      toast.success("Item permanently deleted.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not permanently delete item.");
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Recovery"
        title="Recycle Bin"
        description="Restore deleted content, leads, bookings and media. Permanent deletion is restricted to Super Admins."
      />
      <AdminCard>
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={`${adminInputClass} pl-10`}
              placeholder="Search deleted items…"
            />
          </div>
        </div>
        {loading ? (
          <AdminLoading label="Loading recycle bin…" />
        ) : !filtered.length ? (
          <EmptyState
            title="Recycle bin is empty"
            description="Deleted records stay recoverable here until a Super Admin removes them permanently."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={`${item.entity_type}-${item.id}`}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      {item.entity_type}
                    </span>
                    <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  </div>
                  <p className="mt-2 truncate text-xs text-slate-400">
                    {item.subtitle || "No additional information"} · Deleted{" "}
                    {new Date(item.deleted_at.replace(" ", "T")).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <AdminButton variant="secondary" onClick={() => void restore(item)}>
                    <ArchiveRestore className="h-4 w-4" /> Restore
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => void permanentlyDelete(item)}>
                    <Trash2 className="h-4 w-4" /> Delete permanently
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}
