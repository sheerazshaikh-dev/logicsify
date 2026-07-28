import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route=createFileRoute("/admin/comparisons")({component:()=> <ContentManagerPage type="comparison" title="Comparisons" singular="Comparison" description="Manage balanced decision guides, tables, risks, FAQs, related services, and SEO."/>});
