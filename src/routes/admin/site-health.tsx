import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  ExternalLink,
  FileJson,
  FileWarning,
  ImageOff,
  Link2Off,
  Loader2,
  Play,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AdminButton,
  AdminCard,
  AdminLoading,
  AdminPageHeader,
  EmptyState,
} from "@/components/admin/admin-ui";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getSiteHealthReport,
  runSiteHealthScan,
  type SiteHealthIssue,
  type SiteHealthReport,
  type SiteHealthReportResponse,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/site-health")({ component: SiteHealthPage });

type SeverityFilter = "all" | "critical" | "warning";

function dateTime(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function reportDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function issueIcon(issue: SiteHealthIssue) {
  if (issue.type.includes("image") || issue.type.includes("media")) return ImageOff;
  if (issue.type.includes("link") || issue.type.includes("route")) return Link2Off;
  if (issue.type.includes("placeholder")) return FileWarning;
  return CircleAlert;
}

function summaryTone(status?: string) {
  if (status === "healthy") return "border-emerald-200 bg-emerald-50/70 text-emerald-800";
  if (status === "warnings") return "border-amber-200 bg-amber-50/70 text-amber-800";
  return "border-red-200 bg-red-50/70 text-red-800";
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportReport(report: SiteHealthReport, format: "json" | "csv") {
  const stamp = reportDate(report.completed_at) || report.scan_id;
  if (format === "json") {
    downloadBlob(
      `logicsify-site-health-${stamp}-${report.scan_id}.json`,
      JSON.stringify(report, null, 2),
      "application/json;charset=utf-8",
    );
    return;
  }
  const headers = [
    "severity",
    "type",
    "message",
    "source",
    "source_url",
    "target",
    "final_url",
    "http_status",
    "field",
    "snippet",
    "detail",
  ];
  const rows = report.issues.map((issue) =>
    headers.map((key) => csvCell((issue as unknown as Record<string, unknown>)[key])).join(","),
  );
  downloadBlob(
    `logicsify-site-health-${stamp}-${report.scan_id}.csv`,
    [headers.join(","), ...rows].join("\n"),
    "text/csv;charset=utf-8",
  );
}

function SiteHealthPage() {
  const [data, setData] = useState<SiteHealthReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [selectedScanId, setSelectedScanId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  async function load(options: { scanId?: string; date?: string } = {}) {
    try {
      const response = await getSiteHealthReport(options);
      if ((options.scanId || options.date) && !response.report) {
        toast.warning(options.date ? `No Site Health scan was found for ${options.date}.` : "That scan report is no longer available.");
        setData((current) => current ? { ...current, history: response.history } : response);
        return;
      }
      setData(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the Site Health report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function chooseScan(scanId: string) {
    setSelectedScanId(scanId);
    setSelectedDate("");
    if (!scanId) {
      await load();
      return;
    }
    await load({ scanId });
  }

  async function chooseDate(date: string) {
    setSelectedDate(date);
    setSelectedScanId("");
    if (!date) {
      await load();
      return;
    }
    await load({ date });
  }

  async function runNow() {
    if (running) return;
    setRunning(true);
    toast.info("Site Health scan started. It can take a few minutes on a large site.");
    try {
      const report = await runSiteHealthScan();
      setSelectedScanId("");
      setSelectedDate("");
      setData((current) => ({
        report,
        history: [
          {
            scan_id: report.scan_id,
            started_at: report.started_at,
            completed_at: report.completed_at,
            summary: report.summary,
          },
          ...(current?.history || []).filter((entry) => entry.scan_id !== report.scan_id),
        ].slice(0, 90),
        selected: { scan_id: report.scan_id, date: null },
        cron: current?.cron || {
          recommended_schedule: "15 3 * * *",
          script: "cron/site-health-scan.php",
          example:
            "php -q /home/CPANEL_USERNAME/backend.logicsify.com/cron/site-health-scan.php >/dev/null 2>&1",
        },
      }));
      if (report.summary.critical > 0) {
        toast.error(`Scan completed with ${report.summary.critical} confirmed critical issue${report.summary.critical === 1 ? "" : "s"}.`);
      } else if (report.summary.warnings > 0) {
        toast.warning(`Scan completed with ${report.summary.warnings} warning${report.summary.warnings === 1 ? "" : "s"}.`);
      } else {
        toast.success("Scan completed. No broken or invalid public content was found.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Site Health scan failed.");
    } finally {
      setRunning(false);
    }
  }

  const report = data?.report || null;
  const filteredIssues = useMemo(() => {
    const issues = report?.issues || [];
    if (filter === "all") return issues;
    return issues.filter((issue) => issue.severity === filter);
  }, [filter, report]);

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Automated QA"
        title="Site Health"
        description="Daily checks for confirmed 404s, broken images, invalid media responses, sitemap gaps, and placeholder content. Scanner-only blocks and uncertain probes are warnings instead of false critical failures."
        actions={
          <>
            <AdminButton variant="secondary" onClick={() => void load()} disabled={loading || running}>
              <RefreshCcw className="h-4 w-4" /> Latest report
            </AdminButton>
            {report ? (
              <AdminButton variant="secondary" onClick={() => exportReport(report, "json")}>
                <FileJson className="h-4 w-4" /> Export JSON
              </AdminButton>
            ) : null}
            {report ? (
              <AdminButton variant="secondary" onClick={() => exportReport(report, "csv")}>
                <Download className="h-4 w-4" /> Export CSV
              </AdminButton>
            ) : null}
            <AdminButton onClick={() => void runNow()} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Scanning…" : "Run Scan Now"}
            </AdminButton>
          </>
        }
      />

      <AdminCard className="mb-5 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <Clock3 className="h-3.5 w-3.5" /> Previous scan
            </span>
            <select
              className="form-input"
              value={selectedScanId}
              onChange={(event) => void chooseScan(event.target.value)}
            >
              <option value="">Latest scan</option>
              {(data?.history || []).map((entry) => (
                <option key={entry.scan_id} value={entry.scan_id}>
                  {dateTime(entry.completed_at)} — {entry.summary.critical || 0} critical / {entry.summary.warnings || 0} warnings
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" /> Check a day
            </span>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => void chooseDate(event.target.value)}
            />
          </label>
          <AdminButton
            variant="secondary"
            onClick={() => {
              setSelectedDate("");
              setSelectedScanId("");
              void load();
            }}
          >
            Show latest
          </AdminButton>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Up to 120 scan reports are retained on the backend. Use the date picker for yesterday or an older day, or choose a specific scan when more than one scan ran that day.
        </p>
      </AdminCard>

      {loading ? (
        <AdminCard>
          <AdminLoading label="Loading Site Health…" />
        </AdminCard>
      ) : !report ? (
        <AdminCard>
          <EmptyState
            title="No Site Health scan yet"
            description="Run the first scan now, then add the included cPanel cron command once so the same audit runs automatically every day."
            action={
              <AdminButton onClick={() => void runNow()} disabled={running}>
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
                Run first scan
              </AdminButton>
            }
          />
        </AdminCard>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminCard className={`p-5 ${summaryTone(report.summary.status)}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-65">Overall status</p>
                  <p className="mt-2 text-2xl font-semibold capitalize">{report.summary.status}</p>
                </div>
                {report.summary.status === "healthy" ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
              </div>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Confirmed critical</p>
              <p className="mt-2 text-3xl font-semibold text-red-700">{report.summary.critical}</p>
              <p className="mt-1 text-xs text-slate-500">Explicit 404/410s, missing files and invalid image responses</p>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Warnings</p>
              <p className="mt-2 text-3xl font-semibold text-amber-700">{report.summary.warnings}</p>
              <p className="mt-1 text-xs text-slate-500">Placeholder text, redirects, access challenges and uncertain probes</p>
            </AdminCard>
            <AdminCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Selected scan</p>
              <p className="mt-2 text-sm font-semibold text-ink">{dateTime(report.completed_at)}</p>
              <p className="mt-1 text-xs text-slate-500">{report.duration_seconds}s · {report.scan_id}</p>
            </AdminCard>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_.55fr]">
            <AdminCard className="overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-ink">Findings</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {report.summary.total_issues} finding{report.summary.total_issues === 1 ? "" : "s"} from scan {report.scan_id}
                    </p>
                  </div>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {(["all", "critical", "warning"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${filter === value ? "bg-ink text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="grid min-h-64 place-items-center p-8 text-center">
                  <div>
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                    <h3 className="mt-3 font-semibold text-ink">Nothing in this filter</h3>
                    <p className="mt-1 text-sm text-slate-500">No matching Site Health findings were recorded.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredIssues.map((issue, index) => {
                    const Icon = issueIcon(issue);
                    const targetIsImage = issue.type.includes("image") || issue.type.includes("media");
                    return (
                      <article key={`${issue.type}-${issue.target || issue.source || index}-${index}`} className="p-5">
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${issue.severity === "critical" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${issue.severity === "critical" ? "border-red-100 bg-red-50 text-red-700" : "border-amber-100 bg-amber-50 text-amber-700"}`}>
                                {issue.severity}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                                {issue.type.replaceAll("_", " ")}
                              </span>
                              {issue.http_status ? <span className="text-xs font-semibold text-slate-400">HTTP {issue.http_status}</span> : null}
                            </div>
                            <p className="mt-2 text-sm font-semibold text-ink">{issue.message}</p>
                            {issue.source ? <p className="mt-1 break-words text-xs text-slate-500">Source: {issue.source}</p> : null}
                            {issue.field ? <p className="mt-1 text-xs text-slate-500">Field: {issue.field}</p> : null}
                            {issue.snippet ? <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">{issue.snippet}</p> : null}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {issue.source_url ? (
                                <a href={issue.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-slate-50">
                                  Open source page <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : null}
                              {issue.target && issue.target !== issue.source_url ? (
                                <a href={issue.target} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 break-all rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-slate-50">
                                  {targetIsImage ? "Open image" : "Open target"} <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              ) : null}
                              {issue.final_url && issue.final_url !== issue.target ? (
                                <a href={issue.final_url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 break-all rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                  Open final URL <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              ) : null}
                            </div>
                            {issue.detail ? <p className="mt-2 text-xs text-red-600">{issue.detail}</p> : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </AdminCard>

            <div className="space-y-4">
              <AdminCard className="p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></span>
                  <div>
                    <h2 className="font-semibold text-ink">Daily cron</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">The scanner script runs daily and keeps historical reports for review/export.</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-100">
                  {data?.cron?.example || "php -q /home/CPANEL_USERNAME/backend.logicsify.com/cron/site-health-scan.php >/dev/null 2>&1"}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Recommended: daily at 3:15 AM</div>
                <p className="mt-3 text-xs leading-5 text-slate-500">Confirmed 404/410 responses remain critical. WAF challenges, rate limits and ambiguous server probes are warnings so a working browser URL is not falsely labelled broken.</p>
              </AdminCard>

              <AdminCard className="p-5">
                <h2 className="font-semibold text-ink">Coverage</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  {[
                    ["Pages", report.summary.pages_checked ?? report.summary.sitemap_pages_checked],
                    ["Links", report.summary.internal_links_checked],
                    ["Images", report.summary.images_checked],
                    ["CMS items", report.summary.content_items_scanned],
                    ["Menus", report.summary.menu_items_scanned],
                    ["Team", report.summary.team_members_scanned],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-lg font-semibold text-ink">{value}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </AdminCard>

              {data?.history?.length ? (
                <AdminCard className="overflow-hidden">
                  <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-ink">Recent scans</h2></div>
                  <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                    {data.history.slice(0, 30).map((entry) => (
                      <button
                        type="button"
                        key={entry.scan_id}
                        onClick={() => void chooseScan(entry.scan_id)}
                        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-xs transition hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-semibold text-slate-700">{dateTime(entry.completed_at)}</p>
                          <p className="mt-0.5 text-slate-400">{entry.scan_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-700">{entry.summary.critical || 0} critical</p>
                          <p className="mt-0.5 text-amber-700">{entry.summary.warnings || 0} warnings</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </AdminCard>
              ) : null}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
