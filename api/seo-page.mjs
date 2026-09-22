const API_BASE = (process.env.VITE_API_URL || "https://backend.logicsify.com/api").replace(/\/$/, "");
const SITE_ORIGIN = "https://logicsify.com";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/logicsify-logo-dark.png`;

const TYPE_CONFIG = {
  insight: { segment: "insights", schema: "BlogPosting", label: "Insight" },
  case_study: { segment: "work", schema: "Article", label: "Case Study" },
  portfolio: { segment: "portfolio", schema: "CreativeWork", label: "Portfolio Project" },
  resource: { segment: "guides", schema: "CreativeWork", label: "Guide" },
  comparison: { segment: "comparisons", schema: "Article", label: "Comparison" },
};

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).end("Method Not Allowed");
  }

  const type = String(request.query?.type || "");
  const slug = cleanSlug(request.query?.slug);
  const config = TYPE_CONFIG[type];
  if (!config || !slug) return response.status(404).end("Not Found");

  const [contentResult, template] = await Promise.all([
    fetchContent(type, slug),
    fetchAppTemplate(request),
  ]);

  if (contentResult.status === 404) return response.status(404).end("Not Found");
  if (!contentResult.item || !template) {
    response.setHeader("Retry-After", "60");
    return response.status(503).end("Temporarily unavailable");
  }

  const html = buildHtml(template, contentResult.item, config, slug);
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  response.setHeader("Vary", "Accept-Encoding");
  return request.method === "HEAD" ? response.status(200).end() : response.status(200).send(html);
}

async function fetchContent(type, slug) {
  try {
    const result = await fetch(
      `${API_BASE}/public/content/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Logicsify-SEO-Renderer/1.0",
        },
        redirect: "manual",
        signal: AbortSignal.timeout(6000),
      },
    );
    if (result.status === 404) return { status: 404, item: null };
    if (!result.ok) return { status: 503, item: null };
    const contentType = String(result.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("json")) return { status: 503, item: null };
    const payload = await result.json();
    if (!payload?.success || !payload?.data) return { status: 404, item: null };
    return { status: 200, item: payload.data };
  } catch {
    return { status: 503, item: null };
  }
}

