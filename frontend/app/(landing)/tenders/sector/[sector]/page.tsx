import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSectorBySlug, SECTORS } from '@/lib/municipalities';
import { Card, CardContent } from '@/components/ui/card';
import { PostgresSearch } from '@/components/postgres-search';
import { Search, ArrowLeft, Building2 } from 'lucide-react';

// Generate static params for all sectors
export async function generateStaticParams() {
    return SECTORS.map((sector) => ({
        sector: sector.slug,
    }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ sector: string }> }): Promise<Metadata> {
    const { sector: sectorSlug } = await params;
    const sector = getSectorBySlug(sectorSlug);

    if (!sector) {
        return { title: 'Sector Not Found' };
    }

    return {
        title: `${sector.name} Tenders South Africa 2026 | Open Tenders`,
        description: sector.description,
        keywords: [...sector.keywords],
        openGraph: {
            title: `${sector.name} Tenders - South African Government Opportunities`,
            description: sector.description,
        },
    };
}

export default async function SectorPage({ params }: { params: Promise<{ sector: string }> }) {
    const { sector: sectorSlug } = await params;
    const sector = getSectorBySlug(sectorSlug);

    if (!sector) {
        notFound();
    }

    // JSON-LD structured data for the sector page
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${sector.name} Tenders South Africa`,
        description: sector.description,
        url: `https://opentenders.co.za/tenders/sector/${sector.slug}`,
        isPartOf: {
            '@type': 'WebSite',
            name: 'Open Tenders',
            url: 'https://opentenders.co.za',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container mx-auto px-4 py-6 sm:py-10 md:py-12">
                {/* Breadcrumb */}
                <div className="mb-5 sm:mb-6">
                    <Link href="/tenders" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600">
                        <ArrowLeft className="w-4 h-4" />
                        Back to All Tenders
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="mb-3 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12">
                            <Building2 className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                {sector.name} Tenders
                            </h1>
                            <p className="text-sm text-slate-600 sm:text-base">Latest {sector.name.toLowerCase()} opportunities in South Africa</p>
                        </div>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base">
                        {sector.description}
                    </p>
                </div>

                {/* Keywords for SEO (visible but styled) */}
                <div className="mb-6 flex flex-wrap gap-2 sm:mb-8">
                    {sector.keywords.map((keyword) => (
                        <span key={keyword} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                            {keyword}
                        </span>
                    ))}
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-3 sm:p-6">
                        <PostgresSearch defaultQuery={sector.name} />
                    </CardContent>
                </Card>

                {/* Other Sectors */}
                <div className="mt-8 sm:mt-12">
                    <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:mb-4 sm:text-xl">Browse Other Sectors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {SECTORS.filter(s => s.slug !== sector.slug).map((s) => (
                            <Link
                                key={s.slug}
                                href={`/tenders/sector/${s.slug}`}
                                className="rounded-lg border border-slate-200 p-2.5 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50 sm:p-3"
                            >
                                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-center text-white sm:mt-12 sm:p-6">
                    <h3 className="mb-2 text-lg font-bold sm:text-xl">Get {sector.name} Tender Alerts</h3>
                    <p className="mb-4 text-sm text-emerald-100 sm:text-base">
                        Subscribe to receive email notifications when new {sector.name.toLowerCase()} tenders are published.
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-block bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                    >
                        View Plans
                    </Link>
                </div>
            </div>
        </>
    );
}
