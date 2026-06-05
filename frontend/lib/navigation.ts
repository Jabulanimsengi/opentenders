import { FileText, Heart, Search, Trophy, type LucideIcon } from "lucide-react";

export type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const publicNavigationItems: NavigationItem[] = [
  { title: "Browse Tenders", url: "/tenders", icon: Search },
  { title: "Features", url: "/#features", icon: Trophy },
  { title: "How It Works", url: "/#how-it-works", icon: FileText },
  { title: "Pricing", url: "/pricing", icon: Heart },
];

export const appNavigationItems: NavigationItem[] = publicNavigationItems;
