import os from "os";
import { prepareNodeCode } from "../utils/prepareNodeCode.js";

const isWindows = os.platform() === "win32";

/**
 * Language registry — data-driven config for every supported language.
 *
 * Each entry:
 *   id            canonical id stored on submissions
 *   aliases       alternate names accepted from clients
 *   extension     source file extension (no dot)
 *   needsCompile  whether a compile step runs before execution
 *   prepare(code) optional source transform before writing the file
 *   compile(src, artifact) -> { command, args }   (compiled langs only)
 *   artifact(jobId) -> filename for the compiled binary (compiled langs only)
 *   run(target, opts) -> { command, args }   target = artifact (compiled) or src path
 *   addressSpaceLimit  whether `ulimit -v` is a safe memory cap for this runtime.
 *                      Node/JVM reserve huge virtual memory regardless of heap use,
 *                      so `ulimit -v` breaks them — they cap the heap in-runtime instead.
 *
 * Adding a language is now a config entry here plus the toolchain in the Dockerfile.
 */
const languages = {
  cpp: {
    id: "cpp",
    aliases: ["cpp", "c++"],
    extension: "cpp",
    needsCompile: true,
    addressSpaceLimit: true,
    compile: (src, artifact) => ({
      command: "g++",
      args: [src, "-O2", "-std=c++17", "-o", artifact, "-lm"],
    }),
    artifact: (jobId) => `${jobId}.${isWindows ? "exe" : "out"}`,
    run: (target) => ({ command: target, args: [] }),
  },

  c: {
    id: "c",
    aliases: ["c"],
    extension: "c",
    needsCompile: true,
    addressSpaceLimit: true,
    compile: (src, artifact) => ({
      command: "gcc",
      args: [src, "-O2", "-std=c11", "-o", artifact, "-lm"],
    }),
    artifact: (jobId) => `${jobId}.${isWindows ? "exe" : "out"}`,
    run: (target) => ({ command: target, args: [] }),
  },

  py: {
    id: "py",
    aliases: ["py", "python", "python3"],
    extension: "py",
    needsCompile: false,
    addressSpaceLimit: true,
    run: (target) => ({ command: isWindows ? "python" : "python3", args: [target] }),
  },

  js: {
    id: "js",
    aliases: ["js", "javascript", "node"],
    extension: "js",
    needsCompile: false,
    // ulimit -v breaks Node's large virtual-memory reservation; cap the V8 heap instead.
    addressSpaceLimit: false,
    prepare: prepareNodeCode,
    run: (target, { memoryLimitMb } = {}) => ({
      command: "node",
      args: memoryLimitMb
        ? [`--max-old-space-size=${memoryLimitMb}`, target]
        : [target],
    }),
  },
};

// Build an alias -> config lookup table.
const aliasMap = {};
for (const cfg of Object.values(languages)) {
  for (const alias of cfg.aliases) aliasMap[alias.toLowerCase()] = cfg;
}

export const resolveLanguage = (language) => {
  if (!language) return null;
  return aliasMap[String(language).toLowerCase()] || null;
};

export default languages;
