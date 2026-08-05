import { lazy, Suspense, useEffect, useState } from "react";

const ToasterRuntime = lazy(() => import("@/components/toaster-runtime"));

export function DeferredToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timer = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <ToasterRuntime />
    </Suspense>
  ) : null;
}
