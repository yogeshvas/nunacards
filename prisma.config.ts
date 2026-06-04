import "dotenv/config";
import { config } from "dotenv";
import { defineConfig, env } from "@prisma/config";

// .env.local takes priority over .env (mirrors Next.js behaviour)
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
