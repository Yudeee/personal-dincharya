import { db } from "@/lib/db";
import { userContext } from "@/lib/db/schema";
import { LocationSettings } from "@/components/LocationSettings";
import { DataSettings } from "@/components/DataSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await db.select().from(userContext).limit(1);
  const userCtx = ctx[0] || null;

  return (
    <div className="flex-1 px-6 py-12 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-serif text-earth mb-12 fade-in">Settings</h1>

      <div className="space-y-12 fade-in">
        <section>
          <h2 className="text-sm text-earth-muted mb-4">Location</h2>
          <LocationSettings
            currentLatitude={userCtx?.latitude ?? null}
            currentLongitude={userCtx?.longitude ?? null}
          />
        </section>

        <section>
          <h2 className="text-sm text-earth-muted mb-4">Data</h2>
          <DataSettings />
        </section>

        <footer className="text-center pt-8 text-warm-gray text-xs">
          <p>Dincharya</p>
          <p className="mt-1 font-serif italic">Return to yourself</p>
        </footer>
      </div>
    </div>
  );
}
