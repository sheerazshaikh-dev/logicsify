import { useRouterState } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CMS_ICON_MARKUP } from "@/lib/cms-icons";
import { getCmsContentItem } from "@/lib/logicsify-api";
import {
  cmsTemplateVersionForPath,
  type CmsNativeContent,
  type CmsNativeField,
  type VisualAdminPage as CmsPage,
} from "@/lib/cms-visual";
import { toVisualPage } from "@/lib/visual-page-api";
import { normalizePublicHref, resolveContentFromPath } from "@/lib/content-routes";

export type CmsDomSection = {
  key: string;
  label: string;
  index: number;
  hidden: boolean;
  is_clone?: boolean;
  source_key?: string;
};

export type CmsRepeatContext = {
  section_key: string;
  collection_path: string;
  item_path: string;
  item_index: number;
  item_count: number;
  label: string;
};

export type CmsElementContext = {
  section_key: string;
  element_path: string;
  tag: string;
  label: string;
};

export type CmsDomInventory = {
  fields: CmsNativeField[];
  sections: CmsDomSection[];
};

type RuntimeMessage =
  | { type: "bb-cms:update"; native_content: CmsNativeContent }
  | { type: "bb-cms:request-inventory" }
  | { type: "bb-cms:focus-field"; key: string }
  | {
      type: "bb-cms:mutate-repeat";
      action: "duplicate" | "delete";
      context: CmsRepeatContext;
    }
  | { type: "bb-cms:export-section"; section_key: string; request_id: string };