async function fetchAppTemplate(request) {
  try {
    const host = String(
      request.headers["x-forwarded-host"] ||
      request.headers.host ||
      "logicsify.com",
    ).split(",")[0].trim();
    const protocol = String(request.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
    const url = `${protocol}://${host}/index.html?seo-template=1`;
    const result = await fetch(url, {
      headers: {
        Accept: "text/html",
        "User-Agent": "Logicsify-SEO-Renderer/1.0",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
    if (!result.ok) return null;
    const html = await result.text();
    return html.includes('<div id="root"></div>') ? html : null;
  } catch {
    return null;
  }
}

function buildHtml(template, item, config, slug) {
  const content = item.content_json && typeof item.content_json === "object" ? item.content_json : {};
  const seo = item.seo_json && typeof item.seo_json === "object" ? item.seo_json : {};
  const canonical = absoluteUrl(seo.canonical) || `${SITE_ORIGIN}/${config.segment}/${encodeURIComponent(slug)}`;
  const title = cleanText(seo.title) || `${cleanText(item.title) || config.label} | Logicsify`;
  const description =
    cleanText(seo.description) ||
    cleanText(item.excerpt) ||
    summarize(content.body) ||
    `${config.label} published by Logicsify.`;
  const image = absoluteUrl(seo.og_image || item.featured_image) || DEFAULT_IMAGE;
  const h1 = cleanText(item.title) || config.label;
  const published = normalizeDate(item.published_at);
  const modified = normalizeDate(item.updated_at || item.published_at);
  const authorName = cleanText(content.author) || "Logicsify";
  const bodyText = summarize(content.body, 3500);
  const sections = normalizeSections(content.sections).slice(0, 8);
  const extra = detailFacts(typeKey(config), content);
  const faqs = normalizeFaqs(content.faqs);
  const noindex = Boolean(seo.noindex);
  const schema = makeSchema({
    config,
    canonical,
    title,
    description,
    image,
    h1,
    published,
    modified,
    authorName,
    faqs,
  });

  let html = stripSeo(template);
  const head = [
    `<title data-seo-server="true">${escapeHtml(title)}</title>`,
    meta("name", "description", description),
    meta(
      "name",
      "robots",
      noindex
        ? "noindex,nofollow,noarchive"
        : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    ),
    `<link rel="canonical" href="${escapeAttr(canonical)}" data-seo-server="true" />`,
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    meta("property", "og:type", config.schema === "BlogPosting" || config.schema === "Article" ? "article" : "website"),
    meta("property", "og:url", canonical),
    meta("property", "og:site_name", "Logicsify"),
    meta("property", "og:image", image),
    meta("property", "og:image:alt", h1),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", title),
    meta("name", "twitter:description", description),
    meta("name", "twitter:image", image),
    `<script type="application/ld+json" data-seo-server="true">${escapeScriptJson(schema)}</script>`,
    fallbackStyle(),
  ].join("\n    ");

  html = html.replace("</head>", `    ${head}\n  </head>`);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${fallbackMarkup({ config, h1, description, bodyText, sections, extra, canonical })}</div>`,
  );
  return html;
}

function typeKey(config) {
  return Object.entries(TYPE_CONFIG).find(([, value]) => value === config)?.[0] || "";
}

function makeSchema({ config, canonical, title, description, image, h1, published, modified, authorName, faqs }) {
  const graph = [
    {
      "@type": config.schema,
      "@id": `${canonical}#content`,
      url: canonical,
      name: h1,
      headline: title,
      description,
      image,
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
      ...(config.schema === "CreativeWork"
        ? { creator: { "@id": `${SITE_ORIGIN}/#organization` } }
        : {
            author:
              authorName === "Logicsify"
                ? { "@id": `${SITE_ORIGIN}/#organization` }
                : { "@type": "Person", name: authorName },
          }),
      ...(published ? { datePublished: published } : {}),
      ...(modified ? { dateModified: modified } : {}),
      mainEntityOfPage: canonical,
      inLanguage: "en",
    },
  ];

  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function fallbackMarkup({ config, h1, description, bodyText, sections, extra, canonical }) {
  const sectionMarkup = sections
    .map(({ title, body }) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></section>`)
    .join("");
  const extraMarkup = extra
    .map(({ title, body }) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></section>`)
    .join("");
  const bodyMarkup = bodyText
    ? `<section><h2>Overview</h2><p>${escapeHtml(bodyText)}</p></section>`
    : "";

  return `<div data-seo-fallback="true">
    <header class="seo-fallback-header">
      <a href="/" aria-label="Logicsify home"><img src="/logicsify-logo-light.png" alt="Logicsify" width="180" height="51" /></a>
      <nav aria-label="Primary">
        <a href="/services">Services</a>
        <a href="/services/white-label-development">White Label</a>
        <a href="/work">Case Studies</a>
        <a href="/insights">Insights</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
    <main class="seo-fallback-main">
      <p class="seo-fallback-eyebrow">${escapeHtml(config.label)} · Logicsify</p>
      <h1>${escapeHtml(h1)}</h1>
      <p class="seo-fallback-intro">${escapeHtml(description)}</p>
      ${bodyMarkup}${sectionMarkup}${extraMarkup}
      <p class="seo-fallback-links"><a href="${escapeAttr(canonical)}">Canonical page</a> · <a href="/technical-roadmap">Get a Free Technical Roadmap</a> · <a href="/contact">Contact Logicsify</a></p>
    </main>
  </div>`;
}

function detailFacts(type, content) {
  const rows = [];
  if (type === "case_study") {
    pushFact(rows, "Client", content.client_name);
    pushFact(rows, "Industry", content.industry || content.category);
    pushFact(rows, "Challenge", content.challenge);
    pushFact(rows, "Solution", content.solution);
    pushList(rows, "Services delivered", content.services);
    pushList(rows, "Technology and systems", content.technology_stack || content.technologies);
    pushList(rows, "Results", content.measurable_results || content.results);
  } else if (type === "portfolio") {
    pushFact(rows, "Client or brand", content.client_name || content.company);
    pushFact(rows, "Project type", content.project_type || content.category);
    pushList(rows, "Services", content.services);
    pushList(rows, "Technology", content.technology_stack);
    pushList(rows, "Project highlights", content.highlights);
  } else if (type === "comparison") {
    pushFact(rows, "Option A", content.option_a);
    pushFact(rows, "Option B", content.option_b);
    pushFact(rows, "Decision summary", content.summary || content.introduction);
    pushFact(rows, "Cost considerations", content.cost_considerations);
    pushFact(rows, "Setup time", content.setup_time);
    pushFact(rows, "Flexibility", content.flexibility);
  } else if (type === "resource") {
    pushFact(rows, "Guide summary", content.summary || content.introduction);
    pushList(rows, "Topics covered", content.topics || content.sections_list);
  } else if (type === "insight") {
    pushFact(rows, "Category", content.category);
    pushList(rows, "Topics", content.tags);
  }
  return rows.slice(0, 8);
}

function pushFact(rows, title, value) {
  const body = cleanText(value);
  if (body) rows.push({ title, body });
}

function pushList(rows, title, value) {
  const values = normalizeList(value);
  if (values.length) rows.push({ title, body: values.join(", ") });
}

function normalizeSections(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((section) => {
      const record = section && typeof section === "object" ? section : {};
      return {
        title: cleanText(record.title || record.heading || record.eyebrow),
        body: cleanText(record.body || record.text || record.description),
      };
    })
    .filter((section) => section.title && section.body);
}

function normalizeFaqs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      if (entry && typeof entry === "object") {
        const question = cleanText(entry.question || entry.q);
        const answer = cleanText(entry.answer || entry.a);
        return question && answer ? [{ question, answer }] : [];
      }
      const line = cleanText(entry);
      if (!line) return [];
      const [question, ...rest] = line.split("|");
      const answer = rest.join("|").trim();
      return question?.trim() && answer ? [{ question: question.trim(), answer }] : [];
    })
    .slice(0, 12);
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.flatMap((item) => normalizeList(item));
  const text = cleanText(value);
  if (!text) return [];
  return text.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
}

