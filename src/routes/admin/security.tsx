import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, Ban, CheckCircle2, ClipboardCopy, KeyRound, LockKeyhole,
  MailCheck, MonitorSmartphone, RefreshCw, Save, Search, ShieldCheck, Trash2, UserX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminButton, AdminCard, AdminLoading, AdminPageHeader, EmptyState, FieldLabel,
  adminInputClass, adminTextareaClass,
} from "@/components/admin/admin-ui";
import {
  clearAdminToken, disableTwoFactor, enableTwoFactor, getSecurityConfig, getSecurityOverview,
  listSecurityEvents, listSecuritySessions, purgeSecurityLogs, revokeOtherSecuritySessions,
  revokeSecuritySession, saveSecuritySettings, startTwoFactorSetup, testSecurityAlert,
  unlockAdministrator,
  type AuditLog, type SecurityOverview, type SecuritySession, type SecuritySettings,
} from "@/lib/admin-api";
import { adminHref } from "@/lib/admin-path";

export const Route = createFileRoute("/admin/security")({ component: SecurityPage });

type Tab = "overview" | "events" | "sessions" | "access" | "authentication" | "hardening";
const allTabs: Array<{ id: Tab; label: string; superOnly?: boolean }> = [
  { id: "overview", label: "Overview" }, { id: "events", label: "Security Logs" },
  { id: "sessions", label: "Sessions" }, { id: "access", label: "Admin URL & Access", superOnly: true },
  { id: "authentication", label: "Passwords & 2FA" }, { id: "hardening", label: "Hardening", superOnly: true },
];

