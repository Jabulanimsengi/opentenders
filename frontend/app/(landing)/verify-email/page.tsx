import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

async function verifyEmail(token?: string) {
  if (!token) {
    return { success: false, message: "Verification token is missing." };
  }

  try {
    const response = await fetch(`${API_BASE}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);

    return {
      success: response.ok,
      message:
        data?.message ||
        (response.ok
          ? "Email verified. You can now sign in."
          : "Unable to verify this email link."),
    };
  } catch {
    return {
      success: false,
      message: "Email verification is temporarily unavailable.",
    };
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyEmail(token);
  const Icon = result.success ? CheckCircle2 : XCircle;

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md rounded-lg border bg-white p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 sm:mb-4 sm:h-14 sm:w-14">
          <Icon
            className={
              result.success
                ? "h-7 w-7 text-emerald-600 sm:h-8 sm:w-8"
                : "h-7 w-7 text-red-500 sm:h-8 sm:w-8"
            }
          />
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
          {result.success ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="mb-5 text-sm leading-relaxed text-slate-600 sm:mb-6 sm:text-base">{result.message}</p>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