function summarize(value, max = 900) {
  const text = cleanText(value);
  if (!text) return "";
  return text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function cleanText(value) {
  if (value == null) return "";
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSlug(value) {
  const slug = String(value || "").trim();
  return /^[a-z0-9][a-z0-9-]{0,180}$/i.test(slug) ? slug : "";
}

function absoluteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw, SITE_ORIGIN).toString();
  } catch {
    return "";
  }
}

function normalizeDate(value) {
  if (!value) return undefined;
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function stripSeo(html) {
  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta[^>]+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, "");
}

function meta(attribute, key, value) {
  return `<meta ${attribute}="${escapeAttr(key)}" content="${escapeAttr(value)}" data-seo-server="true" />`;
}

function fallbackStyle() {
  return `<style data-seo-server="true">
    [data-seo-fallback]{min-height:100vh;background:#050706;color:#fff;font-family:Sora,Inter,system-ui,sans-serif}
    .seo-fallback-header{max-width:1360px;margin:auto;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid rgba(255,255,255,.08)}
    .seo-fallback-header>a{display:inline-flex;align-items:center;color:#fff;text-decoration:none}
    .seo-fallback-header>a img{display:block;width:180px;height:auto}
    .seo-fallback-header nav{display:flex;gap:20px;flex-wrap:wrap}
    .seo-fallback-header nav a,.seo-fallback-links a{color:#9fe06d;text-decoration:none}
    .seo-fallback-main{max-width:1180px;margin:auto;padding:72px 32px 96px}
    .seo-fallback-eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8bcf3c}
    .seo-fallback-main h1{font-size:clamp(42px,7vw,82px);line-height:1;letter-spacing:-.04em;max-width:1000px;margin:18px 0 24px}
    .seo-fallback-intro{font-size:clamp(18px,2vw,23px);line-height:1.65;max-width:900px;color:rgba(255,255,255,.76)}
    .seo-fallback-main section{max-width:900px;margin-top:44px}
    .seo-fallback-main h2{font-size:clamp(25px,4vw,40px);letter-spacing:-.02em;margin:0 0 14px}
    .seo-fallback-main section p{font-size:17px;line-height:1.8;color:rgba(255,255,255,.7)}
    .seo-fallback-links{margin-top:54px}
    @media(max-width:720px){.seo-fallback-header nav{display:none}.seo-fallback-main{padding-top:46px}.seo-fallback-main h1{font-size:46px}}
  </style>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll("\n", " ");
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
