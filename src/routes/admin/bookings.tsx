import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock3, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import {
  addBlockedDate,
  deleteBooking,
  getAvailabilityRules,
  listBookings,
  removeBlockedDate,
  saveAvailabilityRules,
  updateBooking,
  type AvailabilityRule,
  type BlockedDate,
  type Booking,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/bookings")({ component: BookingsPage });

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function BookingsPage() {
  const [tab, setTab] = useState<"bookings" | "availability">("bookings");

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="Calendar"
        title="Bookings"
        description="Manage strategy-call requests, statuses, weekly availability, meeting duration and blocked dates."
        actions={
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setTab("bookings")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "bookings" ? "bg-[#190A2F] text-white" : "text-slate-500"}`}
            >
              Bookings
            </button>
            <button
              onClick={() => setTab("availability")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "availability" ? "bg-[#190A2F] text-white" : "text-slate-500"}`}
            >
              Availability
            </button>
          </div>
        }
      />
      {tab === "bookings" ? <BookingsList /> : <AvailabilityManager />}
    </AdminShell>
  );
}

function BookingsList() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listBookings({ status, from, to });
      setItems(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, [from, status, to]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(item: Booking) {
    if (!window.confirm(`Move ${item.name}'s booking to the recycle bin?`)) return;
    try {
      await deleteBooking(item.id);
      toast.success("Booking moved to the recycle bin.");
      if (selected?.id === item.id) setSelected(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete booking.");
    }
  }

  return (
    <>
      <AdminCard>
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-4">
          <div>
            <FieldLabel>Status</FieldLabel>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={adminInputClass}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
            </select>
          </div>
          <div>
            <FieldLabel>From</FieldLabel>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className={adminInputClass}
            />
          </div>
          <div>
            <FieldLabel>To</FieldLabel>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className={adminInputClass}
            />
          </div>
          <div className="flex items-end">
            <AdminButton
              variant="secondary"
              className="w-full"
              onClick={() => {
                setStatus("all");
                setFrom("");
                setTo("");
              }}
            >
              <Search className="h-4 w-4" /> Clear filters
            </AdminButton>
          </div>
        </div>

        {loading ? (
          <AdminLoading label="Loading bookings…" />
        ) : !items.length ? (
          <EmptyState
            title="No bookings found"
            description="Strategy-call requests will appear here when visitors select an available time."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(item)} className="text-left">
                        <p className="text-sm font-semibold text-[#190A2F] hover:text-[#FE3434]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{item.email}</p>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.meeting_date}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.service || "Strategy call"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <AdminButton variant="secondary" onClick={() => setSelected(item)}>
                          Open
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

      <BookingEditor
        booking={selected}
        onClose={() => setSelected(null)}
        onSaved={async () => {
          setSelected(null);
          await load();
        }}
      />
    </>
  );
}

function BookingEditor({
  booking,
  onClose,
  onSaved,
}: {
  booking: Booking | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [status, setStatus] = useState<Booking["status"]>("pending");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setNotes(booking.admin_notes || "");
    }
  }, [booking]);

  async function save() {
    if (!booking) return;
    setSaving(true);
    try {
      await updateBooking(booking.id, { status, admin_notes: notes });
      toast.success("Booking updated.");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update booking.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      open={Boolean(booking)}
      onClose={onClose}
      title={booking?.name || "Booking"}
      description="Strategy-call details and internal meeting status."
      width="max-w-4xl"
    >
      {booking ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <AdminCard className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Email" value={booking.email} />
                <Detail label="Phone" value={booking.phone || "Not provided"} />
                <Detail label="Company" value={booking.company || "Not provided"} />
                <Detail label="Service" value={booking.service || "Strategy call"} />
              </div>
            </AdminCard>
            <AdminCard className="p-5">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-[#190A2F]">{booking.meeting_date}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {booking.start_time.slice(0, 5)}–{booking.end_time.slice(0, 5)} ·{" "}
                    {booking.timezone}
                  </p>
                </div>
              </div>
              {booking.notes ? (
                <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                  {booking.notes}
                </div>
              ) : null}
            </AdminCard>
          </div>
          <AdminCard className="h-fit p-5">
            <div>
              <FieldLabel>Status</FieldLabel>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as Booking["status"])}
                className={adminInputClass}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No show</option>
              </select>
            </div>
            <div className="mt-5">
              <FieldLabel>Internal notes</FieldLabel>
              <textarea
                rows={10}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={adminTextareaClass}
                placeholder="Meeting outcome, follow-up tasks or context…"
              />
            </div>
            <AdminButton onClick={() => void save()} disabled={saving} className="mt-5 w-full">
              {saving ? "Saving…" : "Save booking"}
            </AdminButton>
          </AdminCard>
        </div>
      ) : null}
    </AdminModal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-[#190A2F]">{value}</p>
    </div>
  );
}

