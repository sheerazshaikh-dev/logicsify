import type {
  ConnectProfile,
  ConnectProfileDestination,
  ConnectProfileField,
  ConnectProfileVisibility,
} from "@/lib/admin-api";

export const TEAM_CONNECT_FIELD_LABELS: Record<ConnectProfileField, string> = {
  avatar: "Avatar",
  headline: "Designation",
  bio: "Biography",
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  address: "Assigned address",
  social_links: "Social links",
  locations: "Assigned location details",
  skills: "Skills",
};

export const TEAM_CONNECT_FIELDS = Object.keys(
  TEAM_CONNECT_FIELD_LABELS,
) as ConnectProfileField[];

export const TEAM_CONNECT_DESTINATIONS: Array<{
  id: ConnectProfileDestination;
  label: string;
}> = [
  { id: "team", label: "Team cards" },
  { id: "connect", label: "Connect page" },
  { id: "export", label: "JPG / PDF" },
];

export const DEFAULT_CONNECT_PROFILE_VISIBILITY: ConnectProfileVisibility = {
  placements: { home: false, about: false, connect: true },
  fields: {
    avatar: { team: true, connect: true, export: true },
    headline: { team: true, connect: true, export: true },
    bio: { team: true, connect: true, export: false },
    email: { team: false, connect: true, export: true },
    phone: { team: false, connect: true, export: true },
    whatsapp: { team: false, connect: true, export: true },
    address: { team: false, connect: true, export: true },
    social_links: { team: true, connect: true, export: true },
    locations: { team: true, connect: true, export: false },
    skills: { team: true, connect: true, export: false },
  },
};

export function normalizeConnectProfileVisibility(
  visibility?: Partial<ConnectProfileVisibility> | null,
): ConnectProfileVisibility {
  const fields = { ...DEFAULT_CONNECT_PROFILE_VISIBILITY.fields };
  for (const field of TEAM_CONNECT_FIELDS) {
    fields[field] = {
      ...DEFAULT_CONNECT_PROFILE_VISIBILITY.fields[field],
      ...(visibility?.fields?.[field] || {}),
    };
  }
  fields.bio.export = false;
  fields.locations.export = false;
  fields.skills.export = false;
  return {
    placements: {
      ...DEFAULT_CONNECT_PROFILE_VISIBILITY.placements,
      ...(visibility?.placements || {}),
    },
    fields,
  };
}

export function fieldVisible(
  profile: Pick<ConnectProfile, "visibility_json">,
  field: ConnectProfileField,
  destination: ConnectProfileDestination,
) {
  return normalizeConnectProfileVisibility(profile.visibility_json).fields[field][destination];
}
