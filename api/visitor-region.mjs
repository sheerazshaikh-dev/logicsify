const SAUDI_REGION_COUNTRIES = new Set(["SA", "AE", "BH", "KW", "OM", "QA"]);

export default function handler(request, response) {
  const country = firstHeader(
    request.headers["x-vercel-ip-country"] || request.headers["cf-ipcountry"],
  )
    .trim()
    .toUpperCase();
  const region =
    country === "PK" ? "pakistan" : SAUDI_REGION_COUNTRIES.has(country) ? "saudi" : "portugal";

  response.setHeader("Cache-Control", "private, max-age=3600");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.status(200).json({ country, region });
}

function firstHeader(value) {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}
