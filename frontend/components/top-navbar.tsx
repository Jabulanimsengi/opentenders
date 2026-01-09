'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Home, Search, Heart, Trophy, Settings, Menu, X, FileText, User, LogOut,
    Bookmark, Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthDialog } from './auth-dialog';
import { SignOutDialog } from './signout-dialog';

const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Saved Searches", url: "/saved-searches", icon: Heart },
    { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
    { title: "Awarded", url: "/awards", icon: Trophy },
];

const publicNavItems = [
    { title: "Features", url: "/#features", icon: Trophy },
    { title: "How It Works", url: "/#how-it-works", icon: FileText },
    { title: "Pricing", url: "/pricing", icon: Heart },
    { title: "Browse Tenders", url: "/tenders", icon: Search },
];



interface TopNavbarProps {
    user?: any;
}

export function TopNavbar({ user }: TopNavbarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isActive = (url: string) => {
        if (url.startsWith("/#")) return false;
        if (url === "/" && pathname === "/") return true;
        if (url !== "/" && pathname.startsWith(url)) return true;
        return false;
    };

    const currentNavItems = user ? navItems : publicNavItems;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Always goes to Home, users can access Dashboard via nav link */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Open Tenders"
                            width={280}
                            height={96}
                            className="h-24 w-auto"
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
                                        : "text-gray-600 hover:text-emerald-700 after:scale-x-0 hover:after:scale-x-100"
                                )}
                            >
                                {user && <item.icon className="w-4 h-4" />}
                                {item.title}
                            </Link>
                        ))}

                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-1">
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
                                {user.role === 'admin' && (
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
                                    <span className="text-sm font-medium text-slate-900">{user.name || 'User'}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <AuthDialog />
                                <Link href="/tenders">
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md shadow-emerald-500/20">
                                        Browse Tenders
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                                            : "text-gray-600 hover:bg-slate-900 hover:text-white"
                                    )}
                                >
                                    {user && <item.icon className="w-5 h-5" />}
                                    {item.title}
                                </Link>
                            ))}

                            {user && (
                                <>
                                    <div className="border-t my-2" />
                                    <Link
                                        href="/settings"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                                    >
                                        <Settings className="w-5 h-5" />
                                        Settings
                                    </Link>
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
