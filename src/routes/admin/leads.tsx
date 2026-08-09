import { createFileRoute } from "@tanstack/react-router";
import { Building2, Globe2, Mail, Phone, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  StatusBadge,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import { deleteLead, listLeads, updateLead, type Lead } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listLeads({ status, search });
      setItems(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(item: Lead) {
    if (!window.confirm(`Move ${item.name}'s submission to the recycle bin?`)) return;
    try {
      await deleteLead(item.id);
      toast.success("Lead moved to the recycle bin.");
      if (selected?.id === item.id) setSelected(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete lead.");
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Submissions"
        title="Leads"
        description="Review contact-form inquiries, qualification status, project requirements and internal follow-up notes."
      />
      <AdminCard>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchInput.trim());
            }}
            className="flex w-full max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className={`${adminInputClass} pl-10`}
                placeholder="Search name, email, company or service…"
              />
            </div>
            <AdminButton type="submit" variant="secondary">
              Search
            </AdminButton>
          </form>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={`${adminInputClass} w-full lg:w-48`}
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="spam">Spam</option>
          </select>
        </div>

        {loading ? (
          <AdminLoading label="Loading leads…" />
        ) : !items.length ? (
          <EmptyState
            title="No leads yet"
            description="New contact-form submissions will appear here automatically."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Budget</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Received</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(item)} className="text-left">
                        <p className="text-sm font-semibold text-ink hover:text-brand-red">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{item.email}</p>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.company || "—"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.service || "General"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.budget || "—"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {item.created_at
                        ? new Date(item.created_at.replace(" ", "T")).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <AdminButton variant="secondary" onClick={() => setSelected(item)}>
                          Open
                        </AdminButton>
                        <button
                          onClick={() => void remove(item)}
                          className="rounded-xl p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <LeadEditor
        lead={selected}
        onClose={() => setSelected(null)}
        onSaved={async () => {
          setSelected(null);
          await load();
        }}
      />
    </AdminShell>
  );
}

function LeadEditor({
  lead,
  onClose,
  onSaved,
}: {
  lead: Lead | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [status, setStatus] = useState<Lead["status"]>("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setNotes(lead.notes || "");
    }
  }, [lead]);

  async function save() {
    if (!lead) return;
    setSaving(true);
    try {
      await updateLead(lead.id, { status, notes });
      toast.success("Lead updated.");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      open={Boolean(lead)}
      onClose={onClose}
      title={lead?.name || "Lead"}
      description="Project inquiry and internal qualification notes."
      width="max-w-4xl"
    >
      {lead ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <AdminCard className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-ink">Contact details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
                <Info
                  icon={Phone}
                  label="Phone"
                  value={lead.phone || "Not provided"}
                  href={lead.phone ? `tel:${lead.phone}` : undefined}
                />
                <Info icon={Building2} label="Company" value={lead.company || "Not provided"} />
                <Info
                  icon={Globe2}
                  label="Website"
                  value={lead.website || "Not provided"}
                  href={lead.website || undefined}
                />
              </div>
            </AdminCard>
            <AdminCard className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-ink">Project requirements</h3>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Service
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {lead.service || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Budget
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {lead.budget || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Timeline
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {lead.timeline || "—"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                {lead.description || "No project description provided."}
              </div>
              {lead.source ? (
                <p className="mt-3 text-xs text-slate-400">Source: {lead.source}</p>
              ) : null}
            </AdminCard>
          </div>
          <AdminCard className="h-fit p-5">
            <h3 className="mb-5 text-sm font-semibold text-ink">Lead management</h3>
            <div>
              <FieldLabel>Status</FieldLabel>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as Lead["status"])}
                className={adminInputClass}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="spam">Spam</option>
              </select>
            </div>
            <div className="mt-5">
              <FieldLabel>Internal notes</FieldLabel>
              <textarea
                rows={10}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={adminTextareaClass}
                placeholder="Add follow-up notes, qualification details or next actions…"
              />
            </div>
            <AdminButton onClick={() => void save()} disabled={saving} className="mt-5 w-full">
              {saving ? "Saving…" : "Save lead"}
            </AdminButton>
          </AdminCard>
        </div>
      ) : null}
    </AdminModal>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
        <span className="mt-1 block truncate text-sm font-semibold text-ink">{value}</span>
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 hover:border-brand-red/30"
    >
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">{content}</div>
  );
}
