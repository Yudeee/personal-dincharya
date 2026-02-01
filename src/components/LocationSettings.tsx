"use client";

import { useState, useTransition } from "react";
import { updateUserLocation } from "@/lib/db/actions";

interface LocationSettingsProps {
  currentLatitude: number | null;
  currentLongitude: number | null;
}

export function LocationSettings({
  currentLatitude,
  currentLongitude,
}: LocationSettingsProps) {
  const [status, setStatus] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }

    setStatus("Finding you...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        startTransition(async () => {
          await updateUserLocation(
            position.coords.latitude,
            position.coords.longitude
          );
          setStatus("Location saved");
          setTimeout(() => setStatus(""), 2000);
        });
      },
      () => {
        setStatus(`Could not find location`);
        setTimeout(() => setStatus(""), 3000);
      },
      { enableHighAccuracy: true }
    );
  };

  const hasLocation = currentLatitude !== null && currentLongitude !== null;

  return (
    <div className="space-y-4">
      {hasLocation && (
        <p className="text-sm text-earth-muted">
          {currentLatitude?.toFixed(2)}, {currentLongitude?.toFixed(2)}
        </p>
      )}

      <button
        onClick={handleGetLocation}
        disabled={isPending}
        className="btn-subtle"
      >
        {hasLocation ? "Update location" : "Set location"}
      </button>

      {status && (
        <p className="text-sm text-warm-gray">{status}</p>
      )}
    </div>
  );
}
