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
