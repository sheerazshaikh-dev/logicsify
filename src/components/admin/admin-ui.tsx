import { Loader2, X } from "lucide-react";
import type { ReactNode } from "react";

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_-38px_rgba(25,10,47,0.45)] ${className}`}
    >
      {children}
    </section>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-[#190A2F]">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary:
      "bg-[#190A2F] text-white hover:bg-[#2a1546] shadow-[0_12px_30px_-18px_rgba(25,10,47,0.9)]",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const classes =
    normalized === "published" ||
    normalized === "confirmed" ||
    normalized === "won" ||
    normalized === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : normalized === "draft" || normalized === "pending" || normalized === "new"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : normalized === "scheduled" || normalized === "qualified" || normalized === "contacted"
          ? "bg-blue-50 text-blue-700 border-blue-100"
          : normalized === "cancelled" ||
              normalized === "lost" ||
              normalized === "spam" ||
              normalized === "inactive"
            ? "bg-red-50 text-red-700 border-red-100"
            : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${classes}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  width = "max-w-3xl",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#190A2F]/60 p-4 backdrop-blur-sm">
      <div
        className={`max-h-[92vh] w-full overflow-hidden rounded-3xl bg-white shadow-2xl ${width}`}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-[#190A2F]">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-88px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center gap-3 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" /> {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 h-12 w-12 rounded-2xl bg-gradient-brand opacity-90" />
      <h3 className="text-lg font-semibold text-[#190A2F]">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </span>
  );
}

export const adminInputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#190A2F] outline-none transition placeholder:text-slate-400 focus:border-[#FE3434] focus:ring-4 focus:ring-[#FE3434]/10";

export const adminTextareaClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#190A2F] outline-none transition placeholder:text-slate-400 focus:border-[#FE3434] focus:ring-4 focus:ring-[#FE3434]/10";
