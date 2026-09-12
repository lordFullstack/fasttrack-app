import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = Number(process.env.PORT ?? 3000);
const DATABASE_URL = process.env.DATABASE_URL ?? "";

// Print (masked) connection target at boot — this alone tells us whether
// Render even received the env var correctly, before any request happens.
function maskedUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username}:${"*".repeat(8)}@${u.host}${u.pathname}`;
  } catch {
    return "COULD NOT PARSE DATABASE_URL — is it set at all?";
  }
}
console.log(`[boot] Node ${process.version}`);
console.log(`[boot] PORT=${PORT}`);
console.log(`[boot] DATABASE_URL target: ${maskedUrl(DATABASE_URL)}`);

const isLocalDb = /localhost|127\.0\.0\.1/.test(DATABASE_URL);
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 10_000,
  ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
});

// A pg Pool emits 'error' on an idle client's connection failing in the
// background; unhandled, this crashes the whole Node process. Logging it
// instead keeps the server alive AND gives us the real error in Render logs.
pool.on("error", (err) => {
  console.error("[pg pool background error]", err);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", node: process.version, time: new Date().toISOString() });
});

app.get("/db-ping", async (_req, res) => {
  const startedAt = Date.now();
  try {
    const result = await pool.query("SELECT NOW() as now, current_user as db_user");
    res.json({
      ok: true,
      dbTime: result.rows[0].now,
      dbUser: result.rows[0].db_user,
      tookMs: Date.now() - startedAt,
    });
  } catch (err) {
    console.error("[/db-ping] failed:", err);
    res.status(500).json({
      ok: false,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
      tookMs: Date.now() - startedAt,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[fasttrack-skeleton] listening on ${PORT}`);
});
