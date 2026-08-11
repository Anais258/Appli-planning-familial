// A dedicated local Postgres database, separate from the dev DB
// (`passerelle_dev`), so test runs never touch data you're looking at in
// `prisma studio` during development. See README-deploy.md for how this
// database was created locally.
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://passerelle:passerelle@localhost:5432/passerelle_test";
