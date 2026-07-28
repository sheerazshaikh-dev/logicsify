import { createFileRoute } from "@tanstack/react-router";
import { ContentManagerPage } from "@/components/admin/content-manager";
export const Route=createFileRoute("/admin/engagement-models")({component:()=> <ContentManagerPage type="engagement_model" title="Engagement Models" singular="Engagement Model" description="Manage delivery models, responsibilities, advantages, tradeoffs, and optional future pricing notes."/>});