function normalizeRuntimePath(value: unknown): string {
  const path =
    String(value || "")
      .trim()
      .split(/[?#]/, 1)[0] || "/";
  const normalized = `/${path.replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? "/" : normalized;
}

function expectedPagePath(page: CmsPage): string {
  return normalizeRuntimePath(page.full_path ? `/${page.full_path}` : "/");
}

function expectedTemplateVersion(page: CmsPage): number {
  return cmsTemplateVersionForPath(expectedPagePath(page));
}

/**
 * Visual snapshots are DOM-template-specific. Earlier hotfixes did not record
 * the route a snapshot came from, which allowed a homepage snapshot to be
 * attached to a service and replace its markup. Legacy snapshots are therefore
 * quarantined until the page is opened in the corrected editor and saved again.
 */
function prepareNativeContent(
  content: CmsNativeContent | undefined,
  page: CmsPage,
): CmsNativeContent {
  const raw = content && typeof content === "object" ? content : {};
  const expectedPath = expectedPagePath(page);
  const expectedVersion = expectedTemplateVersion(page);
  const savedPath = raw.template_path ? normalizeRuntimePath(raw.template_path) : "";
  const savedVersion = Number(raw.template_version || 0);
  if (!savedPath || savedPath !== expectedPath || savedVersion !== expectedVersion) {
    return { template_path: expectedPath, template_version: expectedVersion };
  }
  return { ...raw, template_path: expectedPath, template_version: expectedVersion };
}

function isCmsExcludedPath(pathname: string): boolean {
  return (
    pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/cms-preview/")
  );
}

function slugPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function elementPath(element: Element, section: Element): string {
  if (element === section) return "root";
  const parts: string[] = [];
  let cursor: Element | null = element;
  while (cursor && cursor !== section) {
    const parentElement: HTMLElement | null = cursor.parentElement;
    if (!parentElement) break;
    const index = Array.from(parentElement.children).indexOf(cursor);
    parts.unshift(`${cursor.tagName.toLowerCase()}.${Math.max(0, index)}`);
    cursor = parentElement;
  }
  return parts.join("/") || "root";
}

function elementAtPath(section: HTMLElement, path: string): HTMLElement | null {
  if (!path || path === "root") return section;
  let cursor: HTMLElement = section;
  for (const part of path.split("/")) {
    const match = part.match(/^([a-z0-9-]+)\.(\d+)$/i);
    if (!match) return null;
    const index = Number(match[2]);
    const child = cursor.children.item(index);
    if (!(child instanceof HTMLElement) || child.tagName.toLowerCase() !== match[1].toLowerCase())
      return null;
    cursor = child;
  }
  return cursor;
}

function fieldLabel(
  type: "text" | "attribute" | "icon",
  value: string,
  attribute?: string,
  tag?: string,
): string {
  if (type === "icon") return "Icon";
  if (type === "attribute") {
    if (attribute === "href") return "Link URL";
    if (attribute === "src" && tag === "img") return "Image URL";
    if (attribute === "alt") return "Image alt text";
    if (attribute === "placeholder") return "Field placeholder";
    if (attribute === "target") return "Link target";
    if (attribute === "poster") return "Video poster";
    return `${attribute || "Attribute"}`;
  }
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 80 ? `${compact.slice(0, 77)}…` : compact || "Text";
}

function resolveFieldValue(
  fieldKey: string,
  defaultValue: string,
  role: CmsNativeField["role"] | undefined,
  nativeContent: CmsNativeContent,
): string {
  const values = nativeContent.fields || {};
  if (!Object.prototype.hasOwnProperty.call(values, fieldKey)) return defaultValue;
  const stored = String(values[fieldKey]);

  // v9 could snapshot animated counters while they were still at zero. Only repair
  // records created before counter-aware metadata existed; a deliberate zero saved
  // after this update remains untouched.
  if (role === "counter" && stored.trim() === "0" && defaultValue.trim() !== "0") {
    const previousMeta = nativeContent.field_meta?.[fieldKey];
    if (previousMeta?.role !== "counter") return defaultValue;
  }

  return stored;
}

function findPageRoot(wrapper: HTMLElement): HTMLElement | null {
  const first = Array.from(wrapper.children).find((child) => child instanceof HTMLElement);
  if (!(first instanceof HTMLElement)) return null;
  const main = Array.from(first.children).find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.tagName.toLowerCase() === "main" && child.id === "main",
  );
  return main || first;
}

function shouldSkipElement(element: Element, pageRoot: Element): boolean {
  if (element === pageRoot) return false;
  if (element.closest("[data-cms-ignore='true']")) return true;
  if (element.closest("script,style,noscript")) return true;
  if (element.closest("svg") && element.tagName.toLowerCase() !== "svg") return true;
  return false;
}

function managedDirectChildren(pageRoot: HTMLElement): HTMLElement[] {
  return Array.from(pageRoot.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.dataset.cmsIgnore !== "true",
  );
}

function baseDirectChildren(pageRoot: HTMLElement): HTMLElement[] {
  return managedDirectChildren(pageRoot).filter(
    (child) => child.dataset.cmsCloneSection !== "true",
  );
}

function getBaseSectionKey(section: HTMLElement, index: number): string {
  if (section.dataset.cmsPersistedSectionKey) return section.dataset.cmsPersistedSectionKey;
  const idPart = section.id ? `id-${slugPart(section.id)}` : "";
  return idPart || `${section.tagName.toLowerCase()}-${index + 1}`;
}

function stripCmsAnnotations(root: Element): void {
  const nodes = [root, ...Array.from(root.querySelectorAll("*"))];
  nodes.forEach((node) => {
    if (!(node instanceof HTMLElement || node instanceof SVGElement)) return;
    Array.from(node.attributes).forEach((attribute) => {
      if (attribute.name.startsWith("data-cms-")) node.removeAttribute(attribute.name);
    });
    node.classList.remove("cms-selected-element");
  });
}

function sanitizedInnerHtml(section: HTMLElement): string {
  const clone = section.cloneNode(true) as HTMLElement;
  stripCmsAnnotations(clone);
  return clone.innerHTML;
}

function sanitizedOuterHtml(section: HTMLElement): string {
  const clone = section.cloneNode(true) as HTMLElement;
  stripCmsAnnotations(clone);
  return clone.outerHTML;
}

function createElementFromHtml(html: string): HTMLElement | null {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const element = template.content.firstElementChild;
  return element instanceof HTMLElement ? element : null;
}

function placeBeforeFooter(pageRoot: HTMLElement, element: HTMLElement): void {
  const directFooter = Array.from(pageRoot.children).find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      (child.tagName.toLowerCase() === "footer" || child.dataset.cmsFixedPosition === "bottom"),
  );
  if (directFooter) pageRoot.insertBefore(element, directFooter);
  else pageRoot.appendChild(element);
}

function applyStructuralContent(
  pageRoot: HTMLElement,
  nativeContent: CmsNativeContent,
  editMode = false,
): void {
  managedDirectChildren(pageRoot)
    .filter((section) => section.dataset.cmsCloneSection === "true")
    .forEach((section) => section.remove());

  const sectionHtml = nativeContent.section_html || {};
  const baseSections = baseDirectChildren(pageRoot);
  const baseKeys = baseSections.map((section, index) => getBaseSectionKey(section, index));
  const requestedDeleted = new Set(
    (nativeContent.deleted_sections || []).filter((key) => baseKeys.includes(key)),
  );
  // A stale editor snapshot must never delete the whole live page. The editor can
  // still show that state so the administrator can undo it before saving.
  const deletedSections =
    !editMode && baseSections.length > 0 && requestedDeleted.size >= baseSections.length
      ? new Set<string>()
      : requestedDeleted;

  baseSections.forEach((section, index) => {
    const key = getBaseSectionKey(section, index);
    section.dataset.cmsPersistedSectionKey = key;
    section.dataset.cmsSectionKey = key;
    if (deletedSections.has(key)) {
      section.remove();
      return;
    }
    if (Object.prototype.hasOwnProperty.call(sectionHtml, key)) {
      const html = String(sectionHtml[key] || "").trim();
      // Older builds could save an empty section snapshot while the iframe was
      // still loading. Ignore that corrupt snapshot on the public website.
      if (html || editMode) section.innerHTML = html;
    }
  });

  (nativeContent.section_clones || []).forEach((cloneRecord) => {
    const clone = createElementFromHtml(cloneRecord.html);
    if (!clone) return;
    clone.dataset.cmsCloneSection = "true";
    clone.dataset.cmsPersistedSectionKey = cloneRecord.id;
    clone.dataset.cmsSectionKey = cloneRecord.id;
    clone.dataset.cmsSourceSectionKey = cloneRecord.source_section_key;
    if (Object.prototype.hasOwnProperty.call(sectionHtml, cloneRecord.id)) {
      const html = String(sectionHtml[cloneRecord.id] || "").trim();
      if (html || editMode) clone.innerHTML = html;
    }
    placeBeforeFooter(pageRoot, clone);
  });
}

function clearInventoryAnnotations(pageRoot: HTMLElement): void {
  pageRoot
    .querySelectorAll<HTMLElement | SVGElement>("[data-cms-field-keys],[data-cms-editable]")
    .forEach((element) => {
      element.removeAttribute("data-cms-field-keys");
      element.removeAttribute("data-cms-editable");
      element.classList.remove("cms-selected-element");
    });
}

function extractLucideName(svg: SVGElement): string {
  const names = Array.from(svg.classList).filter(
    (name) => name.startsWith("lucide-") && name !== "lucide-icon",
  );
  return names[0]?.replace(/^lucide-/, "") || "circle";
}

function replaceLucideIcon(svg: SVGElement, name: string): void {
  const markup = CMS_ICON_MARKUP[name as keyof typeof CMS_ICON_MARKUP];
  // Preserve the original Lucide SVG when the CMS does not have markup for it.
  // Older builds replaced unknown icons with a plain circle, which made Plus,
  // Chevron, Arrow and several other icons appear missing.
  if (!markup) return;
  Array.from(svg.classList).forEach((className) => {
    if (className.startsWith("lucide-") && className !== "lucide-icon")
      svg.classList.remove(className);
  });
  svg.classList.add("lucide", `lucide-${name}`);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = markup;
}

function buildInventory(
  pageRoot: HTMLElement,
  nativeContent: CmsNativeContent = {},
): CmsDomInventory {
  clearInventoryAnnotations(pageRoot);
  const fields: CmsNativeField[] = [];
  const sections: CmsDomSection[] = [];
  const fieldValues = nativeContent.fields || {};
  const directChildren = managedDirectChildren(pageRoot);

  directChildren.forEach((section, sectionIndex) => {
    const key = section.dataset.cmsPersistedSectionKey || getBaseSectionKey(section, sectionIndex);
    section.dataset.cmsSectionKey = key;
    const heading = section.querySelector("h1,h2,h3,[data-cms-section-title]");
    const labelText = heading?.textContent?.replace(/\s+/g, " ").trim();
    const cloneRecord = (nativeContent.section_clones || []).find((record) => record.id === key);
    const label =
      cloneRecord?.label ||
      labelText ||
      section.getAttribute("aria-label") ||
      section.id ||
      `Section ${sectionIndex + 1}`;
    sections.push({
      key,
      label: label.length > 90 ? `${label.slice(0, 87)}…` : label,
      index: sectionIndex,
      hidden: (nativeContent.hidden_sections || []).includes(key),
      is_clone: section.dataset.cmsCloneSection === "true",
      source_key: section.dataset.cmsSourceSectionKey,
    });

    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || shouldSkipElement(parent, pageRoot)) return NodeFilter.FILTER_REJECT;
        const text = node.nodeValue || "";
        if (!text.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let textNode = walker.nextNode();
    while (textNode) {
      const parent = textNode.parentElement;
      if (parent) {
        const nodeIndex = Array.from(parent.childNodes).indexOf(textNode as ChildNode);
        const keyPath = elementPath(parent, section);
        const fieldKey = `text:${key}:${keyPath}:node.${Math.max(0, nodeIndex)}`;
        const counterDefault = parent.dataset.counterDefault;
        const role: CmsNativeField["role"] | undefined =
          counterDefault !== undefined ? "counter" : undefined;
        const defaultValue =
          counterDefault !== undefined ? counterDefault : textNode.nodeValue || "";
        const field: CmsNativeField = {
          key: fieldKey,
          type: "text",
          value: resolveFieldValue(fieldKey, defaultValue, role, nativeContent),
          default_value: defaultValue,
          tag: parent.tagName.toLowerCase(),
          label: fieldLabel("text", defaultValue),
          section_key: key,
          section_label: label,
          role,
        };
        fields.push(field);
        const existing = parent.dataset.cmsFieldKeys ? parent.dataset.cmsFieldKeys.split("|") : [];
        if (!existing.includes(fieldKey)) existing.push(fieldKey);
        parent.dataset.cmsFieldKeys = existing.join("|");
        parent.dataset.cmsEditable = "true";
      }
      textNode = walker.nextNode();
    }

    section.querySelectorAll("svg.lucide").forEach((element) => {
      if (!(element instanceof SVGElement) || shouldSkipElement(element, pageRoot)) return;
      const path = elementPath(element, section);
      const defaultValue = extractLucideName(element);
      const fieldKey = `icon:${key}:${path}`;
      const field: CmsNativeField = {
        key: fieldKey,
        type: "icon",
        value: Object.prototype.hasOwnProperty.call(fieldValues, fieldKey)
          ? String(fieldValues[fieldKey])
          : defaultValue,
        default_value: defaultValue,
        tag: "svg",
        label: fieldLabel("icon", defaultValue),
        section_key: key,
        section_label: label,
      };
      fields.push(field);
      const existing = element.dataset.cmsFieldKeys ? element.dataset.cmsFieldKeys.split("|") : [];
      if (!existing.includes(fieldKey)) existing.push(fieldKey);
      element.dataset.cmsFieldKeys = existing.join("|");
      element.dataset.cmsEditable = "true";
    });

    const attrConfig: Array<{ selector: string; attributes: string[] }> = [
      { selector: "a", attributes: ["href", "target"] },
      { selector: "img", attributes: ["src", "alt"] },
      { selector: "input,textarea", attributes: ["placeholder"] },
      { selector: "iframe", attributes: ["src", "title"] },
      { selector: "video", attributes: ["src", "poster"] },
      { selector: "source", attributes: ["src"] },
    ];

    attrConfig.forEach(({ selector, attributes }) => {
      section.querySelectorAll(selector).forEach((element) => {
        if (!(element instanceof HTMLElement) || shouldSkipElement(element, pageRoot)) return;
        const path = elementPath(element, section);
        attributes.forEach((attribute) => {
          const defaultValue = element.getAttribute(attribute) || "";
          const fieldKey = `attr:${key}:${path}:${attribute}`;
          const field: CmsNativeField = {
            key: fieldKey,
            type: "attribute",
            attribute,
            value: Object.prototype.hasOwnProperty.call(fieldValues, fieldKey)
              ? String(fieldValues[fieldKey])
              : defaultValue,
            default_value: defaultValue,
            tag: element.tagName.toLowerCase(),
            label: fieldLabel("attribute", defaultValue, attribute, element.tagName.toLowerCase()),
            section_key: key,
            section_label: label,
          };
          fields.push(field);
          const existing = element.dataset.cmsFieldKeys
            ? element.dataset.cmsFieldKeys.split("|")
            : [];
          if (!existing.includes(fieldKey)) existing.push(fieldKey);
          element.dataset.cmsFieldKeys = existing.join("|");
          element.dataset.cmsEditable = "true";
        });
      });
    });
  });

  return { fields, sections };
}

function applyField(pageRoot: HTMLElement, field: CmsNativeField, value: string): void {
  const editable = pageRoot.querySelectorAll<HTMLElement | SVGElement>("[data-cms-field-keys]");
  for (const element of editable) {
    const keys = (element.getAttribute("data-cms-field-keys") || "").split("|");
    if (!keys.includes(field.key)) continue;
    if (field.type === "icon" && element instanceof SVGElement) {
      replaceLucideIcon(element, value);
      return;
    }
    if (field.type === "attribute" && field.attribute) {
      const nextValue = field.attribute === "href" ? normalizePublicHref(value) : value;
      if (nextValue === "") element.removeAttribute(field.attribute);
      else element.setAttribute(field.attribute, nextValue);
      return;
    }
    const match = field.key.match(/:node\.(\d+)$/);
    const index = match ? Number(match[1]) : -1;
    const node = index >= 0 ? element.childNodes.item(index) : null;
    if (node?.nodeType === Node.TEXT_NODE) node.nodeValue = value;
    return;
  }
}

function applySectionSettings(
  pageRoot: HTMLElement,
  sections: CmsDomSection[],
  nativeContent: CmsNativeContent,
  editMode = false,
): void {
  const sectionMap = new Map<string, HTMLElement>();
  sections.forEach((section) => {
    const element = pageRoot.querySelector<HTMLElement>(
      `[data-cms-section-key="${CSS.escape(section.key)}"]`,
    );
    if (element) sectionMap.set(section.key, element);
  });
  const requestedHidden = new Set(
    (nativeContent.hidden_sections || []).filter((key) => sectionMap.has(key)),
  );
  const hidden =
    !editMode && sectionMap.size > 0 && requestedHidden.size >= sectionMap.size
      ? new Set<string>()
      : requestedHidden;
  sectionMap.forEach((element, key) => {
    element.style.display = hidden.has(key) ? "none" : "";
  });

  const desired = [...(nativeContent.section_order || [])];
  sections.forEach((section) => {
    if (!desired.includes(section.key)) desired.push(section.key);
  });

  const directFooter = Array.from(pageRoot.children).find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      (child.tagName.toLowerCase() === "footer" || child.dataset.cmsFixedPosition === "bottom"),
  );

  desired.forEach((key) => {
    const element = sectionMap.get(key);
    if (!element) return;
    if (directFooter) pageRoot.insertBefore(element, directFooter);
    else pageRoot.appendChild(element);
  });
}

function clearElementLinkAnnotations(pageRoot: HTMLElement): void {
  pageRoot.querySelectorAll<HTMLElement>("[data-cms-link-key]").forEach((element) => {
    element.removeAttribute("data-cms-link-key");
    element.removeAttribute("data-cms-link-href");
    element.removeAttribute("data-cms-link-target");
    element.classList.remove("cms-linked-element");
    if (element.dataset.cmsLinkAddedRole === "true") {
      element.removeAttribute("role");
      element.removeAttribute("data-cms-link-added-role");
    }
    if (element.dataset.cmsLinkAddedTabindex === "true") {
      element.removeAttribute("tabindex");
      element.removeAttribute("data-cms-link-added-tabindex");
    }
    if (element.dataset.cmsLinkPreviousCursor !== undefined) {
      element.style.cursor = element.dataset.cmsLinkPreviousCursor;
      element.removeAttribute("data-cms-link-previous-cursor");
    }
  });
}

function applyElementLinks(pageRoot: HTMLElement, nativeContent: CmsNativeContent): void {
  clearElementLinkAnnotations(pageRoot);
  Object.entries(nativeContent.element_links || {}).forEach(([linkKey, link]) => {
    if (!link.href || (nativeContent.deleted_sections || []).includes(link.section_key)) return;
    const section = pageRoot.querySelector<HTMLElement>(
      `[data-cms-section-key="${CSS.escape(link.section_key)}"]`,
    );
    if (!section) return;
    const element = elementAtPath(section, link.element_path);
    if (!element) return;
    element.dataset.cmsLinkKey = linkKey;
    element.dataset.cmsLinkHref = normalizePublicHref(link.href);
    element.dataset.cmsLinkTarget = link.target || "_self";
    element.classList.add("cms-linked-element");
    element.dataset.cmsLinkPreviousCursor = element.style.cursor || "";
    element.style.cursor = "pointer";
    if (!element.hasAttribute("role") && !element.matches("a,button,input,select,textarea")) {
      element.setAttribute("role", "link");
      element.dataset.cmsLinkAddedRole = "true";
    }
    if (!element.hasAttribute("tabindex") && !element.matches("a,button,input,select,textarea")) {
      element.setAttribute("tabindex", "0");
      element.dataset.cmsLinkAddedTabindex = "true";
    }
  });
}

function applyNativeContent(
  pageRoot: HTMLElement,
  inventory: CmsDomInventory,
  nativeContent: CmsNativeContent,
  editMode = false,
): void {
  inventory.fields.forEach((field) => {
    const value = resolveFieldValue(
      field.key,
      field.default_value || "",
      field.role,
      nativeContent,
    );
    applyField(pageRoot, field, value);
  });
  applySectionSettings(pageRoot, inventory.sections, nativeContent, editMode);
  applyElementLinks(pageRoot, nativeContent);
}

function forceEditorVisibility(pageRoot: HTMLElement): void {
  pageRoot.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
    element.setAttribute("data-visible", "true");
    element.style.removeProperty("opacity");
    element.style.removeProperty("visibility");
  });

  pageRoot
    .querySelectorAll<HTMLElement>("[hidden], [aria-hidden='true'][data-reveal]")
    .forEach((element) => {
      if (element.hasAttribute("data-reveal")) element.removeAttribute("hidden");
    });
}

function refreshRuntime(
  pageRoot: HTMLElement,
  nativeContent: CmsNativeContent,
  editMode = false,
): CmsDomInventory {
  applyStructuralContent(pageRoot, nativeContent, editMode);
  if (editMode) forceEditorVisibility(pageRoot);
  const inventory = buildInventory(pageRoot, nativeContent);
  applyNativeContent(pageRoot, inventory, nativeContent, editMode);
  if (editMode) forceEditorVisibility(pageRoot);
  return inventory;
}

function postToParent(payload: unknown): void {
  if (window.parent !== window) window.parent.postMessage(payload, window.location.origin);
}

function structuralSignature(element: Element): string {
  const classes = Array.from(element.classList)
    .filter((className) => !className.startsWith("cms-"))
    .sort()
    .join(".");
  return `${element.tagName.toLowerCase()}|${classes}`;
}

function repeatContextForTarget(
  target: HTMLElement | SVGElement,
  section: HTMLElement,
): CmsRepeatContext | null {
  let cursor: Element | null = target;
  while (cursor && cursor !== section) {
    const parentElement: HTMLElement | null = cursor.parentElement;
    if (!parentElement) break;
    const siblings: Element[] = Array.from(parentElement.children);
    const signature = structuralSignature(cursor);
    const matching = siblings.filter((sibling) => structuralSignature(sibling) === signature);
    if (matching.length >= 2 && cursor instanceof HTMLElement) {
      const itemIndex = siblings.indexOf(cursor);
      const heading = cursor.querySelector("h2,h3,h4,strong");
      const label =
        heading?.textContent?.replace(/\s+/g, " ").trim() ||
        cursor.textContent?.replace(/\s+/g, " ").trim() ||
        "Card / item";
      return {
        section_key: section.dataset.cmsSectionKey || "",
        collection_path: elementPath(parentElement, section),
        item_path: elementPath(cursor, section),
        item_index: itemIndex,
        item_count: siblings.length,
        label: label.length > 70 ? `${label.slice(0, 67)}…` : label,
      };
    }
    cursor = parentElement;
  }
  return null;
}

function removeSectionFields(content: CmsNativeContent, sectionKey: string): CmsNativeContent {
  const meta = content.field_meta || {};
  const fields = content.fields || {};
  const nextMeta = Object.fromEntries(
    Object.entries(meta).filter(([, field]) => field.section_key !== sectionKey),
  );
  const removedKeys = new Set(
    Object.entries(meta)
      .filter(([, field]) => field.section_key === sectionKey)
      .map(([key]) => key),
  );
  const nextFields = Object.fromEntries(
    Object.entries(fields).filter(([key]) => !removedKeys.has(key)),
  );
  return { ...content, fields: nextFields, field_meta: nextMeta };
}

function mergeInventorySection(
  content: CmsNativeContent,
  inventory: CmsDomInventory,
  sectionKey: string,
): CmsNativeContent {
  const sectionFields = inventory.fields.filter((field) => field.section_key === sectionKey);
  const fields = { ...(content.fields || {}) };
  const meta = { ...(content.field_meta || {}) };
  sectionFields.forEach((field) => {
    fields[field.key] = field.value;
    const { value: _value, ...fieldMeta } = field;
    meta[field.key] = fieldMeta;
  });
  return { ...content, fields, field_meta: meta };
}

function RuntimeSurface({
  children,
  page,
  editMode,
}: {
  children: ReactNode;
  page?: CmsPage | null;
  editMode?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initialNativeContent = page ? prepareNativeContent(page.native_content, page) : {};
  const [nativeContent, setNativeContent] = useState<CmsNativeContent>(initialNativeContent);
  const nativeContentRef = useRef<CmsNativeContent>(initialNativeContent);
  const inventoryRef = useRef<CmsDomInventory>({ fields: [], sections: [] });

  useEffect(() => {
    const next = page ? prepareNativeContent(page.native_content, page) : {};
    nativeContentRef.current = next;
    setNativeContent(next);
  }, [page]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !page) return;
    const pageRoot = findPageRoot(wrapper);
    if (!pageRoot) return;

    const timer = window.setTimeout(() => {
      const inventory = refreshRuntime(pageRoot, nativeContentRef.current, Boolean(editMode));
      inventoryRef.current = inventory;
      if (editMode) {
        document.body.classList.add("cms-edit-mode");
        postToParent({
          type: "bb-cms:inventory",
          page_id: page.id,
          inventory,
          native_content: nativeContentRef.current,
        });
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [page, editMode]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !page) return;
    const pageRoot = findPageRoot(wrapper);
    if (!pageRoot) return;

    const followLinkedElement = (element: HTMLElement) => {
      const href = element.dataset.cmsLinkHref;
      if (!href) return;
      const target = element.dataset.cmsLinkTarget || "_self";
      if (target === "_blank") window.open(href, "_blank", "noopener,noreferrer");
      else window.location.assign(href);
    };

    const onLinkedClick = (event: MouseEvent) => {
      if (editMode) return;
      const rawTarget = event.target instanceof Element ? event.target : null;
      const linked = rawTarget?.closest<HTMLElement>("[data-cms-link-href]");
      if (!linked || !pageRoot.contains(linked)) return;
      const nestedInteractive = rawTarget?.closest("a,button,input,select,textarea,label");
      if (nestedInteractive && nestedInteractive !== linked) return;
      event.preventDefault();
      followLinkedElement(linked);
    };

    const onLinkedKeyDown = (event: KeyboardEvent) => {
      if (editMode || (event.key !== "Enter" && event.key !== " ")) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      const linked = target?.closest<HTMLElement>("[data-cms-link-href]");
      if (!linked || !pageRoot.contains(linked)) return;
      event.preventDefault();
      followLinkedElement(linked);
    };

    pageRoot.addEventListener("click", onLinkedClick);
    pageRoot.addEventListener("keydown", onLinkedKeyDown);
    return () => {
      pageRoot.removeEventListener("click", onLinkedClick);
      pageRoot.removeEventListener("keydown", onLinkedKeyDown);
    };
  }, [editMode, page]);

  useEffect(() => {
    if (!editMode) return;
    const wrapper = wrapperRef.current;
    if (!wrapper || !page) return;
    const pageRoot = findPageRoot(wrapper);
    if (!pageRoot) return;

    const postInventory = (content = nativeContentRef.current) => {
      postToParent({
        type: "bb-cms:inventory",
        page_id: page.id,
        inventory: inventoryRef.current,
        native_content: content,
      });
    };

    const onClick = (event: MouseEvent) => {
      const rawTarget = event.target instanceof Element ? event.target : null;
      const target = rawTarget?.closest<HTMLElement | SVGElement>("[data-cms-field-keys]") || null;
      if (!target || !pageRoot.contains(target)) return;
      event.preventDefault();
      event.stopPropagation();
      pageRoot
        .querySelectorAll(".cms-selected-element")
        .forEach((node) => node.classList.remove("cms-selected-element"));
      target.classList.add("cms-selected-element");
      const keys = (target.getAttribute("data-cms-field-keys") || "").split("|").filter(Boolean);
      const fields = inventoryRef.current.fields.filter((field) => keys.includes(field.key));
      const section = target.closest<HTMLElement>("[data-cms-section-key]");
      const repeat_context = section ? repeatContextForTarget(target, section) : null;
      const compactLabel =
        target.textContent?.replace(/\s+/g, " ").trim() ||
        target.getAttribute("aria-label") ||
        target.tagName.toLowerCase();
      const element_context = section
        ? {
            section_key: section.dataset.cmsSectionKey || "",
            element_path: elementPath(target, section),
            tag: target.tagName.toLowerCase(),
            label: compactLabel.length > 80 ? `${compactLabel.slice(0, 77)}…` : compactLabel,
          }
        : null;
      postToParent({
        type: "bb-cms:select",
        page_id: page.id,
        fields,
        repeat_context,
        element_context,
      });
    };

    const onSubmit = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const onMessage = (event: MessageEvent<RuntimeMessage>) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === "bb-cms:update") {
        const next = prepareNativeContent(event.data.native_content || {}, page);
        nativeContentRef.current = next;
        setNativeContent(next);
        inventoryRef.current = refreshRuntime(pageRoot, next, editMode);
        postInventory(next);
      }
      if (event.data?.type === "bb-cms:request-inventory") {
        postInventory();
      }
      if (event.data?.type === "bb-cms:focus-field") {
        const focusedKey = event.data.key;
        const element = Array.from(
          pageRoot.querySelectorAll<HTMLElement | SVGElement>("[data-cms-field-keys]"),
        ).find((candidate) =>
          (candidate.getAttribute("data-cms-field-keys") || "").split("|").includes(focusedKey),
        );
        if (element) {
          pageRoot
            .querySelectorAll(".cms-selected-element")
            .forEach((node) => node.classList.remove("cms-selected-element"));
          element.classList.add("cms-selected-element");
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      if (event.data?.type === "bb-cms:export-section") {
        const message = event.data;
        const section = pageRoot.querySelector<HTMLElement>(
          `[data-cms-section-key="${CSS.escape(message.section_key)}"]`,
        );
        const inventorySection = inventoryRef.current.sections.find(
          (item) => item.key === message.section_key,
        );
        postToParent({
          type: "bb-cms:section-export",
          request_id: message.request_id,
          section_key: message.section_key,
          label: inventorySection?.label || "Duplicated section",
          html: section ? sanitizedOuterHtml(section) : "",
        });
      }
      if (event.data?.type === "bb-cms:mutate-repeat") {
        const context = event.data.context;
        const section = pageRoot.querySelector<HTMLElement>(
          `[data-cms-section-key="${CSS.escape(context.section_key)}"]`,
        );
        if (!section) return;
        const collection = elementAtPath(section, context.collection_path);
        if (!collection) return;
        const item = collection.children.item(context.item_index);
        if (!(item instanceof HTMLElement)) return;
        if (event.data.action === "delete") {
          if (collection.children.length <= 1) {
            postToParent({
              type: "bb-cms:notice",
              notice: { type: "error", text: "A card group must keep at least one item." },
            });
            return;
          }
          item.remove();
        } else {
          const duplicate = item.cloneNode(true) as HTMLElement;
          stripCmsAnnotations(duplicate);
          item.insertAdjacentElement("afterend", duplicate);
        }

        const html = sanitizedInnerHtml(section);
        let next: CmsNativeContent = {
          ...nativeContentRef.current,
          template_path: expectedPagePath(page),
          template_version: expectedTemplateVersion(page),
          section_html: {
            ...(nativeContentRef.current.section_html || {}),
            [context.section_key]: html,
          },
        };
        next = removeSectionFields(next, context.section_key);
        let inventory = refreshRuntime(pageRoot, next, editMode);
        next = mergeInventorySection(next, inventory, context.section_key);
        inventory = refreshRuntime(pageRoot, next, editMode);
        inventoryRef.current = inventory;
        nativeContentRef.current = next;
        setNativeContent(next);
        postToParent({
          type: "bb-cms:structure-changed",
          page_id: page.id,
          inventory,
          native_content: next,
        });
      }
    };

    pageRoot.addEventListener("click", onClick, true);
    pageRoot.addEventListener("submit", onSubmit, true);
    window.addEventListener("message", onMessage);
    return () => {
      document.body.classList.remove("cms-edit-mode");
      pageRoot.removeEventListener("click", onClick, true);
      pageRoot.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("message", onMessage);
    };
  }, [editMode, page]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const pageRoot = wrapper ? findPageRoot(wrapper) : null;
    if (!pageRoot || !page) return;
    inventoryRef.current = refreshRuntime(pageRoot, nativeContent, editMode);
  }, [editMode, nativeContent, page]);

  return (
    <div ref={wrapperRef} data-cms-runtime={editMode ? "editor" : "public"}>
      {children}
    </div>
  );
}

export function PublicCmsDomRuntime({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [page, setPage] = useState<CmsPage | null>(null);
  const [editMode, setEditMode] = useState(false);
  const excluded = isCmsExcludedPath(pathname);

  useEffect(() => {
    let active = true;
    if (excluded) {
      setPage(null);
      setEditMode(false);
      return () => {
        active = false;
      };
    }

    const params = new URLSearchParams(window.location.search);
    const editing = params.get("cms_edit") === "1";
    const pageId = Number(params.get("cms_page_id") || 0);
    setEditMode(editing);

    if (editing && pageId > 0) {
      void import("@/lib/admin-api")
        .then(({ getContent }) => getContent(pageId))
        .then((item) => {
          if (active) setPage(toVisualPage(item));
        })
        .catch(() => {
          if (active) setPage(null);
        });
    } else {
      const resolved = resolveContentFromPath(pathname);
      if (!resolved) {
        setPage(null);
      } else {
        void getCmsContentItem(resolved.type, resolved.slug).then((item) => {
          if (!active) return;
          setPage(item ? toVisualPage(item) : null);
        });
      }
    }

    return () => {
      active = false;
    };
  }, [pathname, excluded]);

  const pageMatchesPath =
    Boolean(page) && expectedPagePath(page as CmsPage) === normalizeRuntimePath(pathname);
  const nativeContent = pageMatchesPath ? page?.native_content || {} : {};
  const hasSavedVisualContent =
    Object.keys(nativeContent.fields || {}).length > 0 ||
    Object.keys(nativeContent.section_html || {}).length > 0 ||
    (nativeContent.section_clones || []).length > 0 ||
    (nativeContent.hidden_sections || []).length > 0 ||
    (nativeContent.deleted_sections || []).length > 0 ||
    Object.keys(nativeContent.element_links || {}).length > 0;

  const runtimePage =
    !excluded && pageMatchesPath && page && (editMode || hasSavedVisualContent) ? page : null;

  return (
    <RuntimeSurface page={runtimePage} editMode={Boolean(runtimePage && editMode)}>
      {children}
    </RuntimeSurface>
  );
}

export function CmsPreviewRuntime({ page, children }: { page: CmsPage; children: ReactNode }) {
  return (
    <RuntimeSurface page={page} editMode>
      {children}
    </RuntimeSurface>
  );
}
