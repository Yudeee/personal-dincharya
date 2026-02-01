"use client";

import { useState, useTransition } from "react";
import { clearAllData, exportAllData } from "@/lib/db/actions";

export function DataSettings() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState("");

  const handleExport = () => {
    startTransition(async () => {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dincharya-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("Exported");
      setTimeout(() => setStatus(""), 2000);
    });
  };

  const handleClear = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    startTransition(async () => {
      await clearAllData();
      setShowConfirm(false);
      setStatus("Cleared");
      setTimeout(() => setStatus(""), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={handleExport}
          disabled={isPending}
          className="btn-subtle"
        >
          Export
        </button>

        {showConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              disabled={isPending}
              className="text-clay-deep hover:text-clay px-4 py-2 transition-colors"
            >
              Confirm clear
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="btn-subtle"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleClear}
            disabled={isPending}
            className="text-earth-muted hover:text-clay-deep px-4 py-2 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {status && (
        <p className="text-sm text-warm-gray">{status}</p>
      )}
    </div>
  );
}
