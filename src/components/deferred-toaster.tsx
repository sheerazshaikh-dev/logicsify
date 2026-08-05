import { lazy, Suspense, useEffect, useState } from "react";

const ToasterRuntime = lazy(() => import("@/components/toaster-runtime"));

export function DeferredToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const requestIdleCallback = window.requestIdleCallback;
    if (typeof requestIdleCallback === "function") {
      const idleId = requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timer = globalThis.setTimeout(() => setReady(true), 1500);
    return () => globalThis.clearTimeout(timer);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <ToasterRuntime />
    </Suspense>
  ) : null;
}
