"use server";

import { db } from "./index";
import { returns, alignments, userContext } from "./schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type { NewReturn, NewAlignment } from "./schema";

// Return actions
export async function recordReturn(data: {
  orientation: string;
  feeling?: "clear" | "neutral" | "heavy";
  reflection?: string;
  weather_code?: number;
  temperature?: number;
}) {
  const now = new Date();

  const returnRecord: NewReturn = {
    id: nanoid(),
    created_at: Math.floor(now.getTime() / 1000),
    orientation: data.orientation,
    feeling: data.feeling ?? null,
    reflection: data.reflection ?? null,
    hour_of_day: now.getHours(),
    day_of_week: now.getDay(),
    weather_code: data.weather_code ?? null,
    temperature: data.temperature ?? null,
  };

  await db.insert(returns).values(returnRecord);
  revalidatePath("/");
  revalidatePath("/reflect");

  return returnRecord;
}

// Alignment actions
export async function createAlignment(data: {
  scheduled_for: "12:00" | "18:00";
  instruction: string;
  context?: string;
}) {
  const alignment: NewAlignment = {
    id: nanoid(),
    created_at: Math.floor(Date.now() / 1000),
    scheduled_for: data.scheduled_for,
    instruction: data.instruction,
    context: data.context ?? null,
    viewed_at: null,
    completed_at: null,
  };

  await db.insert(alignments).values(alignment);
  revalidatePath("/");

  return alignment;
}

export async function markAlignmentViewed(id: string) {
  await db
    .update(alignments)
    .set({ viewed_at: Math.floor(Date.now() / 1000) })
    .where(eq(alignments.id, id));
  revalidatePath("/");
}

export async function completeAlignment(id: string) {
  await db
    .update(alignments)
    .set({ completed_at: Math.floor(Date.now() / 1000) })
    .where(eq(alignments.id, id));
  revalidatePath("/");
}

// User context actions
export async function updateUserLocation(latitude: number, longitude: number, timezone?: string) {
  const ctx = await db.select().from(userContext).limit(1);
  if (ctx[0]) {
    await db
      .update(userContext)
      .set({
        latitude,
        longitude,
        timezone: timezone ?? ctx[0].timezone,
        updated_at: Math.floor(Date.now() / 1000),
      })
      .where(eq(userContext.id, ctx[0].id));
  }
  revalidatePath("/");
  revalidatePath("/settings");
}

export async function clearAllData() {
  await db.delete(alignments);
  await db.delete(returns);
  revalidatePath("/");
  revalidatePath("/reflect");
  revalidatePath("/settings");
}

export async function exportAllData() {
  const allReturns = await db.select().from(returns);
  const allAlignments = await db.select().from(alignments);
  const ctx = await db.select().from(userContext).limit(1);

  return {
    exported_at: new Date().toISOString(),
    returns: allReturns,
    alignments: allAlignments,
    user_context: ctx[0] || null,
  };
}
