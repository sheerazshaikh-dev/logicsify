import { createFileRoute } from "@tanstack/react-router";
import { ConnectProfilesPage } from "@/routes/admin/connect-profiles";

export const Route = createFileRoute("/admin/team-connect")({ component: ConnectProfilesPage });
