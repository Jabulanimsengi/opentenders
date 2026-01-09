import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSectorBySlug, SECTORS } from '@/lib/municipalities';
import { Card, CardContent } from '@/components/ui/card';
import { TypesenseSearch } from '@/components/typesense-search';
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
        keywords: sector.keywords,
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
            <div className="container mx-auto py-12 px-4">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href="/tenders" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600">
                        <ArrowLeft className="w-4 h-4" />
                        Back to All Tenders
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                {sector.name} Tenders
                            </h1>
                            <p className="text-slate-600">Latest {sector.name.toLowerCase()} opportunities in South Africa</p>
                        </div>
                    </div>
                    <p className="text-slate-600 mt-4 max-w-3xl">
                        {sector.description}
                    </p>
                </div>

                {/* Keywords for SEO (visible but styled) */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {sector.keywords.map((keyword) => (
                        <span key={keyword} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                            {keyword}
                        </span>
                    ))}
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-6">
                        <TypesenseSearch />
                    </CardContent>
                </Card>

                {/* Other Sectors */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Browse Other Sectors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {SECTORS.filter(s => s.slug !== sector.slug).map((s) => (
                            <Link
                                key={s.slug}
                                href={`/tenders/sector/${s.slug}`}
                                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center"
                            >
                                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white text-center">
                    <h3 className="text-xl font-bold mb-2">Get {sector.name} Tender Alerts</h3>
                    <p className="text-emerald-100 mb-4">
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
