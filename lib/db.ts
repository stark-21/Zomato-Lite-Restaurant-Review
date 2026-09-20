import { neon } from "@neondatabase/serverless";

// One shared database client. Reads the secret from the environment,
// so the password never appears in the code.
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }
  return neon(url);
}
