import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Check, Clock, Loader2 } from "lucide-react";
import { getAvailability, submitBooking, type AvailabilitySlot } from "@/lib/logicsify-api";

const serviceOptions = [
  "Website Design & Development",
  "Web Application",
  "SaaS Development",
  "Mobile App",
  "E-commerce",
  "AI Automation",
  "AI Agent",
  "CRM Automation",
  "SEO & Digital Marketing",
  "Branding",
  "Cybersecurity",
  "Other",
];

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function StrategyCallCalendar({ compact = false }: { compact?: boolean }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const minDate = useMemo(() => formatDateInput(new Date()), []);
  const maxDate = useMemo(() => {
    const next = new Date();
    next.setDate(next.getDate() + 60);
    return formatDateInput(next);
  }, []);

  async function chooseDate(value: string) {
    setDate(value);
    setSelectedTime("");
    setSlots([]);
    setMessage("");
    if (!value) return;
    setLoadingSlots(true);
    try {
      const result = await getAvailability(value);
      setSlots(result.slots || []);
      if (result.timezone) setTimezone(result.timezone);
      if (!result.available || !result.slots?.length) {
        setMessage("No times are available on this date. Please choose another day.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load available times.");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!date || !selectedTime) {
      setMessage("Please choose a date and an available time.");
      return;
    }

    const formElement = event.currentTarget;
    const values = Object.fromEntries(new FormData(formElement).entries()) as Record<
      string,
      string
    >;
    setState("submitting");
    try {
      const result = await submitBooking({
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company,
        service: values.service,
        notes: values.notes,
        honey: values.honey,
        meeting_date: date,
        start_time: selectedTime,
        timezone,
      });
      setMessage(result.message);
      setState("success");
      formElement.reset();
      setDate("");
      setSelectedTime("");
      setSlots([]);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not submit your booking.");
    }
  }

  if (state === "success") {
    return (
      <div className="min-h-[420px] flex items-center justify-center text-center p-8">
        <div className="max-w-md">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-5">
            <Check className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-semibold">Your call request is in.</h3>
          <p className="mt-3 text-white/70">{message}</p>
          <button
            className="btn-ghost-dark mt-7"
            onClick={() => {
              setState("idle");
              setMessage("");
            }}
          >
            Book another time
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "" : "relative"}>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div>
            <label
              className="block text-xs uppercase tracking-widest text-white/60 mb-2"
              htmlFor="booking-date"
            >
              Choose a date*
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 pointer-events-none" />
              <input
                id="booking-date"
                type="date"
                min={minDate}
                max={maxDate}
                value={date}
                onChange={(event) => chooseDate(event.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/15 pl-11 pr-4 py-3 text-white [color-scheme:dark] focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-widest text-white/60">
                Available times*
              </label>
              <span className="text-[11px] text-white/40">{timezone}</span>
            </div>
            <div className="min-h-[145px] rounded-xl border border-white/10 bg-white/[0.03] p-3">
              {loadingSlots ? (
                <div className="h-full min-h-[120px] flex items-center justify-center text-white/60 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading times…
                </div>
              ) : slots.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${selectedTime === slot.time ? "bg-gradient-brand border-transparent text-white" : "border-white/15 bg-white/5 text-white/80 hover:border-white/35"}`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center text-white/45 text-sm px-4">
                  <Clock className="w-5 h-5 mb-2" />
                  Choose a date to see available 30-minute times.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 content-start">
          <BookingField name="name" label="Full name*" required />
          <BookingField name="email" label="Work email*" type="email" required />
          <div className="grid grid-cols-2 gap-4">
            <BookingField name="phone" label="Phone" type="tel" />
            <BookingField name="company" label="Company" />
          </div>
          <div>
            <label
              className="block text-xs uppercase tracking-widest text-white/60 mb-2"
              htmlFor="booking-service"
            >
              What can we help with?
            </label>
            <select
              id="booking-service"
              name="service"
              defaultValue=""
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30"
            >
              <option value="" className="text-black">
                Select a service
              </option>
              {serviceOptions.map((service) => (
                <option key={service} className="text-black" value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-xs uppercase tracking-widest text-white/60 mb-2"
              htmlFor="booking-notes"
            >
              Anything we should know?
            </label>
            <textarea
              id="booking-notes"
              name="notes"
              rows={3}
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30"
            />
          </div>
          <input
            type="text"
            name="honey"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden
          />
        </div>
      </div>

      {message && (
        <p className={`mt-4 text-sm ${state === "error" ? "text-red-300" : "text-white/65"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "submitting" || !selectedTime}
        className="btn-primary justify-center w-full mt-5 disabled:opacity-50 disabled:pointer-events-none"
      >
        {state === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Requesting call…
          </>
        ) : (
          "Request strategy call"
        )}
      </button>
    </form>
  );
}

function BookingField({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-xs uppercase tracking-widest text-white/60 mb-2"
        htmlFor={`booking-${name}`}
      >
        {label}
      </label>
      <input
        id={`booking-${name}`}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/30"
      />
    </div>
  );
}
