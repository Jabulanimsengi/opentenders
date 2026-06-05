"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

type TenderStats = {
  activeCount: number;
  awardedCount: number;
};

export function LandingStats() {
  const [stats, setStats] = useState<TenderStats | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);

    fetch(`${API_BASE}/tenders/stats`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) {
          setStats({
            activeCount: data.activeCount || 0,
            awardedCount: data.awardedCount || 0,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <>
      <div className="min-w-0 text-center">
        <div className="whitespace-nowrap text-xl font-bold text-emerald-400 tabular-nums sm:text-4xl">
          {stats ? stats.activeCount.toLocaleString() : "..."}+
        </div>
        <div className="text-slate-400 text-sm">Active Tenders</div>
      </div>
      <div className="min-w-0 text-center">
        <div className="whitespace-nowrap text-xl font-bold text-emerald-400 tabular-nums sm:text-4xl">
          {stats ? stats.awardedCount.toLocaleString() : "..."}+
        </div>
        <div className="text-slate-400 text-sm">Awards Tracked</div>
      </div>
    </>
  );
}
