import { createFileRoute } from "@tanstack/react-router";
import { adminHref } from "@/lib/admin-path";
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  Images,
  Inbox,
  Loader2,
  Plus,
  Recycle,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminButton,
  AdminCard,
  AdminLoading,
  AdminPageHeader,
  StatusBadge,
} from "@/components/admin/admin-ui";
import { getDashboard, type DashboardResponse } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Could not load the dashboard."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Logicsify CMS"
        title="Dashboard"
        description="Manage website content, incoming leads, strategy calls and operational settings from one place."
        actions={
          <a href={adminHref("pages")}>
            <AdminButton>
              <Plus className="h-4 w-4" /> Create content
            </AdminButton>
          </a>
        }
      />
      {loading || !data ? (
        <AdminLoading label="Loading dashboard…" />
      ) : (
        <DashboardContent data={data} />
      )}
    </AdminShell>
  );
}

function DashboardContent({ data }: { data: DashboardResponse }) {
  const contentTotal = Object.values(data.summary.content).reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const cards = [
    {
      label: "Content items",
      value: contentTotal,
      icon: FileText,
      to: "/admin/pages",
      note: "Pages, services and guides",
    },
    {
      label: "New leads",
      value: data.summary.new_leads,
      icon: Inbox,
      to: "/admin/leads",
      note: "Awaiting review or follow-up",
    },
    {
      label: "Upcoming calls",
      value: data.summary.upcoming_bookings,
      icon: CalendarDays,
      to: "/admin/bookings",
      note: "Pending and confirmed bookings",
    },
    {
      label: "Media files",
      value: data.summary.media,
      icon: Images,
      to: "/admin/media",
      note: "Images and downloadable assets",
    },
    {
      label: "Recycle bin",
      value: data.summary.trash,
      icon: Recycle,
      to: "/admin/trash",
      note: "Recoverable deleted records",
    },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.label}
              href={adminHref(card.to.replace(/^\/admin\//, ""))}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-ink transition group-hover:bg-gradient-brand group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-brand-red" />
              </div>
              <p className="mt-5 text-3xl font-semibold text-ink">{card.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{card.label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{card.note}</p>
            </a>
          );
        })}
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard>
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold text-ink">Content overview</h2>
              <p className="mt-1 text-xs text-slate-400">Publication status by content type</p>
            </div>
            <Sparkles className="h-5 w-5 text-brand-red" />
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(data.summary.content).map(([type, values]) => (
              <div
                key={type}
                className="grid grid-cols-[1fr_repeat(4,minmax(56px,auto))] items-center gap-3 px-5 py-4 text-sm"
              >
                <div>
                  <p className="font-semibold capitalize text-ink">
                    {type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{values.total} total</p>
                </div>
                <Metric label="Published" value={values.published} />
                <Metric label="Draft" value={values.draft} />
                <Metric label="Scheduled" value={values.scheduled} />
                <Metric label="Archived" value={values.archived} />
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold text-ink">Recent leads</h2>
              <p className="mt-1 text-xs text-slate-400">Latest contact-form submissions</p>
            </div>
            <a href={adminHref("leads")} className="text-xs font-semibold text-brand-red">
              View all
            </a>
          </div>
          {!data.recent_leads.length ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No leads have been submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recent_leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{lead.name}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {lead.email} · {lead.service || "General inquiry"}
                    </p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      <AdminCard>
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="font-semibold text-ink">Upcoming strategy calls</h2>
            <p className="mt-1 text-xs text-slate-400">
              Latest booking requests and confirmed sessions
            </p>
          </div>
          <a href={adminHref("bookings")} className="text-xs font-semibold text-brand-red">
            Manage calendar
          </a>
        </div>
        {!data.recent_bookings.length ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No strategy calls have been booked yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-ink">{booking.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{booking.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{booking.meeting_date}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{booking.start_time}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[10px] text-slate-400">{label}</p>
    </div>
  );
}
