export const prepareNodeCode = (code) => `
import fs from "fs";

// Automatically read all input from stdin
const input = fs.readFileSync(0, "utf8").trim();

// User's code starts here
${code}
`;
