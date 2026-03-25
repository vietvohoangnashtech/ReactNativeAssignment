import {schemaMigrations} from '@nozbe/watermelondb/Schema/migrations';

// Version 1 is the initial schema — WatermelonDB creates it automatically from
// schema.ts. Migrations are only needed for upgrades FROM an existing version.
// When adding new tables/columns in future, bump schema.ts version to 2 and add
// a migration block { toVersion: 2, steps: [...] } here.
export const migrations = schemaMigrations({
  migrations: [],
});
