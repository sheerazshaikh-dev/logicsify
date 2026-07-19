import {
  getContent,
  listContent,
  updateContent,
  uploadMedia as uploadAdminMedia,
  type ContentItem,
} from "@/lib/admin-api";
import type { CmsContentItem } from "@/lib/logicsify-api";
import type { CmsNativeContent, VisualAdminPage } from "@/lib/cms-visual";
import { contentPublicPath, visualEditorPath, type PublicContentType } from "@/lib/content-routes";

type PageLike = ContentItem | CmsContentItem;

function contentNativeContent(item: PageLike): CmsNativeContent {
  const raw = item.content_json?.native_content;
  return raw && typeof raw === "object" ? (raw as CmsNativeContent) : {};
}

function itemType(item: PageLike): PublicContentType {
  return item.content_type as PublicContentType;
}

export function toVisualPage(item: PageLike): VisualAdminPage {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    full_path: visualEditorPath(itemType(item), item.slug)?.replace(/^\//, "") || "",
    status: item.status as VisualAdminPage["status"],
    updated_at: "updated_at" in item ? item.updated_at : undefined,
    native_content: contentNativeContent(item),
  };
}

export async function fetchAdminPage(id: number): Promise<VisualAdminPage> {
  return toVisualPage(await getContent(id));
}

/** Returns every public content item that can be selected as an internal link. */
export async function fetchAdminPages(): Promise<VisualAdminPage[]> {
  const types: PublicContentType[] = [
    "page",
    "service",
    "industry",
    "case_study",
    "insight",
    "career",
  ];
  const results = await Promise.all(
    types.map((type) =>
      listContent({ type, status: "all", page: 1, perPage: 250 }).catch(() => ({
        data: [] as ContentItem[],
        meta: { page: 1, pages: 1, total: 0, counters: {} },
      })),
    ),
  );

  return results
    .flatMap((result) => result.data)
    .filter((item) => Boolean(contentPublicPath(item.content_type, item.slug)))
    .map(toVisualPage);
}

export async function saveAdminPage(
  page: Partial<VisualAdminPage> & { id?: number; title: string },
): Promise<{ id: number; full_path: string }> {
  if (!page.id) throw new Error("Save the content item before using the visual editor.");
  const existing = await getContent(page.id);
  const saved = await updateContent(page.id, {
    ...existing,
    title: page.title || existing.title,
    content_json: {
      ...(existing.content_json || {}),
      native_content: page.native_content || {},
    },
  });
  return {
    id: saved.id,
    full_path: visualEditorPath(saved.content_type, saved.slug)?.replace(/^\//, "") || "",
  };
}

export const uploadMedia = uploadAdminMedia;

export type { VisualAdminPage } from "@/lib/cms-visual";
