import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

type ColourMapData = Record<string, string>;
type PerModeMapsData = { dark: ColourMapData; light: ColourMapData };

export const savedSchemesTable = pgTable("saved_schemes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull(),
  name: text("name").notNull(),
  colours: jsonb("colours").$type<string[]>().notNull(),
  maps: jsonb("maps").$type<PerModeMapsData>().notNull(),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSavedSchemeSchema = createInsertSchema(savedSchemesTable).omit({
  id: true,
  savedAt: true,
});
export type InsertSavedScheme = z.infer<typeof insertSavedSchemeSchema>;
export type DbSavedScheme = typeof savedSchemesTable.$inferSelect;