function AvailabilityManager() {
  const defaultRules = useMemo<AvailabilityRule[]>(
    () =>
      weekdays.map((_, weekday) => ({
        weekday,
        start_time: "09:00",
        end_time: "17:00",
        slot_minutes: 30,
        buffer_minutes: 0,
        enabled: weekday > 0 && weekday < 6,
      })),
    [],
  );
  const [rules, setRules] = useState<AvailabilityRule[]>(defaultRules);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockedDate, setBlockedDate] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAvailabilityRules();
      const byDay = new Map(result.rules.map((rule) => [Number(rule.weekday), rule]));
      setRules(defaultRules.map((rule) => ({ ...rule, ...(byDay.get(rule.weekday) || {}) })));
      setBlocked(result.blocked_dates || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load availability.");
    } finally {
      setLoading(false);
    }
  }, [defaultRules]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateRule(
    index: number,
    key: keyof AvailabilityRule,
    value: string | number | boolean,
  ) {
    setRules((current) =>
      current.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, [key]: value } : rule)),
    );
  }

  async function save() {
    setSaving(true);
    try {
      await saveAvailabilityRules(rules);
      toast.success("Availability saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save availability.");
    } finally {
      setSaving(false);
    }
  }

  async function addBlock() {
    if (!blockedDate) return;
    try {
      await addBlockedDate(blockedDate, reason);
      toast.success("Date blocked.");
      setBlockedDate("");
      setReason("");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not block date.");
    }
  }

  async function removeBlock(id: number) {
    try {
      await removeBlockedDate(id);
      toast.success("Blocked date removed.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove blocked date.");
    }
  }

  if (loading) return <AdminLoading label="Loading availability…" />;

  return (
    <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr]">
      <AdminCard>
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="font-semibold text-[#190A2F]">Weekly hours</h2>
            <p className="mt-1 text-xs text-slate-400">
              Configure active days, working hours, slot length and buffer time.
            </p>
          </div>
          <Clock3 className="h-5 w-5 text-[#FE3434]" />
        </div>
        <div className="divide-y divide-slate-100">
          {rules.map((rule, index) => (
            <div
              key={rule.weekday}
              className="grid gap-4 p-5 md:grid-cols-[140px_1fr_1fr_120px_120px] md:items-end"
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(rule.enabled)}
                  onChange={(event) => updateRule(index, "enabled", event.target.checked)}
                  className="h-4 w-4 accent-[#FE3434]"
                />
                <span className="text-sm font-semibold text-[#190A2F]">
                  {weekdays[rule.weekday]}
                </span>
              </label>
              <div>
                <FieldLabel>Start</FieldLabel>
                <input
                  type="time"
                  value={rule.start_time.slice(0, 5)}
                  onChange={(event) => updateRule(index, "start_time", event.target.value)}
                  className={adminInputClass}
                  disabled={!rule.enabled}
                />
              </div>
              <div>
                <FieldLabel>End</FieldLabel>
                <input
                  type="time"
                  value={rule.end_time.slice(0, 5)}
                  onChange={(event) => updateRule(index, "end_time", event.target.value)}
                  className={adminInputClass}
                  disabled={!rule.enabled}
                />
              </div>
              <div>
                <FieldLabel>Slot</FieldLabel>
                <select
                  value={rule.slot_minutes}
                  onChange={(event) =>
                    updateRule(index, "slot_minutes", Number(event.target.value))
                  }
                  className={adminInputClass}
                  disabled={!rule.enabled}
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
              <div>
                <FieldLabel>Buffer</FieldLabel>
                <select
                  value={rule.buffer_minutes}
                  onChange={(event) =>
                    updateRule(index, "buffer_minutes", Number(event.target.value))
                  }
                  className={adminInputClass}
                  disabled={!rule.enabled}
                >
                  <option value={0}>None</option>
                  <option value={5}>5 min</option>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-slate-200 p-5">
          <AdminButton onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save availability"}
          </AdminButton>
        </div>
      </AdminCard>

      <AdminCard className="h-fit">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-[#190A2F]">Blocked dates</h2>
          <p className="mt-1 text-xs text-slate-400">
            Prevent bookings on holidays, leave or unavailable dates.
          </p>
        </div>
        <div className="space-y-3 p-5">
          <input
            type="date"
            value={blockedDate}
            onChange={(event) => setBlockedDate(event.target.value)}
            className={adminInputClass}
          />
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className={adminInputClass}
            placeholder="Reason (optional)"
          />
          <AdminButton onClick={() => void addBlock()} disabled={!blockedDate} className="w-full">
            <Plus className="h-4 w-4" /> Block date
          </AdminButton>
        </div>
        <div className="border-t border-slate-200 p-5">
          {!blocked.length ? (
            <p className="text-center text-sm text-slate-400">No dates are blocked.</p>
          ) : (
            <div className="space-y-2">
              {blocked.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#190A2F]">{item.blocked_date}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {item.reason || "No reason supplied"}
                    </p>
                  </div>
                  <button
                    onClick={() => void removeBlock(item.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
