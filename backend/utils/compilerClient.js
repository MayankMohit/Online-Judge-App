import axios from "axios";
import http from "http";
import https from "https";

// Shared axios instance for talking to the compiler service. Keep-alive agents
// reuse TCP connections across judge/run/validate calls instead of doing a fresh
// handshake every time — noticeably lower latency and fewer sockets under load.
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

export const compilerBaseUrl =
  process.env.COMPILER_URL || "http://localhost:5001";

// A finite default timeout so a wedged compiler call can't hang a judge worker or
// request forever. Generous enough for a full batch judge (compile + many runs);
// individual calls (e.g. /run) override it. Env-tunable.
const COMPILER_TIMEOUT_MS = Number(process.env.COMPILER_TIMEOUT_MS) || 120000;

export const compilerClient = axios.create({
  baseURL: compilerBaseUrl,
  httpAgent,
  httpsAgent,
  timeout: COMPILER_TIMEOUT_MS,
});
