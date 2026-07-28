import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route=createFileRoute("/admin/integrations")({component:()=> <ContentManagerPage type="integration" title="Integrations" singular="Integration" description="Manage supported platform labels, categories, logos, accessibility text, and visibility. Do not use partnership claims unless verified."/>});
