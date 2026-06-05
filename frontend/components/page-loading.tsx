import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

type PageLoadingProps = {
  variant?: "default" | "search" | "pricing" | "detail" | "dashboard";
};

export function PageLoading({ variant = "default" }: PageLoadingProps) {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
      <div className="mb-5 space-y-2 sm:mb-8">
        <Skeleton className="h-8 w-56 sm:h-10 sm:w-80" />
        <Skeleton className="h-4 w-full max-w-md sm:h-5" />
      </div>

      {(variant === "search" || variant === "dashboard") && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-8 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex min-h-[74px] items-center gap-2 p-3 sm:gap-4 sm:p-4">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg sm:h-12 sm:w-12" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-12 sm:h-7" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {variant === "pricing" && (
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-24" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((__, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {variant === "detail" && (
        <div className="space-y-5">
          <Card className="bg-slate-900">
            <CardContent className="space-y-3 p-4 sm:p-6">
              <Skeleton className="h-4 w-40 bg-slate-700" />
              <Skeleton className="h-8 w-full max-w-2xl bg-slate-700" />
              <Skeleton className="h-5 w-36 bg-slate-700" />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {variant !== "pricing" && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Search className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
            </div>
            <Skeleton className="mb-3 h-10 w-full rounded-lg sm:h-12" />
            <div className="mb-5 flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-24 rounded-full" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg sm:h-32" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
