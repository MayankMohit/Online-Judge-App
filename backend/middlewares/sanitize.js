/**
 * Strips MongoDB operator injection from request bodies. A JSON body like
 * `{"email": {"$ne": null}}` would otherwise reach a query as an operator object.
 * We recursively delete keys that start with `$` or contain `.` (Mongo operators /
 * dotted paths); string values are untouched, so code submissions and normal input
 * pass through unchanged.
 *
 * Only req.body is sanitized: req.params are always strings, and req.query is a
 * read-only getter in Express 5 (mutating it throws).
 */
const sanitize = (value) => {
  if (Array.isArray(value)) {
    value.forEach(sanitize);
    return;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
      } else {
        sanitize(value[key]);
      }
    }
  }
};

export const sanitizeBody = (req, _res, next) => {
  if (req.body && typeof req.body === "object") sanitize(req.body);
  next();
};
