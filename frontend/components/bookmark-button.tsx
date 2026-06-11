"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast-provider";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  addToGuestWatchlist,
  isInGuestWatchlist,
  removeFromGuestWatchlist,
  WATCHLIST_CHANGED_EVENT,
} from "@/lib/watchlist";

interface BookmarkButtonProps {
  tenderId: string;
  className?: string;
  variant?: "default" | "icon";
  isSubscriber?: boolean;
}

export function BookmarkButton({
  tenderId,
  className,
  variant = "default",
}: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  useEffect(() => {
    if (status === "loading") return;

    const checkBookmark = async () => {
      setChecking(true);

      if (!accessToken) {
        setIsBookmarked(isInGuestWatchlist(tenderId));
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/bookmarks/check/${tenderId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(Boolean(data.isBookmarked));
        }
      } catch {
        console.warn("Could not check bookmark status");
      } finally {
        setChecking(false);
      }
    };

    void checkBookmark();
  }, [API_BASE, accessToken, status, tenderId]);

  useEffect(() => {
    if (accessToken || typeof window === "undefined") return;

    const handleChange = () => {
      setIsBookmarked(isInGuestWatchlist(tenderId));
    };

    window.addEventListener(WATCHLIST_CHANGED_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(WATCHLIST_CHANGED_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [accessToken, tenderId]);

  const toggleBookmark = async () => {
    setLoading(true);

    if (!accessToken) {
      if (isBookmarked) {
        removeFromGuestWatchlist(tenderId);
        setIsBookmarked(false);
        toast("Tender removed from Saved Tenders", "info");
      } else {
        addToGuestWatchlist(tenderId);
        setIsBookmarked(true);
        trackAnalyticsEvent({
          eventName: "bookmark_created",
          entityType: "tender",
          entityId: tenderId,
          metadata: { mode: "guest_watchlist" },
        });
        toast("Tender saved to Saved Tenders", "success");
      }

      setLoading(false);
      return;
    }

    try {
      if (isBookmarked) {
        const res = await fetch(`${API_BASE}/bookmarks/${tenderId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          setIsBookmarked(false);
          toast("Tender removed from Saved Tenders", "info");
        } else {
          toast("Failed to remove tender", "error");
        }
      } else {
        const res = await fetch(`${API_BASE}/bookmarks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tenderId }),
        });

        if (res.ok) {
          setIsBookmarked(true);
          trackAnalyticsEvent(
            {
              eventName: "bookmark_created",
              entityType: "tender",
              entityId: tenderId,
            },
            accessToken,
          );
          toast("Tender saved to Saved Tenders", "success");
        } else {
          toast("Failed to save tender", "error");
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || checking) {
    return (
      <Button
        variant="outline"
        size={variant === "icon" ? "icon" : "sm"}
        disabled
        className={className}
      >
        {status === "loading" ? (
          <Bookmark className="w-4 h-4" />
        ) : (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {variant !== "icon" && (status === "loading" ? "Save" : " Loading...")}
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={toggleBookmark}
        disabled={loading}
        className={cn(
          "transition-colors",
          isBookmarked &&
            "border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100",
          className,
        )}
        title={isBookmarked ? "Remove from Saved Tenders" : "Save tender"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleBookmark}
      disabled={loading}
      className={cn(
        "gap-2 transition-colors",
        isBookmarked &&
          "border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
      )}
      {isBookmarked ? "Saved" : "Save"}
    </Button>
  );
}
