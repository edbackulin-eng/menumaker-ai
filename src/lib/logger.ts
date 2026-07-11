import "server-only";
import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Plain pino() (no transport) writes NDJSON straight to stdout, which is
 * exactly what Vercel's log collector expects. `pino-pretty` is only wired
 * in for local development readability — worker-thread-based transports
 * are a known source of friction under bundlers/serverless, so this stays
 * off in production rather than risk a broken log pipe in prod for a
 * cosmetic dev-only benefit.
 */
export const logger = pino({
  level: isDev ? "debug" : "info",
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        },
      }
    : {}),
});
