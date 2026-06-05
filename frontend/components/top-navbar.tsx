"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Settings, Menu, X, User, Shield } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "./auth-dialog";
import { SignOutDialog } from "./signout-dialog";
import { publicNavigationItems } from "@/lib/navigation";

type TopNavbarUser = {
  name?: string | null;
  role?: string | null;
};

interface TopNavbarProps {
  user?: TopNavbarUser;
}

export function TopNavbar({ user }: TopNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (url: string) => {
    if (url.startsWith("/#")) return false;
    if (url === "/" && pathname === "/") return true;
    if (url !== "/" && pathname.startsWith(url)) return true;
    return false;
  };

  const currentNavItems = publicNavigationItems;

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
          {/* Logo - Always goes to Home, users can access Dashboard via nav link */}
          <Link href="/" className="flex h-14 shrink-0 items-center sm:h-16">
            <Image
              src="/logo.png"
              alt="Open Tenders"
              width={280}
              height={96}
              className="h-11 w-auto object-contain sm:h-12"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 h-16">
            {currentNavItems.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  "relative flex items-center gap-2 px-4 h-full text-sm font-medium transition-colors",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:transition-transform after:duration-200",
                  isActive(item.url)
                    ? "text-slate-900 after:scale-x-100 font-semibold"
                    : "text-gray-600 hover:text-emerald-700 after:scale-x-0 hover:after:scale-x-100",
                )}
              >
                {user && <item.icon className="w-4 h-4" />}
                {item.title}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            {user ? (
              <>
                {/* Desktop: Flat nav items with underline effect */}
                <Link
                  href="/settings"
                  className="hidden md:flex relative items-center gap-2 px-4 h-16 text-sm font-medium transition-colors text-gray-600 hover:text-emerald-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:transition-transform after:duration-200 after:scale-x-0 hover:after:scale-x-100"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>

                {/* Admin Link - only for admins */}
                {user.role === "admin" && (
                  <Link
                    href="/admin/users"
                    className="hidden md:flex relative items-center gap-2 px-4 h-16 text-sm font-medium transition-colors text-orange-600 hover:text-orange-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-500 after:transition-transform after:duration-200 after:scale-x-0 hover:after:scale-x-100"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                <div className="hidden md:flex relative items-center h-16">
                  <SignOutDialog />
                </div>

                {/* User Avatar/Name (non-clickable on desktop) */}
                <div className="hidden md:flex items-center gap-2 px-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {user.name || "User"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <div className="hidden md:block">
                  <AuthDialog triggerClassName="h-9 whitespace-nowrap px-2.5 py-0 text-sm sm:px-4" />
                </div>
                <Link href="/tenders">
                  <Button className="h-9 whitespace-nowrap bg-emerald-500 px-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 sm:px-4">
                    Browse Tenders
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-lg md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="size-7" />
              ) : (
                <Menu className="size-7" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-1">
              {currentNavItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.url)
                      ? "bg-slate-900 text-white"
                      : "text-gray-600 hover:bg-slate-900 hover:text-white",
                  )}
                >
                  {user && <item.icon className="w-5 h-5" />}
                  {item.title}
                </Link>
              ))}

              {user && (
                <>
                  <div className="border-t my-2" />
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Signed in as{" "}
                    <span className="font-medium text-slate-700">
                      {user.name || "User"}
                    </span>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <div className="px-4 py-2">
                    <SignOutDialog />
                  </div>
                </>
              )}

              {!user && (
                <div className="p-4 pt-2">
                  <AuthDialog />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
