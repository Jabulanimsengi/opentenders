import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://opentenders.co.za';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Open Tenders - South African Government Tenders & RFQs",
    template: "%s | Open Tenders SA",
  },
  description: "Find and monitor South African government tenders, RFQs, and RFPs. Browse thousands of public sector opportunities from eTenders, National Treasury, municipalities, and provincial departments. Real-time alerts and instant search.",
  keywords: [
    // Primary high-volume
    "government tenders South Africa",
    "South African tenders",
    "eTenders South Africa",
    "eTenders portal",
    "tenders South Africa 2026",
    "latest tenders 2026",
    "active tenders",
    "tender bulletin",
    "bids and tenders",
    // RFQs
    "RFQ South Africa",
    "RFP South Africa",
    "daily RFQs",
    "tender leads",
    // Government
    "National Treasury tenders",
    "municipal tenders",
    "provincial tenders",
    "BBBEE tenders",
    "government contracts",
    "public procurement",
    // Sector-specific
    "CIDB tenders",
    "construction tenders SA",
    "civil engineering tenders",
    "cleaning tenders",
    "security tenders South Africa",
    "IT tenders South Africa",
    "catering tenders",
    "transport tenders",
    "logistics tenders",
    "medical tenders",
    "PPE tenders",
    // State entities
    "Eskom tenders",
    "Transnet tenders",
    "PRASA tenders",
    "SANRAL tenders",
    // App/alerts
    "tender alerts South Africa",
    "tender notifications",
    "tender search app",
    "tender tracking software",
    "get tenders via email",
    "find tenders online",
    // Free
    "free tenders South Africa",
    "tender subscription service",
    // Provinces
    "tenders in Gauteng",
    "tenders in Western Cape",
    "tenders in KwaZulu-Natal",
    "City of Johannesburg tenders",
    "City of Cape Town tenders",
    "Ekurhuleni tenders",
  ],
  authors: [{ name: "Open Tenders" }],
  creator: "Open Tenders",
  publisher: "Open Tenders",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteUrl,
    siteName: "Open Tenders",
    title: "Open Tenders - South African Government Tenders & RFQs",
    description: "Find and monitor South African government tenders. Browse thousands of public sector opportunities with real-time alerts and instant search.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Open Tenders - South African Government Tender Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Tenders - SA Government Tenders",
    description: "Find and monitor South African government tenders. Real-time alerts and instant search.",
    images: ["/og-image.png"],
    creator: "@opentenders",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
