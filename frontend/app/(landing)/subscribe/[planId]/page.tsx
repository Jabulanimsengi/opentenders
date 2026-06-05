"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { isValidPlanId, PLANS } from "@/lib/subscription";
import { Check, CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function SubscribePage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate plan ID
  if (!isValidPlanId(planId) || planId === "free" || planId === "enterprise") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Invalid plan selected</p>
            <Link href="/pricing">
              <Button>View Plans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = PLANS[planId];

  const handleCheckout = async () => {
    if (status === "unauthenticated") {
      router.push("/tenders");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const token = (session as { accessToken?: string } | null)?.accessToken;
      const response = await fetch(`${API_BASE}/subscriptions/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.url) {
        throw new Error(data?.message || "Unable to start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/pricing"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="grid gap-5 md:grid-cols-2 md:gap-8">
          {/* Plan Summary */}
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Subscribe to {plan.name}
            </h1>
            <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
              Get full access to all tender opportunities
            </p>

            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Plan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3 border-b pb-4 text-sm sm:text-base">
                  <span className="text-gray-600">{plan.name} Plan</span>
                  <span className="shrink-0 font-semibold">{plan.priceLabel}/month</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Secure payment processing</span>
            </div>
          </div>

          {/* Checkout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                Secure Checkout
              </CardTitle>
              <CardDescription>
                Stripe will collect payment and activate your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === "unauthenticated" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Sign in first, then return here to start checkout.
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button
                type="button"
                onClick={handleCheckout}
                className="h-11 w-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 sm:h-12 sm:text-base"
                disabled={isProcessing || status === "loading"}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Opening checkout...
                  </>
                ) : (
                  <>Continue to Stripe Checkout</>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-center border-t pt-6">
              <p className="text-xs text-gray-500">
                By subscribing, you agree to our Terms of Service and Privacy
                Policy.
              </p>
              <p className="text-xs text-gray-400">
                You can cancel your subscription at any time.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
