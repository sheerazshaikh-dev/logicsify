import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, MailCheck, Plus, ShieldCheck, Smartphone, Trash2, UserCog } from "lucide-react";
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
} from "@/components/admin/admin-ui";
import {
  createAdministrator,
  deleteAdministrator,
  listAdministrators,
  updateAdministrator,
  type Administrator,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/administrators")({ component: AdministratorsPage });

type AdminForm = {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: Administrator["role"];
  status: "active" | "inactive";
};

const emptyForm: AdminForm = {
  name: "",
  email: "",
  password: "",
  role: "editor",
  status: "active",
};

function AdministratorsPage() {
  const [items, setItems] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AdminForm>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listAdministrators());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load administrators.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(item: Administrator) {
    setForm({
      id: item.id,
      name: item.name,
      email: item.email,
      password: "",
      role: item.role,
      status: item.status || "active",
    });
    setOpen(true);
  }

  async function remove(item: Administrator) {
    if (!window.confirm(`Remove administrator access for ${item.name}?`)) return;
    try {
      await deleteAdministrator(item.id);
      toast.success("Administrator removed.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove administrator.");
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Access Control"
        title="Administrators"
        description="Create administrator accounts and assign Super Admin, Admin or Editor permissions."
        actions={
          <AdminButton
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add administrator
          </AdminButton>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <RoleCard
          icon={ShieldCheck}
          title="Super Admin"
          description="Full access, including administrator accounts and permanent deletion."
        />
        <RoleCard
          icon={UserCog}
          title="Admin"
          description="Content, leads, bookings, media, menus and settings access."
        />
        <RoleCard
          icon={KeyRound}
          title="Editor"
          description="Content and operational access without sensitive system configuration."
        />
      </div>

      <AdminCard>
        {loading ? (
          <AdminLoading label="Loading administrators…" />
        ) : !items.length ? (
          <EmptyState
            title="No administrators found"
            description="The initial Super Admin is normally created by setup.php."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">Administrator</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Two-factor</th>
                  <th className="px-5 py-4">Last login</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <button
                        onClick={() => edit(item)}
                        className="flex items-center gap-3 text-left"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-xs font-bold text-white">
                          {item.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#190A2F] hover:text-[#FE3434]">
                            {item.name}
                          </span>
                          <span className="mt-1 block text-xs text-slate-400">{item.email}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-slate-600">
                      {item.role.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status || "active"} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.two_factor_authenticator_enabled ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700"><Smartphone className="h-3 w-3" /> Authenticator</span> : null}
                        {item.two_factor_email_enabled ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700"><MailCheck className="h-3 w-3" /> Email</span> : null}
                        {!item.two_factor_authenticator_enabled && !item.two_factor_email_enabled ? <span className="text-xs text-slate-400">Not enabled</span> : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {item.last_login_at
                        ? new Date(item.last_login_at.replace(" ", "T")).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <AdminButton variant="secondary" onClick={() => edit(item)}>
                          Edit
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

      <AdministratorEditor
        open={open}
        form={form}
        setForm={setForm}
        onClose={() => setOpen(false)}
        onSaved={async () => {
          setOpen(false);
          await load();
        }}
      />
    </AdminShell>
  );
}

function AdministratorEditor({
  open,
  form,
  setForm,
  onClose,
  onSaved,
}: {
  open: boolean;
  form: AdminForm;
  setForm: React.Dispatch<React.SetStateAction<AdminForm>>;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name.trim() || !form.email.trim() || (!form.id && !form.password)) {
      toast.error("Name, email and a password for new users are required.");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await updateAdministrator(form.id, {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await createAdministrator({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }
      toast.success(form.id ? "Administrator updated." : "Administrator created.");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save administrator.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={form.id ? "Edit administrator" : "Add administrator"}
      description="Passwords are securely hashed by the PHP API and are never stored as plain text."
      width="max-w-2xl"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <FieldLabel>Full name</FieldLabel>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className={adminInputClass}
          />
        </div>
        <div>
          <FieldLabel>Email address</FieldLabel>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className={adminInputClass}
          />
        </div>
        <div>
          <FieldLabel>{form.id ? "New password (optional)" : "Password"}</FieldLabel>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            className={adminInputClass}
            autoComplete="new-password"
          />
        </div>
        <div>
          <FieldLabel>Role</FieldLabel>
          <select
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as Administrator["role"],
              }))
            }
            className={adminInputClass}
          >
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        {form.id ? (
          <div className="md:col-span-2">
            <FieldLabel>Status</FieldLabel>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as AdminForm["status"],
                }))
              }
              className={adminInputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <AdminButton variant="secondary" onClick={onClose}>
          Cancel
        </AdminButton>
        <AdminButton onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save administrator"}
        </AdminButton>
      </div>
    </AdminModal>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) {
  return (
    <AdminCard className="p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-[#190A2F]">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-[#190A2F]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
    </AdminCard>
  );
}
