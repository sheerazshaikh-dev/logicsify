import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Download,
  ExternalLink,
  FileImage,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  QrCode as QrIcon,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
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
import type { ConnectProfileExportFormat } from "@/lib/connect-profile-export";
import { CONNECT_PROFILE_PLATFORM_OPTIONS } from "@/lib/connect-profile-links";
import { downloadQrCode } from "@/lib/qr-code";
import {
  createConnectProfile,
  deleteConnectProfile,
  listConnectProfiles,
  updateConnectProfile,
  uploadMedia,
  type ConnectProfile,
  type ConnectProfileLink,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/connect-profiles")({ component: ConnectProfilesPage });
const emptyProfile: Partial<ConnectProfile> = {
  display_name: "",
  slug: "",
  headline: "",
  bio: "",
  avatar_url: "",
  cover_url: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  links_json: [],
  theme_json: { accent: "#FE3434" },
  status: "draft",
  is_unlisted: true,
  noindex: true,
};

function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createAvailableSlug(value: string, existingSlugs: string[]) {
  const base = createSlug(value);
  if (!base || !existingSlugs.includes(base)) return base;

  let suffix = 2;
  while (existingSlugs.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function ConnectProfilesPage() {
  const [items, setItems] = useState<ConnectProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ConnectProfile> | null>(null);
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState<ConnectProfile | null>(null);
  const [downloadProfile, setDownloadProfile] = useState<ConnectProfile | null>(null);
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
                  <AdminButton variant="secondary" onClick={() => setDownloadProfile(item)}>
                    <Download className="h-4 w-4" />
                    Download
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
                  <AdminButton
                    variant="danger"
                    ariaLabel={`Delete ${item.display_name}`}
                    onClick={() => void remove(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
      <ProfileEditor
        value={editing}
        setValue={setEditing}
        save={save}
        saving={saving}
        existingSlugs={items.filter((item) => item.id !== editing?.id).map((item) => item.slug)}
      />
      <QrModal profile={qr} close={() => setQr(null)} />
      <DownloadModal profile={downloadProfile} close={() => setDownloadProfile(null)} />
    </AdminShell>
  );
}

function ProfileEditor({
  value,
  setValue,
  save,
  saving,
  existingSlugs,
}: {
  value: Partial<ConnectProfile> | null;
  setValue: Dispatch<SetStateAction<Partial<ConnectProfile> | null>>;
  save: () => void;
  saving: boolean;
  existingSlugs: string[];
}) {
  const [imageUploads, setImageUploads] = useState({ avatar: false, cover: false });
  if (!value) return null;
  const set = (key: keyof ConnectProfile, v: unknown) =>
    setValue((current) => (current ? { ...current, [key]: v } : current));
  const setDisplayName = (displayName: string) =>
    setValue((current) => {
      if (!current) return current;

      const currentSlug = current.slug || "";
      const previousAutomaticSlug = createAvailableSlug(current.display_name || "", existingSlugs);
      const shouldGenerateSlug =
        !current.id && (!currentSlug || currentSlug === previousAutomaticSlug);

      return {
        ...current,
        display_name: displayName,
        ...(shouldGenerateSlug ? { slug: createAvailableSlug(displayName, existingSlugs) } : {}),
      };
    });
  const setImageUploading = (kind: "avatar" | "cover", uploading: boolean) =>
    setImageUploads((current) => ({ ...current, [kind]: uploading }));
  const isUploadingImage = imageUploads.avatar || imageUploads.cover;
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
      description="Blank optional fields are hidden automatically. Logicsify branding and the company website are added for you."
      onClose={() => {
        if (isUploadingImage) {
          toast.error("Wait for the image upload to finish before closing.");
          return;
        }
        setValue(null);
      }}
      width="max-w-5xl"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Display name *" value={value.display_name} onChange={setDisplayName} />
        <Field
          label="URL slug *"
          value={value.slug}
          hint="Generated automatically from the display name. You can edit it if needed."
          onChange={(v) => set("slug", createSlug(v))}
        />
        <Field label="Headline" value={value.headline} onChange={(v) => set("headline", v)} />
        <ProfileImageField
          kind="avatar"
          label="Avatar image"
          value={value.avatar_url}
          altText={`${value.display_name || "Connect profile"} avatar`}
          onChange={(v) => set("avatar_url", v)}
          onUploadingChange={(uploading) => setImageUploading("avatar", uploading)}
        />
        <ProfileImageField
          kind="cover"
          label="Cover image"
          value={value.cover_url}
          altText={`${value.display_name || "Connect profile"} cover`}
          onChange={(v) => set("cover_url", v)}
          onUploadingChange={(uploading) => setImageUploading("cover", uploading)}
        />
        <Field label="Email" value={value.email} onChange={(v) => set("email", v)} />
        <Field label="Phone" value={value.phone} onChange={(v) => set("phone", v)} />
        <Field
          label="WhatsApp number"
          value={value.whatsapp}
          onChange={(v) => set("whatsapp", v)}
        />
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
              setValue((current) =>
                current
                  ? { ...current, is_unlisted: v, noindex: v ? true : current.noindex }
                  : current,
              );
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
            <div key={i} className="grid gap-2 md:grid-cols-[1fr_1fr_2fr_auto]">
              <select
                className={adminInputClass}
                aria-label={`Link ${i + 1} icon`}
                value={link.icon || "auto"}
                onChange={(e) => setLink(i, "icon", e.target.value)}
              >
                {CONNECT_PROFILE_PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className={adminInputClass}
                placeholder="Label"
                aria-label={`Link ${i + 1} label`}
                value={link.label}
                onChange={(e) => setLink(i, "label", e.target.value)}
              />
              <input
                className={adminInputClass}
                placeholder="https://…"
                aria-label={`Link ${i + 1} URL`}
                value={link.url}
                onChange={(e) => setLink(i, "url", e.target.value)}
              />
              <AdminButton
                variant="danger"
                ariaLabel={`Remove link ${i + 1}`}
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
        <AdminButton variant="secondary" disabled={isUploadingImage} onClick={() => setValue(null)}>
          Cancel
        </AdminButton>
        <AdminButton
          disabled={saving || isUploadingImage || !value.display_name || !value.slug}
          onClick={save}
        >
          {saving ? "Saving…" : isUploadingImage ? "Uploading image…" : "Save profile"}
        </AdminButton>
      </div>
    </AdminModal>
  );
}

const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PROFILE_IMAGE_MAX_BYTES = 12 * 1024 * 1024;

function ProfileImageField({
  kind,
  label,
  value,
  altText,
  onChange,
  onUploadingChange,
}: {
  kind: "avatar" | "cover";
  label: string;
  value?: string | null;
  altText: string;
  onChange: (v: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, WebP or GIF image.");
      return;
    }
    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      toast.error("The image must be 12 MB or smaller.");
      return;
    }

    setUploading(true);
    onUploadingChange(true);
    try {
      const media = await uploadMedia(file, altText);
      onChange(media.url);
      toast.success(`${kind === "avatar" ? "Avatar" : "Cover"} image uploaded.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${
          kind === "avatar" ? "aspect-square max-w-48" : "aspect-[16/7] w-full"
        }`}
      >
        {value ? (
          <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center text-slate-400">
            <div>
              <ImagePlus className="mx-auto h-7 w-7" />
              <p className="mt-2 text-xs">No image selected</p>
            </div>
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 grid place-items-center bg-[#190A2F]/70 text-white">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              <p className="mt-2 text-xs font-semibold">Uploading…</p>
            </div>
          </div>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={PROFILE_IMAGE_TYPES.join(",")}
        disabled={uploading}
        onChange={(event) => void chooseImage(event)}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <AdminButton
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {value ? "Replace image" : "Upload image"}
        </AdminButton>
        {value ? (
          <AdminButton variant="danger" disabled={uploading} onClick={() => onChange("")}>
            <Trash2 className="h-4 w-4" />
            Remove
          </AdminButton>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-slate-400">JPG, PNG, WebP or GIF · maximum 12 MB</p>
      <div className="mt-3">
        <FieldLabel>Or use an image URL</FieldLabel>
        <input
          className={adminInputClass}
          type="url"
          placeholder="https://…"
          value={value || ""}
          disabled={uploading}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  hint,
  onChange,
}: {
  label: string;
  value?: string | null;
  hint?: string;
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
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
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

function DownloadModal({ profile, close }: { profile: ConnectProfile | null; close: () => void }) {
  const [exporting, setExporting] = useState<ConnectProfileExportFormat | null>(null);
  if (!profile) return null;
  const url = `${window.location.origin}/connect/${profile.slug}`;

  async function download(format: ConnectProfileExportFormat) {
    if (profile?.status !== "published") {
      toast.error("Publish this profile before downloading it so the QR code opens correctly.");
      return;
    }
    setExporting(format);
    try {
      const { downloadConnectProfileCard } = await import("@/lib/connect-profile-export");
      await downloadConnectProfileCard(profile, format, url);
      toast.success(`${format.toUpperCase()} profile downloaded.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The profile could not be downloaded.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <AdminModal
      open
      title={`Download: ${profile.display_name}`}
      description="Choose a portrait format. Both versions include the Logicsify logo, contact details, social links and a scannable QR code."
      onClose={close}
      width="max-w-xl"
    >
      <div className="rounded-2xl border border-slate-200 bg-[#faf8fc] p-4">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-2xl object-cover shadow-sm"
            />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#190A2F] text-xl font-bold text-white">
              {profile.display_name.slice(0, 1)}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-[#190A2F]">{profile.display_name}</p>
            <p className="mt-1 text-sm text-slate-500">A4 portrait · high-resolution export</p>
          </div>
        </div>
      </div>

      {profile.status !== "published" ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Publish this profile first. Otherwise its QR code would open a page that visitors cannot
          see.
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={Boolean(exporting) || profile.status !== "published"}
          onClick={() => void download("jpg")}
          className="group rounded-3xl border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-[#FE3434]/40 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#190A2F] text-white">
            {exporting === "jpg" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileImage className="h-5 w-5" />
            )}
          </span>
          <span className="mt-4 block font-semibold text-[#190A2F]">Download JPG</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Best for WhatsApp, social posts and quick sharing.
          </span>
        </button>
        <button
          type="button"
          disabled={Boolean(exporting) || profile.status !== "published"}
          onClick={() => void download("pdf")}
          className="group rounded-3xl border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-[#FE3434]/40 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#FE3434] to-[#FDBE02] text-white">
            {exporting === "pdf" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </span>
          <span className="mt-4 block font-semibold text-[#190A2F]">Download PDF</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Best for printing, email attachments and documents.
          </span>
        </button>
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-slate-400">
        Bio and action buttons are intentionally excluded from the downloadable version.
      </p>
    </AdminModal>
  );
}
