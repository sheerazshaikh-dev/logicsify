import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route=createFileRoute("/admin/resources")({component:()=> <ContentManagerPage type="resource" title="Resources" singular="Resource" description="Manage gated checklists, audits, templates, cover images, previews, and downloadable files."/>});
