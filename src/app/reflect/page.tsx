import { db } from "@/lib/db";
import { returns } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const returnDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (returnDate.getTime() === today.getTime()) {
    return "Today";
  }
  if (returnDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function ReflectPage() {
  const allReturns = await db
    .select()
    .from(returns)
    .orderBy(desc(returns.created_at))
    .limit(50);

  // Group by date
  const byDate = new Map<string, typeof allReturns>();
  for (const r of allReturns) {
    const dateKey = formatDate(r.created_at);
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, []);
    }
    byDate.get(dateKey)!.push(r);
  }

  const days = Array.from(byDate.entries());

  return (
    <div className="flex-1 px-6 py-12 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-serif text-earth mb-12 fade-in">Past</h1>

      {days.length === 0 ? (
        <div className="text-center py-16 fade-in">
          <p className="text-earth-muted font-serif text-lg">
            No returns yet.
          </p>
          <p className="text-warm-gray text-sm mt-2">
            Begin when you're ready.
          </p>
        </div>
      ) : (
        <div className="space-y-12 fade-in">
          {days.map(([date, dayReturns]) => (
            <div key={date}>
              <p className="text-sm text-earth-muted mb-4">{date}</p>
              <div className="space-y-6">
                {dayReturns.map((r) => (
                  <div key={r.id} className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-earth capitalize">{r.orientation}</span>
                      <span className="text-xs text-warm-gray">{formatTime(r.created_at)}</span>
                    </div>
                    {r.reflection && (
                      <p className="text-earth-muted font-serif text-sm italic pl-4 border-l-2 border-cool-bone">
                        {r.reflection}
                      </p>
                    )}
                    {r.feeling && (
                      <span className="inline-block text-xs text-warm-gray bg-cool-bone px-2 py-1 rounded-full">
                        {r.feeling}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
