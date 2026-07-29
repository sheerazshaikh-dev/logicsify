import { createFileRoute } from "@tanstack/react-router";
import { createElement, useEffect, useState, type ComponentType } from "react";
import { AdminLoading } from "@/components/admin/admin-ui";
import { validateAdminPath } from "@/lib/admin-api";
import { Route as AccountRoute } from "@/routes/admin/account";
import { Route as AdministratorsRoute } from "@/routes/admin/administrators";
import { Route as BookingsRoute } from "@/routes/admin/bookings";
import { Route as CareersRoute } from "@/routes/admin/careers";
import { Route as CaseStudiesRoute } from "@/routes/admin/case-studies";
import { Route as ComparisonsRoute } from "@/routes/admin/comparisons";
import { Route as DashboardRoute } from "@/routes/admin/dashboard";
import { Route as EngagementModelsRoute } from "@/routes/admin/engagement-models";
import { Route as GlobalStylingRoute } from "@/routes/admin/global-styling";
import { Route as GuidesRoute } from "@/routes/admin/guides";
import { Route as InsightsRoute } from "@/routes/admin/insights";
import { Route as IntegrationsRoute } from "@/routes/admin/integrations";
import { Route as LeadsRoute } from "@/routes/admin/leads";
import { Route as LoginRoute } from "@/routes/admin/login";
import { Route as MediaRoute } from "@/routes/admin/media";
import { Route as MenusRoute } from "@/routes/admin/menus";
import { Route as PagesRoute } from "@/routes/admin/pages";
import { Route as SecurityRoute } from "@/routes/admin/security";
import { Route as ServicesRoute } from "@/routes/admin/services";
import { Route as SettingsRoute } from "@/routes/admin/settings";
import { Route as TeamRoute } from "@/routes/admin/team";
import { Route as TestimonialsRoute } from "@/routes/admin/testimonials";
import { Route as TrashRoute } from "@/routes/admin/trash";

export const Route = createFileRoute("/control/$adminSlug/$")({ component: CustomAdminRoute });

const routes: Record<string, unknown> = {
  login: LoginRoute, dashboard: DashboardRoute, pages: PagesRoute, services: ServicesRoute,
  "case-studies": CaseStudiesRoute, insights: InsightsRoute, careers: CareersRoute,
  testimonials: TestimonialsRoute, team: TeamRoute, guides: GuidesRoute,
  comparisons: ComparisonsRoute, "engagement-models": EngagementModelsRoute,
  integrations: IntegrationsRoute, leads: LeadsRoute, bookings: BookingsRoute, media: MediaRoute,
  menus: MenusRoute, settings: SettingsRoute, "global-styling": GlobalStylingRoute,
  administrators: AdministratorsRoute, trash: TrashRoute, security: SecurityRoute, "audit-logs": SecurityRoute, account: AccountRoute,
};

function routeComponent(route: unknown): ComponentType | null {
  const component = (route as { options?: { component?: ComponentType } })?.options?.component;
  return component || null;
}

function CustomAdminRoute() {
  const { adminSlug, _splat } = Route.useParams();
  const [valid, setValid] = useState<boolean | null>(null);
  const section = (_splat || "dashboard").replace(/^\//, "");

  useEffect(() => {
    validateAdminPath(adminSlug).then(setValid).catch(() => setValid(false));
  }, [adminSlug]);

  if (valid === null) return <div className="min-h-dvh bg-slate-50"><AdminLoading label="Checking secure admin entry…" /></div>;
  if (!valid) return <main className="grid min-h-dvh place-items-center bg-[#190A2F] p-6 text-white"><div className="text-center"><p className="text-sm uppercase tracking-[0.2em] text-white/45">404</p><h1 className="mt-4 text-4xl font-semibold">Page not found</h1></div></main>;

  const target = routes[section] || routes.dashboard;
  const Component = routeComponent(target);
  return Component ? createElement(Component) : null;
}
