import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SiteSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  tone?: "light" | "dark";
  className?: string;
  ariaInvalid?: boolean;
};

export function SiteSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select one",
  id,
  name,
  required = false,
  disabled = false,
  tone = "light",
  className,
  ariaInvalid = false,
}: SiteSelectProps) {
  const isDark = tone === "dark";

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      name={name}
      required={required}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-invalid={ariaInvalid}
        className={cn(
          "h-auto min-h-12 w-full rounded-xl px-4 py-3 text-left shadow-none transition focus:outline-none focus:ring-2",
          isDark
            ? "border-white/15 bg-white/5 text-white focus:border-brand-red focus:ring-brand-red/30 data-[placeholder]:text-white/45"
            : "border-black/10 bg-white text-ink focus:border-brand-red focus:ring-brand-red/20 data-[placeholder]:text-ink-soft",
          ariaInvalid && "border-red-400/70 focus:ring-red-400/25",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent
        position="popper"
        sideOffset={6}
        className="z-[160] max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#101314] p-1 text-white shadow-2xl"
      >
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-white/85 outline-none focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10 data-[state=checked]:text-white"
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
