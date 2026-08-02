import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, ExternalLink, Plus, QrCode as QrIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { QrCode } from "@/components/qr-code";
import { downloadQrCode } from "@/lib/qr-code";
import {
  createConnectProfile,
  deleteConnectProfile,
  listConnectProfiles,
  updateConnectProfile,
  type ConnectProfile,
  type ConnectProfileLink,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/connect-profiles")({ component: ConnectProfilesPage });
const emptyProfile: Partial<ConnectProfile> = {
  display_name: "",
  slug: "",
  headline: "",
  company: "",
  bio: "",
  avatar_url: "",
  cover_url: "",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  address: "",
  links_json: [],
  theme_json: { accent: "#FE3434" },
  status: "draft",
  is_unlisted: true,
  noindex: true,
};

function ConnectProfilesPage() {
  const [items, setItems] = useState<ConnectProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ConnectProfile> | null>(null);
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState<ConnectProfile | null>(null);
  const refresh = () =>
    listConnectProfiles()
      .then((r) => setItems(r.data))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Could not load profiles."))
      .finally(() => setLoading(false));
  useEffect(() => {
    void refresh();
  }, []);
  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const saved = editing.id
        ? await updateConnectProfile(editing.id, editing)
        : await createConnectProfile(editing);
      toast.success(editing.id ? "Profile updated." : "Profile created.");
      setEditing(null);
      await refresh();
      if (saved.status === "published") setQr(saved);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(item: ConnectProfile) {
    if (!confirm(`Move ${item.display_name} to the Recycle Bin?`)) return;
    try {
      await deleteConnectProfile(item.id);
      toast.success("Profile moved to Recycle Bin.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete profile.");
    }
  }
  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Reusable module"
        title="Connect Profiles"
        description="Create shareable digital profiles. Every field except the name and URL slug is optional."
        actions={
          <AdminButton onClick={() => setEditing({ ...emptyProfile })}>
            <Plus className="h-4 w-4" />
            New profile
          </AdminButton>
        }
      />
      <AdminCard>
        {loading ? (
          <AdminLoading />
        ) : items.length === 0 ? (
          <EmptyState
            title="No connect profiles yet"
            description="Create a profile, publish it, and share its QR code."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#190A2F] font-bold text-white">
                      {item.display_name.slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#190A2F]">{item.display_name}</p>
                      <StatusBadge status={item.status} />
                      {item.is_unlisted ? (
                        <span className="text-xs text-slate-400">Unlisted · noindex</span>
                      ) : item.noindex ? (
                        <span className="text-xs text-slate-400">Noindex</span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">/connect/{item.slug}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="secondary" onClick={() => setEditing(item)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="secondary" onClick={() => setQr(item)}>
                    <QrIcon className="h-4 w-4" />
                    QR code
                  </AdminButton>
                  {item.status === "published" ? (
                    <a
                      href={`/connect/${item.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                  ) : null}
                  <AdminButton variant="danger" onClick={() => void remove(item)}>
                    <Trash2 className="h-4 w-4" />
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
      <ProfileEditor value={editing} setValue={setEditing} save={save} saving={saving} />
      <QrModal profile={qr} close={() => setQr(null)} />
    </AdminShell>
  );
}

function ProfileEditor({
  value,
  setValue,
  save,
  saving,
}: {
  value: Partial<ConnectProfile> | null;
  setValue: (v: Partial<ConnectProfile> | null) => void;
  save: () => void;
  saving: boolean;
}) {
  if (!value) return null;
  const set = (key: keyof ConnectProfile, v: unknown) => setValue({ ...value, [key]: v });
  const links = value.links_json || [];
  const setLink = (i: number, key: keyof ConnectProfileLink, v: string) =>
    set(
      "links_json",
      links.map((x, n) => (n === i ? { ...x, [key]: v } : x)),
    );
  return (
    <AdminModal
      open
      title={value.id ? "Edit connect profile" : "New connect profile"}
      description="Blank optional fields are hidden automatically on the public page."
      onClose={() => setValue(null)}
      width="max-w-5xl"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Display name *"
          value={value.display_name}
          onChange={(v) => set("display_name", v)}
        />
        <Field
          label="URL slug *"
          value={value.slug}
          onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
        />
        <Field label="Headline" value={value.headline} onChange={(v) => set("headline", v)} />
        <Field label="Company" value={value.company} onChange={(v) => set("company", v)} />
        <Field
          label="Avatar image URL"
          value={value.avatar_url}
          onChange={(v) => set("avatar_url", v)}
        />
        <Field
          label="Cover image URL"
          value={value.cover_url}
          onChange={(v) => set("cover_url", v)}
        />
        <Field label="Email" value={value.email} onChange={(v) => set("email", v)} />
        <Field label="Phone" value={value.phone} onChange={(v) => set("phone", v)} />
        <Field
          label="WhatsApp number"
          value={value.whatsapp}
          onChange={(v) => set("whatsapp", v)}
        />
        <Field label="Website" value={value.website} onChange={(v) => set("website", v)} />
        <Field label="Address" value={value.address} onChange={(v) => set("address", v)} />
        <div>
          <FieldLabel>Accent color</FieldLabel>
          <input
            type="color"
            value={value.theme_json?.accent || "#FE3434"}
            onChange={(e) => set("theme_json", { accent: e.target.value })}
            className="h-11 w-full rounded-xl border border-slate-200 p-1"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Bio</FieldLabel>
          <textarea
            className={adminTextareaClass}
            rows={4}
            value={value.bio || ""}
            onChange={(e) => set("bio", e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <select
            className={adminInputClass}
            value={value.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="space-y-3">
          <Check
            label="Unlisted (accessible only by direct URL)"
            checked={Boolean(value.is_unlisted)}
            onChange={(v) => {
              setValue({ ...value, is_unlisted: v, noindex: v ? true : value.noindex });
            }}
          />
          <Check
            label="Prevent search-engine indexing"
            checked={Boolean(value.noindex)}
            disabled={Boolean(value.is_unlisted)}
            onChange={(v) => set("noindex", v)}
          />
        </div>
      </div>
      <div className="mt-7 border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#190A2F]">Custom links</h3>
            <p className="text-sm text-slate-500">
              Social profiles, booking links, portfolios, stores, or any HTTPS URL.
            </p>
          </div>
          <AdminButton
            variant="secondary"
            onClick={() => set("links_json", [...links, { label: "", url: "", icon: "link" }])}
          >
            <Plus className="h-4 w-4" />
            Add link
          </AdminButton>
        </div>
        <div className="mt-4 space-y-3">
          {links.map((link, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
              <input
                className={adminInputClass}
                placeholder="Label"
                value={link.label}
                onChange={(e) => setLink(i, "label", e.target.value)}
              />
              <input
                className={adminInputClass}
                placeholder="https://…"
                value={link.url}
                onChange={(e) => setLink(i, "url", e.target.value)}
              />
              <AdminButton
                variant="danger"
                onClick={() =>
                  set(
                    "links_json",
                    links.filter((_, n) => n !== i),
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 flex justify-end gap-2">
        <AdminButton variant="secondary" onClick={() => setValue(null)}>
          Cancel
        </AdminButton>
        <AdminButton disabled={saving || !value.display_name || !value.slug} onClick={save}>
          {saving ? "Saving…" : "Save profile"}
        </AdminButton>
      </div>
    </AdminModal>
  );
}
function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        className={adminInputClass}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
function Check({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#FE3434]"
      />
      {label}
    </label>
  );
}
function QrModal({ profile, close }: { profile: ConnectProfile | null; close: () => void }) {
  if (!profile) return null;
  const url = `${window.location.origin}/connect/${profile.slug}`;
  return (
    <AdminModal
      open
      title={`QR code: ${profile.display_name}`}
      description="This code points to the profile's permanent connect URL."
      onClose={close}
      width="max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        <QrCode value={url} className="rounded-2xl border border-slate-200" />
        <p className="mt-4 break-all text-sm text-slate-500">{url}</p>
        <div className="mt-5 flex gap-2">
          <AdminButton
            variant="secondary"
            onClick={() =>
              void navigator.clipboard.writeText(url).then(() => toast.success("URL copied."))
            }
          >
            <Copy className="h-4 w-4" />
            Copy
          </AdminButton>
          <AdminButton onClick={() => void downloadQrCode(url, `${profile.slug}-qr.png`)}>
            <Download className="h-4 w-4" />
            Download PNG
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  );
}
