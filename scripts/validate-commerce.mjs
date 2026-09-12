import { readFileSync, readdirSync } from "node:fs";

const migrations = readdirSync("supabase/migrations").filter((name) => name.endsWith(".sql"));
const timestamps = migrations.map((name) => name.split("_")[0]);
const duplicates = timestamps.filter((value, index) => timestamps.indexOf(value) !== index);
if (duplicates.length)
  throw new Error(`Duplicate migration timestamps: ${[...new Set(duplicates)].join(", ")}`);

const required = [
  "markets",
  "orders",
  "inventory",
  "payment_attempts",
  "outbox_events",
  "role_permissions",
];
const sql = migrations
  .map((name) => readFileSync(`supabase/migrations/${name}`, "utf8"))
  .join("\n");
for (const entity of required) {
  if (!sql.includes(entity)) throw new Error(`Missing commerce entity: ${entity}`);
}

const env = readFileSync(".env.example", "utf8");
for (const line of env.split(/\r?\n/)) {
  if (/^[A-Z0-9_]*(SECRET|PRIVATE|SERVICE_ROLE|PASSWORD|TOKEN)[A-Z0-9_]*\s*=\s*\S+/.test(line)) {
    throw new Error(`Possible secret committed in .env.example: ${line.split("=")[0]}`);
  }
}
console.log(
  `Commerce validation passed (${migrations.length} migrations, ${required.length} core entities).`,
);
