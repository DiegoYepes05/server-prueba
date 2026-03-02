import { defineConfig } from 'prisma/config';

const postgresUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

export default defineConfig({
  datasource: {
    url: postgresUrl,
  },
  migrations: {
    seed: 'ts-node ./prisma/seed.ts',
  },
});
