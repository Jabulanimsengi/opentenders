import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Check, Search, Bell, Trophy, TrendingUp, Clock, Shield, Zap, Users } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Find South African Government Tenders | Open Tenders',
    description: 'Browse thousands of South African government tenders, RFQs, and RFPs. Get instant alerts for construction, cleaning, IT, security, and catering tenders. Real-time search with typo tolerance.',
    keywords: ['SA government tenders', 'eTenders', 'public sector bids', 'municipal tenders', 'cleaning tenders', 'construction tenders'],
    openGraph: {
        title: 'Open Tenders - South African Government Tender Portal',
        description: 'Find and monitor thousands of government tender opportunities across South Africa.',
    },
};

export default async function LandingPage() {
    // Get stats for hero
    const [tenderCount, awardCount] = await Promise.all([
        prisma.tender.count({ where: { status: 'active' } }),
        (prisma as any).award.count()
    ]);

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': 'https://opentenders.co.za/#website',
                url: 'https://opentenders.co.za',
                name: 'Open Tenders',
                description: 'South African Government Tender Portal',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://opentenders.co.za/tenders?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                },
            },
            {
                '@type': 'Organization',
                '@id': 'https://opentenders.co.za/#organization',
                name: 'Open Tenders',
                url: 'https://opentenders.co.za',
                logo: 'https://opentenders.co.za/logo.png',
                sameAs: [],
                contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'hello@opentenders.co.za',
                    contactType: 'customer service',
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
                    <div className="container mx-auto px-4 py-24 md:py-32 relative">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6 border border-emerald-500/30">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Live tender monitoring
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Find SA Government Tender Opportunities
                            </h1>
                            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                                Monitor thousands of government tenders across South Africa. Get notified when new opportunities match your criteria.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/tenders"
                                    className="bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-600 transition-colors shadow-lg"
                                >
                                    Browse Tenders Free
                                </Link>
                                <a
                                    href="#pricing"
                                    className="border-2 border-slate-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-800 transition-colors"
                                >
                                    View Pricing
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-emerald-400">{tenderCount.toLocaleString()}+</div>
                                    <div className="text-slate-400 text-sm">Active Tenders</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-emerald-400">{awardCount.toLocaleString()}+</div>
                                    <div className="text-slate-400 text-sm">Awards Tracked</div>
                                </div>
                                <div className="text-center hidden md:block">
                                    <div className="text-4xl font-bold text-emerald-400">Daily</div>
                                    <div className="text-slate-400 text-sm">Updates</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Everything You Need to Win Tenders
                            </h2>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                                Powerful tools to find, track, and win government contract opportunities.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: Search, title: "Instant Search", desc: "Lightning-fast, typo-tolerant search that returns results as you type. Find tenders in milliseconds." },
                                { icon: TrendingUp, title: "Smart Filters", desc: "Real-time filtering by region, category, buyer, and status with live result counts." },
                                { icon: Bell, title: "Email Alerts", desc: "Get notified instantly when new tenders match your saved search criteria." },
                                { icon: Clock, title: "Closing Countdown", desc: "Never miss a deadline with automated closing date reminders." },
                                { icon: Trophy, title: "Award Tracking", desc: "Track who wins contracts and their awarded values for market intelligence." },
                                { icon: Shield, title: "Verified Data", desc: "Data sourced directly from official SA government portals." },
                            ].map((feature, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all group">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                                        <feature.icon className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                How It Works
                            </h2>
                            <p className="text-xl text-slate-600">
                                Get started in three simple steps
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                { step: "1", title: "Search Tenders", desc: "Browse and filter through thousands of active government tenders." },
                                { step: "2", title: "Save Your Criteria", desc: "Create saved searches to track opportunities in your target sectors." },
                                { step: "3", title: "Get Notified", desc: "Receive email alerts when new tenders match your saved criteria." },
                            ].map((item, i) => (
                                <div key={i} className="relative text-center">
                                    <div className="w-16 h-16 bg-slate-800 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-slate-600">{item.desc}</p>
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-slate-200"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* App Preview Section */}
                <section className="py-20 bg-slate-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                See the Platform in Action
                            </h2>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                                A powerful dashboard designed for South African businesses to find and track government tender opportunities.
                            </p>
                        </div>

                        {/* Dashboard Preview Cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {/* Feature Preview 1 - Search & Filter */}
                            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                    <span className="ml-2 text-xs text-slate-400">Search & Filters</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-10 bg-slate-100 rounded-lg flex items-center px-3">
                                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                                        <span className="text-slate-500 text-sm">Search tenders...</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Gauteng</div>
                                        <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">IT Services</div>
                                        <div className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs">+ More</div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mt-4">Filter by region, category, and more</p>
                            </div>

                            {/* Feature Preview 2 - Tender Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                    <span className="ml-2 text-xs text-slate-400">Tender Details</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <span className="inline-block px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full mb-2">Active</span>
                                            <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">Supply of IT Equipment for Provincial Offices</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>💼 Dept. of Health</span>
                                        <span>📍 Gauteng</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                        <Clock className="w-3 h-3" />
                                        Closes in 5 days
                                    </div>
                                </div>
                            </div>

                            {/* Feature Preview 3 - Email Alerts */}
                            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                    <span className="ml-2 text-xs text-slate-400">Email Alerts</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <Bell className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800">3 new matches</p>
                                            <p className="text-xs text-slate-500">For "IT Services in Gauteng"</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                                            <Bell className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800">1 new match</p>
                                            <p className="text-xs text-slate-500">For "Construction Projects"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA below preview */}
                        <div className="text-center mt-12">
                            <Link
                                href="/tenders"
                                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg"
                            >
                                Try It Free
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Instant Search Technology Section */}
                {/* Real-Time Search Section - Clean White */}
                <section className="py-24 bg-white relative overflow-hidden">

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-5xl mx-auto">
                            {/* Header */}
                            <div className="text-center mb-16">
                                <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-2 mb-6">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-emerald-700">Powered by Typesense</span>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                                    Search That <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Thinks</span> Like You
                                </h2>

                                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                    Find tenders in milliseconds, even with typos. Our AI-powered search understands what you&apos;re looking for.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid md:grid-cols-3 gap-6 mb-12">
                                {/* Speed Card */}
                                <div className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105 hover:border-emerald-300">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-bl-3xl rounded-tr-2xl"></div>
                                    <div className="relative">
                                        <div className="text-5xl font-bold text-slate-900 mb-1">&lt;50<span className="text-emerald-500">ms</span></div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-4">Response Time</div>
                                        <p className="text-slate-600 text-sm">
                                            Results appear before you finish typing. Faster than you can blink.
                                        </p>
                                    </div>
                                </div>

                                {/* Typo Card */}
                                <div className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105 hover:border-emerald-300">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-teal-100 rounded-bl-3xl rounded-tr-2xl"></div>
                                    <div className="relative">
                                        <div className="text-lg md:text-xl font-bold text-slate-900 mb-1">
                                            <span className="line-through text-slate-400">infastructre</span>
                                            <span className="mx-2 text-emerald-500">→</span>
                                            <span className="text-emerald-600">infrastructure</span>
                                        </div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-4">Typo-Tolerant</div>
                                        <p className="text-slate-600 text-sm">
                                            Made a spelling mistake? No problem. We understand what you meant.
                                        </p>
                                    </div>
                                </div>

                                {/* Live Filters Card */}
                                <div className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105 hover:border-emerald-300">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100 rounded-bl-3xl rounded-tr-2xl"></div>
                                    <div className="relative">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-5xl font-bold text-slate-900">Live</span>
                                            <span className="text-emerald-500 text-xl font-semibold">Counts</span>
                                        </div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-4">Dynamic Filters</div>
                                        <p className="text-slate-600 text-sm">
                                            See how many tenders match each filter before you click.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Search Demo Animation */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <Search className="w-5 h-5 text-emerald-500" />
                                    <div className="flex-1 bg-slate-100 rounded-lg px-4 py-3">
                                        <span className="text-slate-700">cleaning services gauteng</span>
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
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/tenders"
                                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    <Search className="w-5 h-5" />
                                    Try Instant Search
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                                <span className="text-slate-500 text-sm">No signup required</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Simple, Transparent Pricing
                            </h2>
                            <p className="text-xl text-slate-600">
                                Choose the plan that fits your business needs
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {/* Free Plan */}
                            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Free</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-bold text-slate-900">R0</span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">Preview access</p>
                                <ul className="space-y-2 mb-6 text-sm">
                                    {["Browse tender listings", "View blurred details", "Limited information", "No downloads"].map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-600">
                                            <Check className="w-4 h-4 text-slate-400" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/tenders" className="block w-full py-2.5 text-center border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                    Browse Free
                                </Link>
                            </div>

                            {/* Solo Plan - Highlighted */}
                            <div className="rounded-2xl border-2 border-emerald-500 bg-white p-6 relative shadow-xl">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                                    Most Popular
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Solo</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-bold text-slate-900">R109</span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">For individuals</p>
                                <ul className="space-y-2 mb-6 text-sm">
                                    {["Full tender details", "Unlimited searches", "Download documents", "Email alerts", "Export to CSV"].map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-600">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/subscribe/solo" className="block w-full py-2.5 text-center bg-emerald-500 rounded-xl font-medium text-white hover:bg-emerald-600 transition-colors">
                                    Subscribe
                                </Link>
                            </div>

                            {/* Team Plan */}
                            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Team</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-bold text-slate-900">R399</span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">Up to 5 users</p>
                                <ul className="space-y-2 mb-6 text-sm">
                                    {["Everything in Solo", "5 team members", "Team dashboard", "Shared searches", "Priority support"].map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-600">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/subscribe/team" className="block w-full py-2.5 text-center border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                    Subscribe
                                </Link>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-bold text-slate-900">R999</span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">Unlimited users</p>
                                <ul className="space-y-2 mb-6 text-sm">
                                    {["Everything in Team", "Unlimited users", "API access", "Custom integrations", "Dedicated support"].map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-600">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/login" className="block w-full py-2.5 text-center border-2 border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section - Slate with Green */}
                <section className="py-20 bg-slate-900 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Find Your Next Opportunity?
                        </h2>
                        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                            Join hundreds of businesses using Open Tenders to win government contracts.
                        </p>
                        <Link
                            href="/tenders"
                            className="inline-block bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-600 transition-colors shadow-lg"
                        >
                            Browse Tenders Free
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
