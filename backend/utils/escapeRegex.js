// Escapes special regex characters in user input so it can be safely
// used inside a MongoDB $regex query without throwing on invalid patterns
// (e.g. an unbalanced "[").
export const escapeRegex = (str = "") =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
