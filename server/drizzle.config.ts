import type { Config } from 'drizzle-kit';
import path from 'path';

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'sqlite',
  dbCredentials: {
    url: path.resolve(__dirname, './db.sqlite'),
  },
} satisfies Config; 