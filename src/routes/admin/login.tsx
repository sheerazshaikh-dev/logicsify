import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { adminLogin, getAdminToken, setAdminToken } from "@/lib/admin-api";
import { getPublicSiteSettings, type PublicSiteSettings } from "@/lib/logicsify-api";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [{ title: "Logicsify Admin Login" }, { name: "robots", content: "noindex,nofollow" }],
  }),
});

function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings>({});

  useEffect(() => {
    if (getAdminToken() && typeof window !== "undefined")
      window.location.replace("/admin/dashboard");
    getPublicSiteSettings().then(setSiteSettings);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const result = await adminLogin(
        String(form.get("email") || ""),
        String(form.get("password") || ""),
      );
      setAdminToken(result.token);
      toast.success(`Welcome back, ${result.administrator.name}.`);
      if (typeof window !== "undefined") window.location.replace("/admin/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-[#190A2F] lg:grid-cols-[1.1fr_0.9fr]">
      <div className="absolute inset-0 grid-noise opacity-70" />
      <section className="relative hidden min-h-dvh flex-col justify-between p-12 text-white lg:flex xl:p-16">
        <Link to="/" className="flex w-fit items-center gap-3">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-gradient-brand font-display text-lg font-black">
            {siteSettings.admin_logo ? (
              <img
                src={siteSettings.admin_logo}
                alt=""
                className="h-full w-full object-contain p-2"
              />
            ) : (
              (siteSettings.site_name || "Logicsify").charAt(0).toUpperCase()
            )}
          </span>
          <div>
            <p className="font-display text-xl font-semibold">
              {siteSettings.site_name || "Logicsify"}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
              Content Studio
            </p>
          </div>
        </Link>
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/45">
            One place to run the website
          </p>
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.04em] xl:text-7xl">
            Content, leads, bookings and settings—logically managed.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/60">
            The same administration experience you liked in Brand & Brains, now built directly into
            the Logicsify React application.
          </p>
        </div>
        <p className="text-xs text-white/35">
          © {new Date().getFullYear()} {siteSettings.site_name || "Logicsify"}. Authorized access
          only.
        </p>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md rounded-[32px] border border-white/15 bg-white p-7 shadow-2xl sm:p-10">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-brand font-display font-black text-white">
                {siteSettings.admin_logo ? (
                  <img
                    src={siteSettings.admin_logo}
                    alt=""
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  (siteSettings.site_name || "Logicsify").charAt(0).toUpperCase()
                )}
              </span>
              <span className="font-display text-xl font-semibold text-[#190A2F]">
                {siteSettings.site_name || "Logicsify"}
              </span>
            </Link>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Administrator access
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#190A2F]">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to manage the Logicsify website and incoming project data.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-[#FE3434] focus:ring-4 focus:ring-[#FE3434]/10"
                  placeholder="admin@logicsify.com"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-12 text-sm outline-none transition focus:border-[#FE3434] focus:ring-4 focus:ring-[#FE3434]/10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#190A2F] text-sm font-semibold text-white transition hover:bg-[#2a1546] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
            Use the administrator account created by the backend installer. Change the temporary
            password after your first login.
          </div>
        </div>
      </section>
    </main>
  );
}
