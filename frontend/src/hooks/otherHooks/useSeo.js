import { useEffect } from "react";

const SITE_NAME = "Code Junkie";
const ORIGIN = "https://cj.bymayank.com";

// index.html ships one static title/description for the whole SPA. Client-side
// routing never touches them, so every route looks identical to a crawler and
// every shared link unfurls with the homepage blurb. This patches the head on
// navigation — Google's renderer reads the post-render DOM, so it picks these up.
//
// It is not a substitute for server-rendered HTML: crawlers that don't execute
// JavaScript still see the static tags. It is the best that a purely client-side
// app can do without a prerender step.

const setMeta = (selector, attr, value, content) => {
  if (!content) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel, href) => {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

/**
 * @param {object}  seo
 * @param {string}  seo.title        page title, without the site-name suffix
 * @param {string}  seo.description  ~150 chars; shown as the search snippet
 * @param {string}  seo.path         canonical path, e.g. "/problems/42"
 * @param {boolean} seo.noindex      keep the page out of search results
 * @param {boolean} seo.ready        defer until async data has loaded, so a
 *                                   loading state never becomes the title
 */
export const useSeo = ({
  title,
  description,
  path,
  noindex = false,
  ready = true,
} = {}) => {
  useEffect(() => {
    if (!ready) return;

    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description
    );
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description
    );

    const canonical = path ? `${ORIGIN}${path}` : undefined;
    setLink("canonical", canonical);
    setMeta('meta[property="og:url"]', "property", "og:url", canonical);

    // Only ever added, never removed on cleanup: a stale "noindex" left behind
    // after navigating to an indexable page would quietly deindex it.
    const robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) {
      setMeta('meta[name="robots"]', "name", "robots", "noindex, nofollow");
    } else if (robots) {
      robots.setAttribute("content", "index, follow");
    }
  }, [title, description, path, noindex, ready]);
};

export default useSeo;
