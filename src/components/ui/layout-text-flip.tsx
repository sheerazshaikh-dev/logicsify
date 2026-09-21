import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LayoutTextFlip({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
  className,
  textClassName,
  wordClassName,
}: {
  text?: string;
  words?: string[];
  duration?: number;
  className?: string;
  textClassName?: string;
  wordClassName?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || words.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % words.length);
    }, duration);

    return () => window.clearInterval(interval);
  }, [duration, reduceMotion, words.length]);

  const currentWord = words[currentIndex] ?? words[0] ?? "";

  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-2.5 md:gap-3",
        className,
      )}
    >
      <motion.span
        layout
        className={cn(
          "text-lg font-semibold tracking-tight md:text-2xl",
          textClassName,
        )}
      >
        {text}
      </motion.span>

      <motion.span
        layout
        className={cn(
          "relative inline-flex max-w-full overflow-hidden rounded-xl border px-3.5 py-2 text-lg font-bold tracking-tight shadow-sm md:px-4 md:text-2xl",
          wordClassName,
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={reduceMotion ? "reduced-motion" : currentIndex}
            initial={reduceMotion ? false : { y: -28, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { y: 32, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block max-w-full whitespace-nowrap"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  );
}
