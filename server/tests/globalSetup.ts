import { execSync } from "node:child_process";
import { TEST_DATABASE_URL } from "./testDbUrl";

// Runs once in the main Vitest process before any test worker starts.
// Resets the throwaway Postgres test database (passerelle_test) to match the
// current Prisma schema so route tests hit a real (but disposable)
// database instead of mocking Prisma.
export async function setup() {
  execSync("npx prisma db push --force-reset --skip-generate", {
    cwd: __dirname + "/..",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });
}