export function SecurityPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [settings, setSettings] = useState<SecuritySettings>({});
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", severity: "", status: "" });
  const [twoFactor, setTwoFactor] = useState<{ secret?: string; uri?: string; recovery?: string[] }>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextOverview, nextSettings, nextSessions, nextEvents] = await Promise.all([
        getSecurityOverview(), getSecurityConfig(), listSecuritySessions(), listSecurityEvents({ perPage: 100 }),
      ]);
      setOverview(nextOverview); setSettings(nextSettings); setSessions(nextSessions); setEvents(nextEvents.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the Security center.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function loadEvents() {
    try {
      const result = await listSecurityEvents({ search, ...filters, perPage: 100 });
      setEvents(result.data);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load security logs."); }
  }

  async function save() {
    setSaving(true);
    try {
      const result = await saveSecuritySettings(settings);
      const nextBase = `/control/${result.settings.admin_slug || "logicsify-control-room"}`;
      setSettings((current) => ({ ...current, ...result.settings, admin_entry_path: `${nextBase}/login` }));
      toast.success("Security settings saved.");
      const currentBase = window.location.pathname.match(/^\/control\/[^/]+/)?.[0] || "/admin";
      if (currentBase !== nextBase && (currentBase.startsWith("/control/") || result.settings.legacy_admin_path_enabled === false)) {
        window.setTimeout(() => window.location.replace(`${nextBase}/security`), 450);
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save security settings."); }
    finally { setSaving(false); }
  }

  const entryUrl = useMemo(() => `${window.location.origin}${settings.admin_entry_path || `/control/${settings.admin_slug || "logicsify-control-room"}/login`}`, [settings]);
  const tabs = useMemo(() => allTabs.filter((item) => !item.superOnly || settings.is_super_admin), [settings.is_super_admin]);

  useEffect(() => {
    if (!tabs.some((item) => item.id === tab)) setTab("overview");
  }, [tab, tabs]);

  if (loading) return <AdminShell><AdminLoading label="Loading security controls…" /></AdminShell>;

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="Protection and accountability" title="Security" description="Review sensitive activity, control administrator access, revoke sessions, configure login protection and manage optional two-factor authentication." actions={<AdminButton variant="secondary" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</AdminButton>} />
      <div className="mb-6 flex flex-wrap gap-2">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${tab === item.id ? "bg-[#190A2F] text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{item.label}</button>)}</div>

      {tab === "overview" && overview ? <Overview overview={overview} events={overview.recent_events} refresh={() => void load()} /> : null}
      {tab === "events" ? <Events events={events} search={search} setSearch={setSearch} filters={filters} setFilters={setFilters} reload={() => void loadEvents()} /> : null}
      {tab === "sessions" ? <Sessions sessions={sessions} refresh={() => void load()} /> : null}
      {tab === "access" ? <AccessSettings settings={settings} setSettings={setSettings} entryUrl={entryUrl} save={save} saving={saving} /> : null}
      {tab === "authentication" ? <AuthenticationSettings settings={settings} setSettings={setSettings} twoFactor={twoFactor} setTwoFactor={setTwoFactor} save={save} saving={saving} refresh={() => void load()} /> : null}
      {tab === "hardening" ? <HardeningSettings settings={settings} setSettings={setSettings} save={save} saving={saving} /> : null}
    </AdminShell>
  );
}

function Overview({ overview, events, refresh }: { overview: SecurityOverview; events: AuditLog[]; refresh: () => void }) {
  const metrics = [
    ["Events in 24 hours", overview.summary.events_24h, Activity],
    ["Failed logins in 7 days", overview.summary.failed_logins_7d, AlertTriangle],
    ["Blocked events", overview.summary.blocked_events_7d, Ban],
    ["Active sessions", overview.summary.active_sessions, MonitorSmartphone],
    ["Locked administrators", overview.summary.locked_administrators, UserX],
    ["Administrators using 2FA", overview.summary.two_factor_enabled, KeyRound],
  ] as const;

  async function unlock(id: number) {
    try {
      await unlockAdministrator(id);
      toast.success("Administrator account unlocked.");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not unlock the administrator.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value, Icon]) => (
          <AdminCard key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-[#190A2F]">{value}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-[#190A2F]"><Icon className="h-5 w-5" /></span>
            </div>
          </AdminCard>
        ))}
      </div>

      {overview.locked_administrators?.length ? (
        <AdminCard>
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-[#190A2F]">Locked administrator accounts</h2>
            <p className="mt-1 text-sm text-slate-500">Review the security events first, then unlock only when the account owner has been verified.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {overview.locked_administrators.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#190A2F]">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.email} · {item.failed_login_count || 0} failed attempts · locked until {item.locked_until ? new Date(item.locked_until.replace(" ", "T")).toLocaleString() : "manual review"}</p>
                </div>
                <AdminButton variant="secondary" onClick={() => void unlock(item.id)}>Unlock account</AdminButton>
              </div>
            ))}
          </div>
        </AdminCard>
      ) : null}

      <AdminCard>
        <div className="border-b border-slate-200 p-5"><h2 className="font-semibold text-[#190A2F]">Recent security activity</h2></div>
        <EventTable events={events} />
      </AdminCard>
    </div>
  );
}

