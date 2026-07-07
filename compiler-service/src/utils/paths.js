import path from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";

// Single source of truth for the service's temp directories so the file writer,
// compile cache, and janitor all agree on locations (previously each derived its
// own, one via __dirname and one via process.cwd()).
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const tempRoot = path.join(__dirname, "..", "..", "temp");
export const codesDir = path.join(tempRoot, "codes"); // per-job source files
export const outputsDir = path.join(tempRoot, "outputs"); // compiled artifacts (misses)
export const cacheDir = path.join(tempRoot, "cache"); // content-addressed artifacts

for (const dir of [codesDir, outputsDir, cacheDir]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
