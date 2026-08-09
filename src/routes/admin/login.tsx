import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  MailCheck,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  adminLogin,
  getAdminToken,
  getPublicAdminAccessPolicy,
  sendAdminEmailTwoFactor,
  setAdminToken,
  verifyAdminTwoFactor,
  type TwoFactorMethod,
} from "@/lib/admin-api";
import { adminHref, legacyAdminPath } from "@/lib/admin-path";
import { getPublicSiteSettings, type PublicSiteSettings } from "@/lib/logicsify-api";
import { DEFAULT_BRAND_ASSETS, optimizedBrandAsset, withDefaultBranding } from "@/lib/brand-assets";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [{ title: "Logicsify Admin Login" }, { name: "robots", content: "noindex,nofollow" }],
  }),
});

type PendingChallenge = {
  token: string;
  methods: TwoFactorMethod[];
  maskedEmail?: string;
  emailSent?: boolean;
};

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings>({});
  const [challenge, setChallenge] = useState<PendingChallenge | null>(null);
  const [method, setMethod] = useState<TwoFactorMethod | null>(null);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(
    legacyAdminPath() ? null : true,
  );

  useEffect(() => {
    if (getAdminToken() && typeof window !== "undefined")
      window.location.replace(adminHref("dashboard"));
    getPublicSiteSettings().then((settings) => setSiteSettings(withDefaultBranding(settings)));
    if (legacyAdminPath()) {
      getPublicAdminAccessPolicy()
        .then((policy) => setAccessAllowed(policy.legacy_admin_path_enabled))
        .catch(() => setAccessAllowed(true));
    }
  }, []);

  async function sendEmailCode() {
    if (!challenge) return;
    setSendingEmail(true);
    try {
      const result = await sendAdminEmailTwoFactor(challenge.token);
      setChallenge((current) =>
        current ? { ...current, maskedEmail: result.masked_email, emailSent: true } : current,
      );
      setMethod("email");
      toast.success(`Verification code sent to ${result.masked_email}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the email code.");
    } finally {
      setSendingEmail(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      if (challenge && method) {
        const result = await verifyAdminTwoFactor(
          challenge.token,
          String(form.get("code") || ""),
          method,
          rememberLogin,
        );
        setAdminToken(result.token);
        toast.success(`Welcome back, ${result.administrator.name}.`);
        window.location.replace(adminHref("dashboard"));
        return;
      }
      const result = await adminLogin(
        String(form.get("email") || ""),
        String(form.get("password") || ""),
        rememberLogin,
      );
      if ("requires_2fa" in result && result.requires_2fa) {
        const defaultMethod = result.methods.length === 1 ? result.methods[0] : null;
        setChallenge({
          token: result.challenge_token,
          methods: result.methods,
          maskedEmail: result.masked_email,
          emailSent: Boolean(result.email_sent),
        });
        setMethod(defaultMethod);
        if (result.email_sent)
          toast.success(`Password accepted. A code was sent to ${result.masked_email}.`);
        else if (defaultMethod === "authenticator")
          toast.success("Password accepted. Enter your authenticator code.");
        else toast.success("Password accepted. Choose a verification method.");
        return;
      }
      setAdminToken(result.token);
      toast.success(`Welcome back, ${result.administrator.name}.`);
      window.location.replace(adminHref("dashboard"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  function resetChallenge() {
    setChallenge(null);
    setMethod(null);
  }

  if (accessAllowed === false) {
    return (
      <main className="logicsify-admin grid min-h-dvh place-items-center bg-ink p-6 text-white">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/45">404</p>
          <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        </div>
      </main>
    );
  }
  if (accessAllowed === null)
    return (
      <main className="logicsify-admin grid min-h-dvh place-items-center bg-ink text-white">
        Checking secure admin access…
      </main>
    );

  return (
    <main className="logicsify-admin relative grid min-h-dvh overflow-hidden bg-ink lg:grid-cols-[1.1fr_0.9fr]">
      <div className="absolute inset-0 grid-noise opacity-70" />
      <section className="relative hidden min-h-dvh flex-col justify-between p-12 text-white lg:flex xl:p-16">
        <Link to="/" className="block w-fit">
          <img
            src={optimizedBrandAsset(siteSettings.admin_logo, DEFAULT_BRAND_ASSETS.adminLogo)}
            alt={siteSettings.site_name || "Logicsify"}
            className="h-11 w-auto max-w-[230px] object-contain object-left"
          />
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
            Content Studio
          </p>
        </Link>
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/45">
            Protected administrator access
          </p>
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.04em] xl:text-7xl">
            Website operations with accountable access.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/60">
            Password protection, authenticator apps, email verification, lockouts, session controls,
            and security logs protect the Logicsify administration panel.
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
            <Link to="/" className="block w-fit">
              <img
                src={optimizedBrandAsset(siteSettings.logo_dark, DEFAULT_BRAND_ASSETS.adminLogoDark)}
                alt={siteSettings.site_name || "Logicsify"}
                className="h-9 w-auto max-w-[210px] object-contain object-left"
              />
            </Link>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Administrator access
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            {challenge ? "Verify your sign-in" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {challenge
              ? "Complete the second verification step configured for your administrator account."
              : "Sign in to manage the Logicsify website and incoming project data."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {!challenge ? (
              <>
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
                      className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
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
                      className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-12 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
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
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={rememberLogin}
                    onChange={(event) => setRememberLogin(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-brand-red"
                  />
                  <span>
                    <strong className="block text-sm text-ink">
                      Remember this trusted device for 30 days
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      After this sign-in and 2FA check, you will stay signed in and will not be
                      asked for another authenticator code while this session remains valid. Use
                      only on a private device.
                    </span>
                  </span>
                </label>
              </>
            ) : (
              <>
                {challenge.methods.length > 1 && !method ? (
                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod("authenticator")}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:border-brand-red"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white">
                        <KeyRound className="h-5 w-5" />
                      </span>
                      <span>
                        <strong className="block text-sm text-ink">Authenticator app</strong>
                        <span className="mt-1 block text-xs text-slate-500">
                          Use the current six-digit code or a recovery code.
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        challenge.emailSent ? setMethod("email") : void sendEmailCode()
                      }
                      disabled={sendingEmail}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:border-brand-red disabled:opacity-60"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-lavender text-brand-red">
                        {sendingEmail ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <MailCheck className="h-5 w-5" />
                        )}
                      </span>
                      <span>
                        <strong className="block text-sm text-ink">Email verification</strong>
                        <span className="mt-1 block text-xs text-slate-500">
                          Send a one-time code to{" "}
                          {challenge.maskedEmail || "your administrator email"}.
                        </span>
                      </span>
                    </button>
                  </div>
                ) : null}

                {method === "email" && !challenge.emailSent ? (
                  <button
                    type="button"
                    onClick={() => void sendEmailCode()}
                    disabled={sendingEmail}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-ink disabled:opacity-60"
                  >
                    {sendingEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MailCheck className="h-4 w-4" />
                    )}{" "}
                    Send email verification code
                  </button>
                ) : null}

                {method ? (
                  <div>
                    <label
                      htmlFor="admin-code"
                      className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
                    >
                      {method === "email"
                        ? "Email verification code"
                        : "Authenticator or recovery code"}
                    </label>
                    <input
                      id="admin-code"
                      name="code"
                      inputMode={method === "email" ? "numeric" : "text"}
                      autoComplete="one-time-code"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-center text-lg tracking-[0.28em] outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
                      placeholder={method === "email" ? "123456" : "123456"}
                    />
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {method === "email"
                        ? `Use the latest code sent to ${challenge.maskedEmail || "your email"}.`
                        : "Open your authenticator app. A saved one-time recovery code also works."}
                    </p>
                    {method === "email" && challenge.emailSent ? (
                      <button
                        type="button"
                        onClick={() => void sendEmailCode()}
                        disabled={sendingEmail}
                        className="mt-2 text-xs font-semibold text-brand-red hover:text-ink disabled:opacity-50"
                      >
                        {sendingEmail ? "Sending…" : "Resend email code"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {rememberLogin ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    This browser will remain signed in for up to 30 days after verification.
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={resetChallenge}
                    className="text-xs font-semibold text-slate-500 hover:text-ink"
                  >
                    Use a different account
                  </button>
                  {challenge.methods.length > 1 && method ? (
                    <button
                      type="button"
                      onClick={() => setMethod(null)}
                      className="text-xs font-semibold text-brand-red hover:text-ink"
                    >
                      Change verification method
                    </button>
                  ) : null}
                </div>
              </>
            )}

            {!challenge || method ? (
              <button
                type="submit"
                disabled={loading || (method === "email" && !challenge?.emailSent)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {challenge ? "Verify code" : "Sign in"} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : null}
          </form>

          <div className="mt-7 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
            Never share your password, authenticator code, email code, or recovery codes. Logicsify
            support should not ask for them.
          </div>
        </div>
      </section>
    </main>
  );
}
