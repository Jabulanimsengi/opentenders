"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Crown, Eye, FileText, Bell, Download, X } from "lucide-react";

interface TenderViewGateProps {
  tenderId: string;
  isSubscribed: boolean;
  children: React.ReactNode;
}

/**
 * Wrapper component that enforces subscription requirement for tender details
 * - Non-subscribers see a blurred preview with upgrade CTA
 * - Subscribers see full content
 */
export function TenderViewGate({
  tenderId,
  isSubscribed,
  children,
}: TenderViewGateProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Server-side or hydration - show loading placeholder
  if (!isClient) {
    return <>{children}</>;
  }

  // Subscribed user - show full content
  if (isSubscribed) {
    return <>{children}</>;
  }

  const handleClose = () => {
    router.push("/tenders");
  };

  // Non-subscriber - show paywall
  return (
    <div className="relative">
      {/* Blurred background content */}
      <div
        className="blur-md select-none pointer-events-none opacity-40"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Paywall overlay - fixed to viewport center */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="w-full sm:max-w-md shadow-2xl border-0 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in duration-300 rounded-t-3xl sm:rounded-2xl">
          <CardContent className="pt-6 pb-8 px-6 text-center relative">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Subscribe to View Details
            </h2>
            <p className="text-gray-600 mb-5 text-sm sm:text-base">
              Get full access to tender details, documents, and email alerts
            </p>

            {/* Features list */}
            <div className="text-left space-y-2.5 mb-6 bg-gray-50 p-4 rounded-xl">
              {[
                { icon: Eye, text: "Full tender descriptions & requirements" },
                { icon: FileText, text: "Download tender documents" },
                { icon: Bell, text: "Email alerts for matching tenders" },
                { icon: Download, text: "Export to CSV" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-700"
                >
                  <item.icon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link href="/subscribe/solo" className="block">
                <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-base font-semibold">
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe from R229/month
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full h-11">
                  View All Plans
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Cancel anytime • Secure payment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