function Events({ events, search, setSearch, filters, setFilters, reload }: { events: AuditLog[]; search: string; setSearch: (v: string) => void; filters: { category: string; severity: string; status: string }; setFilters: Dispatch<SetStateAction<{ category: string; severity: string; status: string }>>; reload: () => void }) {
  function exportCsv() {
    const rows = [["Date","Administrator","Category","Severity","Status","Action","Entity","IP","Path","Request ID"], ...events.map((item) => [item.created_at,item.administrator_email || item.administrator_name || "System",item.category || "activity",item.severity || "info",item.status || "success",item.action,`${item.entity_type}${item.entity_id ? ` #${item.entity_id}` : ""}`,item.ip_address || "",item.request_path || "",item.request_id || ""])]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([rows], { type: "text/csv" })); const a = document.createElement("a"); a.href = url; a.download = `logicsify-security-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  return <AdminCard><div className="border-b border-slate-200 p-5"><div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto_auto]"><div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className={`${adminInputClass} pl-10`} placeholder="Search actions, IP, path, administrator…" /></div>{(["category","severity","status"] as const).map((key) => <select key={key} value={filters[key]} onChange={(e) => setFilters((current) => ({ ...current, [key]: e.target.value }))} className={adminInputClass}><option value="">All {key}</option>{(key === "category" ? ["activity","authentication","access","account","session","configuration","maintenance"] : key === "severity" ? ["info","warning","important","critical"] : ["success","failed","blocked","pending"]).map((value) => <option key={value} value={value}>{value}</option>)}</select>)}<AdminButton onClick={reload}>Filter</AdminButton><AdminButton variant="secondary" onClick={exportCsv}>Export CSV</AdminButton></div></div><EventTable events={events} /></AdminCard>;
}

function EventTable({ events }: { events: AuditLog[] }) {
  if (!events.length) return <EmptyState title="No security activity found" description="Sensitive administrator and authentication activity will appear here." />;
  return <div className="overflow-x-auto"><table className="w-full min-w-[1200px] text-left"><thead><tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400"><th className="px-5 py-4">Date</th><th className="px-5 py-4">Administrator</th><th className="px-5 py-4">Event</th><th className="px-5 py-4">Level</th><th className="px-5 py-4">Entity</th><th className="px-5 py-4">IP / Request</th><th className="px-5 py-4">Details</th></tr></thead><tbody>{events.map((item) => <tr key={item.id} className="border-b border-slate-100 align-top"><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{new Date(item.created_at.replace(" ","T")).toLocaleString()}</td><td className="px-5 py-4 text-sm font-semibold text-[#190A2F]">{item.administrator_name || "System"}<span className="block text-xs font-normal text-slate-400">{item.administrator_email}</span></td><td className="px-5 py-4"><p className="text-sm font-semibold capitalize text-[#190A2F]">{(item.message || item.action).replaceAll("_"," ")}</p><p className="mt-1 text-xs capitalize text-slate-400">{item.category || "activity"} · {item.status || "success"}</p></td><td className="px-5 py-4"><Severity severity={item.severity || "info"} /></td><td className="px-5 py-4 text-sm text-slate-500">{item.entity_type}{item.entity_id ? ` #${item.entity_id}` : ""}</td><td className="px-5 py-4 text-xs text-slate-500">{item.ip_address || "—"}<span className="mt-1 block max-w-[250px] truncate">{item.request_method} {item.request_path}</span><span className="block text-slate-300">{item.request_id}</span></td><td className="max-w-sm px-5 py-4 text-xs text-slate-500"><span className="line-clamp-3">{formatDetails(item.details_json)}</span></td></tr>)}</tbody></table></div>;
}

function Sessions({ sessions, refresh }: { sessions: SecuritySession[]; refresh: () => void }) {
  async function revoke(id: number) { try { const result = await revokeSecuritySession(id); toast.success("Session revoked."); if (result.current) { clearAdminToken(); window.location.replace(adminHref("login")); } else refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not revoke session."); } }
  async function revokeOthers() { try { const result = await revokeOtherSecuritySessions(); toast.success(`${result.revoked} other session(s) revoked.`); refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not revoke sessions."); } }
  return <AdminCard><div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h2 className="font-semibold text-[#190A2F]">Active administrator sessions</h2><p className="mt-1 text-sm text-slate-500">Revoke browsers or devices that should no longer have access.</p></div><AdminButton variant="secondary" onClick={() => void revokeOthers()}>Revoke my other sessions</AdminButton></div><div className="divide-y divide-slate-100">{sessions.map((session) => <div key={session.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"><span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100"><MonitorSmartphone className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="font-semibold text-[#190A2F]">{session.administrator_name} {session.current ? <span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700">Current</span> : null}</p><p className="mt-1 truncate text-xs text-slate-500">{session.user_agent || "Unknown device"}</p><p className="mt-1 text-xs text-slate-400">IP {session.ip_address || "—"} · Last used {session.last_used_at ? new Date(session.last_used_at.replace(" ","T")).toLocaleString() : "not recorded"} · Expires {new Date(session.expires_at.replace(" ","T")).toLocaleString()}</p></div><AdminButton variant="danger" onClick={() => void revoke(session.id)}><Trash2 className="h-4 w-4" /> Revoke</AdminButton></div>)}</div></AdminCard>;
}

function AccessSettings({ settings, setSettings, entryUrl, save, saving }: SecuritySettingsProps & { entryUrl: string }) {
  return <div className="space-y-6"><AdminCard className="p-6"><h2 className="text-lg font-semibold text-[#190A2F]">Custom admin entry URL</h2><p className="mt-2 text-sm leading-6 text-slate-500">Use this private entry link for the React admin. Changing the URL reduces automated scanning, but it does not replace strong passwords or 2FA.</p><div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]"><div><FieldLabel>Admin URL slug</FieldLabel><input value={settings.admin_slug || ""} onChange={(e) => setSettings((c) => ({ ...c, admin_slug: e.target.value }))} className={adminInputClass} placeholder="logicsify-control-room" /></div><div className="self-end"><AdminButton variant="secondary" onClick={() => { void navigator.clipboard.writeText(entryUrl).then(() => toast.success("Admin entry URL copied.")).catch(() => toast.error("Could not copy the URL.")); }}><ClipboardCopy className="h-4 w-4" /> Copy URL</AdminButton></div></div><div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-medium text-[#190A2F] break-all">{entryUrl}</div><Toggle label="Keep legacy /admin routes available" description="Leave enabled until the custom URL has been tested in a private browser. Disable afterward to block direct legacy entry." checked={Boolean(settings.legacy_admin_path_enabled)} onChange={(value) => setSettings((c) => ({ ...c, legacy_admin_path_enabled: value }))} /></AdminCard><AdminCard className="p-6"><h2 className="text-lg font-semibold text-[#190A2F]">IP access policy</h2><p className="mt-2 text-sm text-slate-500">One IP per line. An empty allowlist permits all IPs except the blocked list. Test carefully before saving an allowlist.</p><div className="mt-5 grid gap-5 md:grid-cols-2"><div><FieldLabel>Allowed administrator IPs</FieldLabel><textarea rows={7} value={settings.allowed_admin_ips || ""} onChange={(e) => setSettings((c) => ({ ...c, allowed_admin_ips: e.target.value }))} className={adminTextareaClass} placeholder="203.0.113.10" /></div><div><FieldLabel>Blocked administrator IPs</FieldLabel><textarea rows={7} value={settings.blocked_admin_ips || ""} onChange={(e) => setSettings((c) => ({ ...c, blocked_admin_ips: e.target.value }))} className={adminTextareaClass} placeholder="198.51.100.20" /></div></div></AdminCard>{settings.is_super_admin ? <SaveBar save={save} saving={saving} /> : null}</div>;
}

function AuthenticationSettings({ settings, setSettings, twoFactor, setTwoFactor, save, saving, refresh }: SecuritySettingsProps & { twoFactor: { secret?: string; uri?: string; recovery?: string[] }; setTwoFactor: Dispatch<SetStateAction<{ secret?: string; uri?: string; recovery?: string[] }>>; refresh: () => void }) {
  const [password, setPassword] = useState(""); const [code, setCode] = useState("");
  async function setup() { try { const result = await startTwoFactorSetup(password); setTwoFactor({ secret: result.secret, uri: result.otpauth_uri }); toast.success("Add the secret to your authenticator, then verify a code."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not start 2FA setup."); } }
  async function enable() { try { const result = await enableTwoFactor(code); setTwoFactor((c) => ({ ...c, recovery: result.recovery_codes })); setSettings((c) => ({ ...c, two_factor_enabled: true })); toast.success("Two-factor authentication enabled."); refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not enable 2FA."); } }
  async function disable() { try { await disableTwoFactor(password, code); setTwoFactor({}); setSettings((c) => ({ ...c, two_factor_enabled: false })); toast.success("Two-factor authentication disabled."); refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not disable 2FA."); } }
  return <div className="space-y-6"><AdminCard className="p-6"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#190A2F] text-white"><KeyRound className="h-5 w-5" /></span><div><h2 className="text-lg font-semibold text-[#190A2F]">Your two-factor authentication</h2><p className="mt-1 text-sm text-slate-500">Status: <strong>{settings.two_factor_enabled ? "Enabled" : "Not enabled"}</strong>. Compatible with standard TOTP authenticator apps.</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-2"><div><FieldLabel>Current password</FieldLabel><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={adminInputClass} /></div><div><FieldLabel>Authenticator or recovery code</FieldLabel><input value={code} onChange={(e) => setCode(e.target.value)} className={adminInputClass} placeholder="123456" /></div></div><div className="mt-4 flex flex-wrap gap-2">{!settings.two_factor_enabled ? <><AdminButton variant="secondary" onClick={() => void setup()}>Generate setup secret</AdminButton>{twoFactor.secret ? <AdminButton onClick={() => void enable()}>Verify and enable</AdminButton> : null}</> : <AdminButton variant="danger" onClick={() => void disable()}>Disable 2FA</AdminButton>}</div>{twoFactor.secret ? <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Manual authenticator secret</p><p className="mt-2 break-all font-mono text-sm text-[#190A2F]">{twoFactor.secret}</p><p className="mt-3 break-all text-xs text-slate-400">{twoFactor.uri}</p></div> : null}{twoFactor.recovery ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-900">Save these one-time recovery codes now.</p><div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">{twoFactor.recovery.map((item) => <span key={item}>{item}</span>)}</div></div> : null}</AdminCard>{settings.is_super_admin ? <><AdminCard className="p-6"><h2 className="text-lg font-semibold text-[#190A2F]">Login and password policy</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><NumberField label="Session timeout" value={settings.session_timeout_minutes} suffix="minutes" min={15} max={10080} onChange={(v) => setSettings((c) => ({ ...c, session_timeout_minutes: v }))} /><NumberField label="Failed attempts before lock" value={settings.max_login_attempts} suffix="attempts" min={3} max={20} onChange={(v) => setSettings((c) => ({ ...c, max_login_attempts: v }))} /><NumberField label="Account lockout" value={settings.lockout_minutes} suffix="minutes" min={5} max={1440} onChange={(v) => setSettings((c) => ({ ...c, lockout_minutes: v }))} /><NumberField label="Minimum password length" value={settings.minimum_password_length} suffix="characters" min={10} max={64} onChange={(v) => setSettings((c) => ({ ...c, minimum_password_length: v }))} /></div>{(["password_require_uppercase","password_require_lowercase","password_require_number","password_require_symbol"] as const).map((key) => <Toggle key={key} label={key.replace("password_require_", "Require ").replaceAll("_"," ")} checked={Boolean(settings[key])} onChange={(value) => setSettings((c) => ({ ...c, [key]: value }))} />)}</AdminCard><SaveBar save={save} saving={saving} /></> : null}</div>;
}

function HardeningSettings({ settings, setSettings, save, saving }: SecuritySettingsProps) {
  return <div className="space-y-6"><AdminCard className="p-6"><h2 className="text-lg font-semibold text-[#190A2F]">Transport and browser hardening</h2><Toggle label="Force HTTPS on backend requests" checked={Boolean(settings.force_https)} onChange={(v) => setSettings((c) => ({ ...c, force_https: v }))} /><Toggle label="Enable HTTP Strict Transport Security" checked={Boolean(settings.hsts_enabled)} onChange={(v) => setSettings((c) => ({ ...c, hsts_enabled: v }))} /><NumberField label="HSTS max age" value={settings.hsts_max_age} suffix="seconds" min={86400} max={63072000} onChange={(v) => setSettings((c) => ({ ...c, hsts_max_age: v }))} /><div className="mt-5 grid gap-5 md:grid-cols-2"><div><FieldLabel>Backend Content Security Policy</FieldLabel><select value={settings.backend_csp_mode || "strict"} onChange={(e) => setSettings((c) => ({ ...c, backend_csp_mode: e.target.value as SecuritySettings["backend_csp_mode"] }))} className={adminInputClass}><option value="strict">Strict enforcement</option><option value="report-only">Report only</option><option value="off">Off</option></select></div><div><FieldLabel>Frame policy</FieldLabel><select value={settings.frame_policy || "deny"} onChange={(e) => setSettings((c) => ({ ...c, frame_policy: e.target.value as SecuritySettings["frame_policy"] }))} className={adminInputClass}><option value="deny">Deny all framing</option><option value="sameorigin">Same origin only</option></select></div></div></AdminCard><AdminCard className="p-6"><h2 className="text-lg font-semibold text-[#190A2F]">Alerts and log retention</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><div><FieldLabel>Security alert email</FieldLabel><input type="email" value={settings.security_alert_email || ""} onChange={(e) => setSettings((c) => ({ ...c, security_alert_email: e.target.value }))} className={adminInputClass} placeholder="security@logicsify.com" /></div><NumberField label="Audit retention" value={settings.audit_retention_days} suffix="days" min={30} max={3650} onChange={(v) => setSettings((c) => ({ ...c, audit_retention_days: v }))} /></div><Toggle label="Email on successful new login" checked={Boolean(settings.notify_new_login)} onChange={(v) => setSettings((c) => ({ ...c, notify_new_login: v }))} /><Toggle label="Email on failed login attempts" checked={Boolean(settings.notify_failed_logins)} onChange={(v) => setSettings((c) => ({ ...c, notify_failed_logins: v }))} /><div className="mt-5 flex flex-wrap gap-2"><AdminButton variant="secondary" onClick={() => void testSecurityAlert().then(() => toast.success("Security alert test requested.")).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "The request failed."))}><MailCheck className="h-4 w-4" /> Test alert</AdminButton><AdminButton variant="danger" onClick={() => { if (window.confirm("Delete security logs older than the configured retention period?")) void purgeSecurityLogs().then((r) => toast.success(`${r.deleted} old log(s) deleted.`)).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "The request failed.")); }}><Trash2 className="h-4 w-4" /> Purge expired logs</AdminButton></div></AdminCard>{settings.is_super_admin ? <SaveBar save={save} saving={saving} /> : null}</div>;
}

type SecuritySettingsProps = { settings: SecuritySettings; setSettings: Dispatch<SetStateAction<SecuritySettings>>; save: () => Promise<void>; saving: boolean };
function SaveBar({ save, saving }: { save: () => Promise<void>; saving: boolean }) { return <div className="flex justify-end"><AdminButton onClick={() => void save()} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save security settings"}</AdminButton></div>; }
function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="mt-5 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-4"><span><span className="block text-sm font-semibold capitalize text-[#190A2F]">{label}</span>{description ? <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span> : null}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[#FE3434]" /></label>; }
function NumberField({ label, value, min, max, suffix, onChange }: { label: string; value?: number; min: number; max: number; suffix: string; onChange: (value: number) => void }) { return <div><FieldLabel>{label}</FieldLabel><div className="relative"><input type="number" min={min} max={max} value={value ?? min} onChange={(e) => onChange(Number(e.target.value))} className={adminInputClass} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span></div></div>; }
function Severity({ severity }: { severity: string }) { const classes = severity === "critical" ? "bg-red-50 text-red-700" : severity === "warning" ? "bg-amber-50 text-amber-700" : severity === "important" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"; return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${classes}`}>{severity}</span>; }
function formatDetails(details: AuditLog["details_json"]) { if (!details) return "—"; if (typeof details === "string") return details; try { return JSON.stringify(details); } catch { return "—"; } }
