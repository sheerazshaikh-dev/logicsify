import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { listAuditLogs, type AuditLog } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/audit-logs")({ component: AuditLogsPage });

function AuditLogsPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAuditLogs({ search });
      setItems(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="Review administrator logins, content changes, deletions, restorations and settings activity."
      />
      <AdminCard>
        <div className="border-b border-slate-200 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchInput.trim());
            }}
            className="flex max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className={`${adminInputClass} pl-10`}
                placeholder="Search action, entity, administrator…"
              />
            </div>
            <AdminButton type="submit" variant="secondary">
              Search
            </AdminButton>
          </form>
        </div>
        {loading ? (
          <AdminLoading label="Loading audit logs…" />
        ) : !items.length ? (
          <EmptyState
            title="No audit activity found"
            description="Administrative changes will be recorded here automatically."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">Administrator</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Entity</th>
                  <th className="px-5 py-4">Details</th>
                  <th className="px-5 py-4">IP</th>
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-5 py-4 text-sm font-semibold text-[#190A2F]">
                      {item.administrator_name || "System"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
                        {item.action.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.entity_type}
                      {item.entity_id ? ` #${item.entity_id}` : ""}
                    </td>
                    <td className="max-w-sm px-5 py-4 text-xs text-slate-400">
                      <span className="line-clamp-2">{formatDetails(item.details_json)}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{item.ip_address || "—"}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(item.created_at.replace(" ", "T")).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}

function formatDetails(details: AuditLog["details_json"]) {
  if (!details) return "—";
  if (typeof details === "string") return details;
  try {
    return JSON.stringify(details);
  } catch {
    return "—";
  }
}
