import postgres from "postgres";

async function reset() {
  const sql = postgres(process.env.DATABASE_URL!);
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
  await sql.end();
  console.log("Database reset — schema dropped and recreated.");
}

reset().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
