import { SiteLayout } from "@/components/site-layout";

export function PublicRouteLoading() {
  return (
    <SiteLayout>
      <section className="min-h-[70vh] bg-cream pt-36 md:pt-44" aria-busy="true">
        <div className="container-page animate-pulse">
          <div className="h-3 w-28 rounded-full bg-ink/10" />
          <div className="mt-8 h-14 max-w-3xl rounded-2xl bg-ink/10 md:h-20" />
          <div className="mt-4 h-14 max-w-2xl rounded-2xl bg-ink/10" />
          <div className="mt-8 h-5 max-w-xl rounded-full bg-ink/10" />
          <div className="mt-3 h-5 max-w-lg rounded-full bg-ink/10" />
        </div>
      </section>
    </SiteLayout>
  );
}
