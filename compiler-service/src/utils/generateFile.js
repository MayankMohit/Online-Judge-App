import { writeFileSync, mkdirSync, existsSync } from "fs";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const codesDir = path.join(__dirname, "..", "..", "temp", "codes");

if (!existsSync(codesDir)) {
  mkdirSync(codesDir, { recursive: true });
}

export const generateFile = (extension, code) => {
  const jobId = uuid();
  const fileName = `${jobId}.${extension}`;
  const filePath = path.join(codesDir, fileName);
  writeFileSync(filePath, code);
  return filePath;
};

/**
 * Writes source into its own per-job directory under a FIXED filename.
 * Needed for languages whose source file must be named after a class
 * (e.g. Java's `Main.java`) — the per-job dir avoids `Main.class` collisions
 * across concurrent judges.
 *
 * @returns {{ filePath, dir }}
 */
export const generateIsolatedFile = (sourceName, extension, code) => {
  const jobId = uuid();
  const dir = path.join(codesDir, jobId);
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${sourceName}.${extension}`);
  writeFileSync(filePath, code);
  return { filePath, dir };
};
