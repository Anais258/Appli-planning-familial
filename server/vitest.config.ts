import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: "./tests/globalSetup.ts",
    setupFiles: ["./tests/setupEnv.ts"],
    hookTimeout: 20000,
    // All test files share one SQLite file (see tests/testDbUrl.ts) and
    // tests/helpers.ts truncates the User table in an afterEach — running
    // files in parallel lets one file's cleanup delete rows another file's
    // in-flight request depends on. Sequential files avoid that race.
    fileParallelism: false,
  },
});
