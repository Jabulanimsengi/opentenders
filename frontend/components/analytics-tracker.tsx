"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { trackAnalyticsEvent } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    const queryString = searchParams.toString();
    const path = queryString ? `${pathname}?${queryString}` : pathname;
    const isTenderDetail =
      pathname.startsWith("/tenders/") && pathname.split("/").length >= 3;

    trackAnalyticsEvent(
      {
        eventName: "page_view",
        path,
        entityType: isTenderDetail ? "tender" : undefined,
        entityId: isTenderDetail ? pathname.split("/").pop() : undefined,
      },
      accessToken,
    );

    if (isTenderDetail) {
      trackAnalyticsEvent(
        {
          eventName: "tender_view",
          entityType: "tender",
          entityId: pathname.split("/").pop(),
          path,
        },
        accessToken,
      );
    }
  }, [accessToken, pathname, searchParams]);

  return null;
}
