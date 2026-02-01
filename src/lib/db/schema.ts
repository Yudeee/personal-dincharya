import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Returns table - records moments of return throughout the day
export const returns = sqliteTable("returns", {
  id: text("id").primaryKey(),
  created_at: integer("created_at").notNull(), // unix timestamp
  orientation: text("orientation").notNull(), // settled, restless, scattered, collected, etc.
  feeling: text("feeling", { enum: ["clear", "neutral", "heavy"] }), // optional post-alignment feeling
  reflection: text("reflection"), // optional freeform
  hour_of_day: integer("hour_of_day").notNull(), // 0-23
  day_of_week: integer("day_of_week").notNull(), // 0-6 (Sunday = 0)
  weather_code: integer("weather_code"), // Open-Meteo code
  temperature: real("temperature"), // Celsius
});

// Alignments table - scheduled alignment prompts (formerly guidances)
export const alignments = sqliteTable("alignments", {
  id: text("id").primaryKey(),
  created_at: integer("created_at").notNull(),
  scheduled_for: text("scheduled_for", { enum: ["12:00", "18:00"] }).notNull(),
  instruction: text("instruction").notNull(), // the alignment directive
  context: text("context"), // JSON of context that led to this
  viewed_at: integer("viewed_at"), // null until viewed
  completed_at: integer("completed_at"), // null unless completed
});

// User context - single row for user preferences and location
export const userContext = sqliteTable("user_context", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  latitude: real("latitude"),
  longitude: real("longitude"),
  timezone: text("timezone").default("America/Los_Angeles"),
  updated_at: integer("updated_at"),
});

// Type exports
export type Return = typeof returns.$inferSelect;
export type NewReturn = typeof returns.$inferInsert;
export type Alignment = typeof alignments.$inferSelect;
export type NewAlignment = typeof alignments.$inferInsert;
export type UserContext = typeof userContext.$inferSelect;
