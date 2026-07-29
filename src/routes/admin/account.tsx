import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Loader2, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  changeCurrentAdminPassword,
  getCurrentAdmin,
  updateCurrentAdminProfile,
  type Administrator,
} from "@/lib/admin-api";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminButton,
  AdminCard,
  AdminLoading,
  AdminPageHeader,
  FieldLabel,
  adminInputClass,
} from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/account")({
  component: AccountPage,
});

function AccountPage() {
  const [admin, setAdmin] = useState<Administrator | null>(null);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getCurrentAdmin()
      .then((result) => {
        setAdmin(result);
        setProfile({ name: result.name, email: result.email });
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Could not load your account."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const result = await updateCurrentAdminProfile(profile);
      setAdmin(result.user);
      setProfile({ name: result.user.name, email: result.user.email });
      window.dispatchEvent(
        new CustomEvent("logicsify:admin-profile-updated", { detail: result.user }),
      );
      toast.success("Your profile was updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (passwords.next !== passwords.confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (passwords.next.length < 10) {
      toast.error("Use at least 10 characters for the new password.");
      return;
    }
    setSavingPassword(true);
    try {
      await changeCurrentAdminPassword({
        current_password: passwords.current,
        new_password: passwords.next,
      });
      setPasswords({ current: "", next: "", confirm: "" });
      toast.success("Password changed. Other signed-in sessions were revoked.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Administrator"
        title="My Account"
        description="Update your administrator profile and password."
      />
      {loading || !admin ? (
        <AdminLoading label="Loading your account…" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={saveProfile}>
            <AdminCard className="h-full p-6">
              <div className="mb-6">
                <span className="inline-flex rounded-full bg-[#190A2F] px-3 py-1 text-xs font-semibold capitalize text-white">
                  {admin.role.replaceAll("_", " ")}
                </span>
                <h2 className="mt-4 text-xl font-semibold text-[#190A2F]">Profile details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  This identity appears in the admin panel and Security logs.
                </p>
              </div>
              <div className="space-y-5">
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <input
                    required
                    value={profile.name}
                    onChange={(event) =>
                      setProfile((current) => ({ ...current, name: event.target.value }))
                    }
                    className={adminInputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input
                    required
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile((current) => ({ ...current, email: event.target.value }))
                    }
                    className={adminInputClass}
                  />
                </div>
                <AdminButton type="submit" disabled={savingProfile}>
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save profile
                </AdminButton>
              </div>
            </AdminCard>
          </form>

          <form onSubmit={savePassword}>
            <AdminCard className="h-full p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#190A2F]">Change password</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Changing it revokes your other active admin sessions.
                </p>
              </div>
              <div className="space-y-5">
                <div>
                  <FieldLabel>Current password</FieldLabel>
                  <input
                    required
                    type="password"
                    autoComplete="current-password"
                    value={passwords.current}
                    onChange={(event) =>
                      setPasswords((current) => ({ ...current, current: event.target.value }))
                    }
                    className={adminInputClass}
                  />
                </div>
                <div>
                  <FieldLabel>New password</FieldLabel>
                  <input
                    required
                    minLength={10}
                    type="password"
                    autoComplete="new-password"
                    value={passwords.next}
                    onChange={(event) =>
                      setPasswords((current) => ({ ...current, next: event.target.value }))
                    }
                    className={adminInputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Confirm new password</FieldLabel>
                  <input
                    required
                    minLength={10}
                    type="password"
                    autoComplete="new-password"
                    value={passwords.confirm}
                    onChange={(event) =>
                      setPasswords((current) => ({ ...current, confirm: event.target.value }))
                    }
                    className={adminInputClass}
                  />
                </div>
                <AdminButton type="submit" disabled={savingPassword}>
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  Change password
                </AdminButton>
              </div>
            </AdminCard>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
