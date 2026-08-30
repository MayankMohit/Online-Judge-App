import { Problem } from "../models/problemModel.js";
import { Contest } from "../models/contestModel.js";

// Absolute URLs are mandatory in a sitemap. CLIENT_URL is already the public
// origin (CORS depends on it being correct), so reuse it rather than adding a
// second source of truth; SITE_URL overrides it if the two ever diverge.
const siteOrigin = () =>
  (process.env.SITE_URL || process.env.CLIENT_URL || "").replace(/\/+$/, "");

const escapeXml = (s) =>
  String(s).replace(
    /[<>&'"]/g,
    (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );

const urlEntry = ({ loc, lastmod, changefreq, priority }) =>
  [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

// Regenerating on every crawler hit would scan the whole problems collection, so
// serve a cached copy. An hour is well inside how often Google refetches a sitemap.
const CACHE_TTL_MS = 60 * 60 * 1000;
let cached = { xml: null, expires: 0 };

export const getSitemap = async (req, res) => {
  try {
    const origin = siteOrigin();
    if (!origin) {
      return res.status(500).type("text/plain").send("SITE_URL is not configured");
    }

    if (cached.xml && Date.now() < cached.expires) {
      res.set("Cache-Control", "public, max-age=3600");
      return res.type("application/xml").send(cached.xml);
    }

    // Only pages a logged-out crawler can actually read: public problems and
    // every contest (the contest page itself is public even while running).
    const [problems, contests] = await Promise.all([
      Problem.find({ isPublic: { $ne: false } })
        .select("problemNumber updatedAt")
        .sort({ problemNumber: 1 })
        .lean(),
      Contest.find()
        .select("updatedAt endTime")
        .sort({ startTime: -1 })
        .limit(500)
        .lean(),
    ]);

    const entries = [
      { loc: `${origin}/`, changefreq: "weekly", priority: "1.0" },
      { loc: `${origin}/problems`, changefreq: "daily", priority: "0.9" },
      { loc: `${origin}/contests`, changefreq: "daily", priority: "0.8" },
      { loc: `${origin}/leaderboards`, changefreq: "daily", priority: "0.6" },
      ...problems.map((p) => ({
        loc: `${origin}/problems/${p.problemNumber}`,
        lastmod: p.updatedAt,
        changefreq: "monthly",
        priority: "0.8",
      })),
      ...contests.map((c) => ({
        loc: `${origin}/contests/${c._id}`,
        lastmod: c.updatedAt,
        changefreq: "weekly",
        priority: "0.5",
      })),
    ];

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      entries.map(urlEntry).join("\n") +
      "\n</urlset>\n";

    cached = { xml, expires: Date.now() + CACHE_TTL_MS };
    res.set("Cache-Control", "public, max-age=3600");
    res.type("application/xml").send(xml);
  } catch (err) {
    console.error("Failed to build sitemap:", err);
    res.status(500).type("text/plain").send("Failed to build sitemap");
  }
};
