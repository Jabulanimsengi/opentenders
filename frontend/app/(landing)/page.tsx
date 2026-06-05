import Link from "next/link";
import {
  Check,
  Search,
  Bell,
  Trophy,
  TrendingUp,
  Clock,
  Shield,
  Building2,
  MapPin,
} from "lucide-react";
import { Metadata } from "next";
import { LandingStats } from "@/components/landing-stats";

export const metadata: Metadata = {
  title: "Find South African Government Tenders | Open Tenders",
  description:
    "Browse thousands of South African government tenders, RFQs, and RFPs from more than 2,800 monitored sources. Get instant alerts for construction, cleaning, IT, security, and catering tenders. Smart search helps you find relevant opportunities faster.",
  keywords: [
    "SA government tenders",
    "eTenders",
    "public sector bids",
    "municipal tenders",
    "cleaning tenders",
    "construction tenders",
  ],
  openGraph: {
    title: "Open Tenders - South African Government Tender Portal",
    description:
      "Find and monitor thousands of government tender opportunities across South Africa.",
  },
};

export default function LandingPage() {
  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://opentenders.co.za/#website",
        url: "https://opentenders.co.za",
        name: "Open Tenders",
        description: "South African Government Tender Portal",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://opentenders.co.za/tenders?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://opentenders.co.za/#organization",
        name: "Open Tenders",
        url: "https://opentenders.co.za",
        logo: "https://opentenders.co.za/logo.png",
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          email: "hello@opentenders.co.za",
          contactType: "customer service",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        {/* Hero Section - With Background Image */}
        <section className="relative text-white overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/backgroundimage.png')" }}
          ></div>
          {/* Dark Overlay for text visibility */}
          <div className="absolute inset-0 bg-slate-900/75"></div>
          <div className="container mx-auto px-4 py-14 sm:py-20 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Live tender monitoring
              </div>
              <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:mb-6 md:text-6xl">
                Find SA Government Tender Opportunities
              </h1>
              <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg md:mb-8 md:text-xl">
                Monitor thousands of government tenders across South Africa from
                more than 2,800 public sector sources. Get notified when new
                opportunities match your criteria.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/tenders"
                  className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-600 sm:rounded-xl sm:px-8 sm:py-4 sm:text-lg"
                >
                  Browse Tenders Free
                </Link>
                <a
                  href="#pricing"
                  className="rounded-lg border-2 border-slate-600 px-5 py-3 text-sm font-semibold transition-colors hover:bg-slate-800 sm:rounded-xl sm:px-8 sm:py-4 sm:text-lg"
                >
                  View Pricing
                </a>
              </div>

              {/* Stats */}
              <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:gap-6 md:mt-16 md:grid-cols-4">
                <LandingStats />
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400 sm:text-4xl">
                    2,800+
                  </div>
                  <div className="text-slate-400 text-sm">
                    Sources Monitored
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400 sm:text-4xl">
                    Daily
                  </div>
                  <div className="text-slate-400 text-sm">Updates</div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center sm:mb-12 md:mb-16">
              <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl md:mb-4 md:text-4xl">
                Everything You Need to Win Tenders
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
                Powerful tools to find, track, and win government contract
                opportunities.
              </p>
            </div>

            <div className="grid gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Search,
                  title: "Smart Search",
                  desc: "Search by service, buyer, location, or plain-language intent to surface relevant tender opportunities faster.",
                },
                {
                  icon: TrendingUp,
                  title: "Smart Filters",
                  desc: "Real-time filtering by region, category, buyer, and status with live result counts.",
                },
                {
                  icon: Bell,
                  title: "Email Alerts",
                  desc: "Get notified instantly when new tenders match your saved search criteria.",
                },
                {
                  icon: Clock,
                  title: "Closing Countdown",
                  desc: "Never miss a deadline with automated closing date reminders.",
                },
                {
                  icon: Trophy,
                  title: "Award Tracking",
                  desc: "Track who wins contracts and their awarded values for market intelligence.",
                },
                {
                  icon: Shield,
                  title: "Verified Data",
                  desc: "Data sourced from the eTenders portal and more than 2,800 monitored public sector sources.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-lg sm:p-5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 transition-colors group-hover:bg-emerald-100 sm:mb-4 sm:h-12 sm:w-12">
                    <feature.icon className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold text-slate-900 sm:mb-2 sm:text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center sm:mb-12 md:mb-16">
              <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl md:mb-4 md:text-4xl">
                How It Works
              </h2>
              <p className="text-base text-slate-600 sm:text-lg md:text-xl">
                Get started in three simple steps
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3 md:gap-8">
              {[
                {
                  step: "1",
                  title: "Search Tenders",
                  desc: "Browse and filter through thousands of active government tenders.",
                },
                {
                  step: "2",
                  title: "Save Your Criteria",
                  desc: "Create saved searches to track opportunities in your target sectors.",
                },
                {
                  step: "3",
                  title: "Get Notified",
                  desc: "Receive email alerts when new tenders match your saved criteria.",
                },
              ].map((item, i) => (
                <div key={i} className="relative text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-lg font-bold text-white sm:mb-6 sm:h-16 sm:w-16 sm:rounded-xl sm:text-2xl">
                    {item.step}
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-slate-900 sm:mb-2 sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {item.desc}
                  </p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-slate-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* App Preview Section */}
        <section className="overflow-hidden bg-slate-100 py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center sm:mb-12">
              <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl md:mb-4 md:text-4xl">
                See the Platform in Action
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
                A powerful dashboard designed for South African businesses to
                find and track government tender opportunities.
              </p>
            </div>

            {/* Dashboard Preview Cards */}
            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {/* Feature Preview 1 - Search & Filter */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-2 text-xs text-slate-400">
                    Smart Search
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-slate-100 rounded-lg flex items-center px-3">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-500 text-sm">
                      Search tenders...
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      Gauteng
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      IT Services
                    </div>
                    <div className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                      + More
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  Filter by region, category, and more
                </p>
              </div>

              {/* Feature Preview 2 - Tender Card */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-2 text-xs text-slate-400">
                    Tender Details
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full mb-2">
                        Active
                      </span>
                      <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">
                        Supply of IT Equipment for Provincial Offices
                      </h4>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      Dept. of Health
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Gauteng
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    Closes in 5 days
                  </div>
                </div>
              </div>

              {/* Feature Preview 3 - Email Alerts */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-2 text-xs text-slate-400">
                    Email Alerts
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        3 new matches
                      </p>
                      <p className="text-xs text-slate-500">
                        For &quot;IT Services in Gauteng&quot;
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        1 new match
                      </p>
                      <p className="text-xs text-slate-500">
                        For &quot;Construction Projects&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA below preview */}
            <div className="mt-8 text-center sm:mt-12">
              <Link
                href="/tenders"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-600 sm:rounded-xl sm:px-6 sm:text-base"
              >
                Try It Free
              </Link>
            </div>
          </div>
        </section>

        {/* Smart Search Section */}
        <section className="border-y border-slate-200 bg-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
              <div>
                <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl md:mb-4 md:text-4xl">
                  Smart search for real tender workflows
                </h2>
                <p className="mb-6 max-w-xl text-base leading-relaxed text-slate-600 sm:mb-8 sm:text-lg">
                  Describe the opportunity you want, then narrow the results
                  with the same filters you already use across the site.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      icon: Search,
                      title: "Search in plain language",
                      desc: 'Use phrases like "cleaning services in Gauteng" or "municipal road maintenance".',
                    },
                    {
                      icon: TrendingUp,
                      title: "Refine without starting over",
                      desc: "Filter by province, category, buyer, status, and closing date after the smart search runs.",
                    },
                    {
                      icon: Bell,
                      title: "Turn good searches into alerts",
                      desc: "Save a search once and receive new matching tender opportunities by email.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                  <Link
                    href="/tenders?q=cleaning%20services%20in%20Gauteng"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-600 sm:rounded-xl sm:px-6 sm:text-base"
                  >
                    <Search className="h-4 w-4" />
                    Try Smart Search
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:rounded-xl sm:px-6 sm:text-base"
                  >
                    View Plans
                  </Link>
                </div>
              </div>

              {/* Search Demo Animation */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-lg sm:p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-emerald-500" />
                  <div className="min-w-0 flex-1 rounded-lg bg-slate-100 px-3 py-2 sm:px-4 sm:py-3">
                    <span className="text-sm text-slate-700 sm:text-base">
                      cleaning services gauteng
                    </span>
                    <span className="inline-block w-0.5 h-5 bg-emerald-500 ml-1 animate-pulse"></span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="font-semibold">156</span> results
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                    Gauteng <span className="text-slate-400">(98)</span>
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                    Cleaning <span className="text-slate-400">(156)</span>
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                    Active <span className="text-slate-400">(142)</span>
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      title: "Cleaning services for municipal facilities",
                      buyer: "City facilities department",
                      meta: "Gauteng - closes in 6 days",
                    },
                    {
                      title: "Hygiene and sanitation services panel",
                      buyer: "Provincial health offices",
                      meta: "Gauteng - active tender",
                    },
                    {
                      title: "Office cleaning and consumables supply",
                      buyer: "Public works regional office",
                      meta: "Gauteng - briefing required",
                    },
                  ].map((result) => (
                    <div
                      key={result.title}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {result.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {result.buyer}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                          Match
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                        <Clock className="h-3.5 w-3.5" />
                        {result.meta}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-gray-50 py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center sm:mb-12 md:mb-16">
              <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl md:mb-4 md:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="text-base text-slate-600 sm:text-lg md:text-xl">
                Choose the plan that fits your business needs
              </p>
            </div>

            <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-5">
              {/* Free Plan */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Free
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900">R0</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Preview access</p>
                <ul className="space-y-2 mb-6 text-sm">
                  {[
                    "Browse tender listings",
                    "View blurred details",
                    "Limited information",
                    "No downloads",
                  ].map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-slate-600"
                    >
                      <Check className="w-4 h-4 text-slate-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/tenders"
                  className="block w-full py-2.5 text-center border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Browse Free
                </Link>
              </div>

              {/* Solo Plan - Highlighted */}
              <div className="relative rounded-lg border-2 border-emerald-500 bg-white p-4 shadow-xl sm:p-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Solo
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900">
                    R229
                  </span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">For individuals</p>
                <ul className="space-y-2 mb-6 text-sm">
                  {[
                    "Full tender details",
                    "Unlimited searches",
                    "Download documents",
                    "Email alerts",
                    "Export to CSV",
                  ].map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/subscribe/solo"
                  className="block w-full py-2.5 text-center bg-emerald-500 rounded-xl font-medium text-white hover:bg-emerald-600 transition-colors"
                >
                  Subscribe
                </Link>
              </div>

              {/* Team Plan */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Team
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900">
                    R629
                  </span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Up to 5 users</p>
                <ul className="space-y-2 mb-6 text-sm">
                  {[
                    "Everything in Solo",
                    "5 team members",
                    "Team dashboard",
                    "Shared searches",
                    "Priority support",
                  ].map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/subscribe/team"
                  className="block w-full py-2.5 text-center border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Subscribe
                </Link>
              </div>

              {/* Business Plan */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Business
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900">
                    R1,329
                  </span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Up to 15 users</p>
                <ul className="space-y-2 mb-6 text-sm">
                  {[
                    "Everything in Team",
                    "15 team members",
                    "Admin-managed users",
                    "Advanced monitoring",
                    "Priority support",
                  ].map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/subscribe/business"
                  className="block w-full py-2.5 text-center border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Subscribe
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Enterprise / Custom
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-slate-900">
                    From R2,499
                  </span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Custom users</p>
                <ul className="space-y-2 mb-6 text-sm">
                  {[
                    "Everything in Business",
                    "Custom user limits",
                    "API access",
                    "Custom integrations",
                    "Dedicated support",
                  ].map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="mailto:hello@opentenders.co.za"
                  className="block w-full py-2.5 text-center border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Slate with Green */}
        <section className="bg-slate-900 py-12 text-white sm:py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:mb-4 md:text-4xl">
              Ready to Find Your Next Opportunity?
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg md:mb-8 md:text-xl">
              Join hundreds of businesses using Open Tenders to win government
              contracts.
            </p>
            <Link
              href="/tenders"
              className="inline-block rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-600 sm:rounded-xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Browse Tenders Free
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
