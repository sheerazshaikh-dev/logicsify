function asAbsoluteUrl(value: string, base = document.baseURI) {
  if (!value || /^(data:|blob:|mailto:|tel:|javascript:|#)/i.test(value)) return value;
  try {
    return new URL(value, base).href;
  } catch {
    return value;
  }
}

function escapeClosingStyle(value: string) {
  return value.replace(/<\/style/gi, "<\\/style");
}

function rewriteCssUrls(css: string, baseUrl: string) {
  return css.replace(/url\((['"]?)([^)'"\s]+)\1\)/gi, (_match, quote: string, raw: string) => {
    if (/^(data:|blob:|https?:|#)/i.test(raw)) return `url(${quote}${raw}${quote})`;
    return `url(${quote}${asAbsoluteUrl(raw, baseUrl)}${quote})`;
  });
}

async function collectStylesheets() {
  const inline: string[] = [];
  const links: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    const href = sheet.href || document.baseURI;
    try {
      const rules = Array.from(sheet.cssRules || []);
      inline.push(rewriteCssUrls(rules.map((rule) => rule.cssText).join("\n"), href));
    } catch {
      if (sheet.href) {
        try {
          const response = await fetch(sheet.href, { credentials: "same-origin" });
          if (response.ok) {
            inline.push(rewriteCssUrls(await response.text(), sheet.href));
            continue;
          }
        } catch {
          // Keep an absolute stylesheet fallback when CSS cannot be inlined.
        }
        links.push(asAbsoluteUrl(sheet.href));
      }
    }
  }

  document.querySelectorAll("style").forEach((style) => {
    if (style.textContent?.trim()) inline.push(style.textContent);
  });

  return {
    css: inline.join("\n\n"),
    links: Array.from(new Set(links)),
  };
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read image."));
    reader.readAsDataURL(blob);
  });
}

async function embedImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    images.map(async (image) => {
      const original = image.getAttribute("src") || "";
      if (!original || original.startsWith("data:")) return;
      const absolute = asAbsoluteUrl(original);
      image.setAttribute("src", absolute);
      image.removeAttribute("srcset");
      try {
        const response = await fetch(absolute, { credentials: "omit", mode: "cors" });
        if (!response.ok) return;
        image.setAttribute("src", await blobToDataUrl(await response.blob()));
      } catch {
        // Absolute URLs remain valid if an asset cannot be embedded because of CORS.
      }
    }),
  );
}

function rewriteDocumentLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[href]").forEach((node) => {
    const href = node.getAttribute("href");
    if (href) node.setAttribute("href", asAbsoluteUrl(href));
  });
  root.querySelectorAll<HTMLElement>("[src]").forEach((node) => {
    const src = node.getAttribute("src");
    if (src && !src.startsWith("data:")) node.setAttribute("src", asAbsoluteUrl(src));
  });
}

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "logicsify-company-profile";
}

export async function downloadCompanyProfileHtml(root: HTMLElement, siteName = "Logicsify") {
  if ("fonts" in document) await document.fonts.ready;

  const clone = root.cloneNode(true) as HTMLElement;
  clone.classList.add("profile-export-root");
  clone.removeAttribute("tabindex");
  clone.querySelectorAll('[data-profile-export-ignore="true"]').forEach((node) => node.remove());
  rewriteDocumentLinks(clone);
  await embedImages(clone);

  const styles = await collectStylesheets();
  const htmlStyle = document.documentElement.getAttribute("style") || "";
  const bodyClass = document.body.className || "";
  const exportCss = `
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 1920px !important;
  min-width: 1920px !important;
  max-width: 1920px !important;
  background: var(--theme-background, #fff);
  overflow-x: hidden;
}
body { min-height: 100%; }
.profile-export-root {
  width: 1920px !important;
  min-width: 1920px !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  scroll-snap-type: none !important;
}
.profile-export-root .profile-slide {
  box-sizing: border-box !important;
  width: 1920px !important;
  min-width: 1920px !important;
  max-width: 1920px !important;
  height: 1080px !important;
  min-height: 1080px !important;
  max-height: 1080px !important;
  overflow: hidden !important;
  break-after: page;
  page-break-after: always;
}
.profile-export-root .profile-slide:last-child {
  break-after: auto;
  page-break-after: auto;
}
.profile-export-root [data-profile-slide-frame="true"] {
  height: 100% !important;
  min-height: 100% !important;
  grid-template-rows: auto 1fr auto !important;
}
.profile-export-root [data-profile-slide-content="true"] {
  display: flex !important;
  min-height: 0 !important;
  align-items: center !important;
}
@page { size: 1920px 1080px; margin: 0; }
@media print {
  html, body { width: 1920px !important; min-width: 1920px !important; }
  .profile-export-root .profile-slide { break-inside: avoid; }
}
`;

  const stylesheetLinks = styles.links
    .map((href) => `<link rel="stylesheet" href="${href.replace(/"/g, "&quot;")}">`)
    .join("\n");

  const output = `<!doctype html>
<html lang="en" style="${htmlStyle.replace(/"/g, "&quot;")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${siteName.replace(/[<>]/g, "")} Company Profile</title>
${stylesheetLinks}
<style>${escapeClosingStyle(styles.css)}\n${exportCss}</style>
</head>
<body class="${bodyClass.replace(/"/g, "&quot;")}">
${clone.outerHTML}
</body>
</html>`;

  const blob = new Blob([output], { type: "text/html;charset=utf-8" });
  const source = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = source;
  anchor.download = `${safeFilename(siteName)}-company-profile-1920x1080.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(source), 1500);
}
