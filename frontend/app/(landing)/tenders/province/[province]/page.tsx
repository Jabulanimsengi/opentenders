import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvinceBySlug, getMunicipalitiesByProvince, PROVINCES } from '@/lib/municipalities';
import { Card, CardContent } from '@/components/ui/card';
import { PostgresSearch } from '@/components/postgres-search';
import { MapPin, ArrowLeft, Building2 } from 'lucide-react';

// Generate static params for all provinces
export async function generateStaticParams() {
    return PROVINCES.map((province) => ({
        province: province.slug,
    }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ province: string }> }): Promise<Metadata> {
    const { province: provinceSlug } = await params;
    const province = getProvinceBySlug(provinceSlug);

    if (!province) {
        return { title: 'Province Not Found' };
    }

    const municipalities = getMunicipalitiesByProvince(province.name);
    const metros = municipalities.filter(m => m.type === 'Metropolitan').map(m => m.name).join(', ');

    return {
        title: `Tenders in ${province.name} 2026 | Government Tenders`,
        description: `Find latest government tenders in ${province.name}, South Africa. Browse opportunities from ${metros || 'local municipalities'} and provincial departments. Updated daily.`,
        keywords: [
            `tenders in ${province.name}`,
            `${province.name} government tenders`,
            `${province.name} municipal tenders`,
            ...municipalities.slice(0, 5).map(m => `${m.name} tenders`),
        ],
        openGraph: {
            title: `${province.name} Tenders - Government Opportunities`,
            description: `Browse government tenders in ${province.name}. Find construction, cleaning, security, and IT opportunities.`,
        },
    };
}

export default async function ProvincePage({ params }: { params: Promise<{ province: string }> }) {
    const { province: provinceSlug } = await params;
    const province = getProvinceBySlug(provinceSlug);

    if (!province) {
        notFound();
    }

    const municipalities = getMunicipalitiesByProvince(province.name);
    const metros = municipalities.filter(m => m.type === 'Metropolitan');
    const locals = municipalities.filter(m => m.type === 'Local');

    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Government Tenders in ${province.name}`,
        description: `Browse government tender opportunities in ${province.name}, South Africa`,
        url: `https://opentenders.co.za/tenders/province/${province.slug}`,
        about: {
            '@type': 'Place',
            name: province.name,
            containedInPlace: {
                '@type': 'Country',
                name: 'South Africa',
            },
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
                            <MapPin className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Tenders in {province.name}
                            </h1>
                            <p className="text-sm text-slate-600 sm:text-base">Government tender opportunities in {province.name}</p>
                        </div>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base">
                        Browse the latest government tenders from {province.name} provincial departments,
                        {metros.length > 0 && ` metropolitan municipalities including ${metros.map(m => m.name).join(', ')},`}
                        {` and ${locals.length} local municipalities.`}
                    </p>
                </div>

                {/* Metro Municipalities */}
                {metros.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-3">Metropolitan Municipalities</h2>
                        <div className="flex flex-wrap gap-2">
                            {metros.map((m) => (
                                <span key={m.slug} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {m.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Local Municipalities */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Local Municipalities ({locals.length})</h2>
                    <div className="flex flex-wrap gap-2">
                        {locals.slice(0, 15).map((m) => (
                            <span key={m.slug} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                                {m.name}
                            </span>
                        ))}
                        {locals.length > 15 && (
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm">
                                +{locals.length - 15} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-3 sm:p-6">
                        <PostgresSearch defaultRegion={province.name} />
                    </CardContent>
                </Card>

                {/* Other Provinces */}
                <div className="mt-8 sm:mt-12">
                    <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:mb-4 sm:text-xl">Browse Other Provinces</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {PROVINCES.filter(p => p.slug !== province.slug).map((p) => (
                            <Link
                                key={p.slug}
                                href={`/tenders/province/${p.slug}`}
                                className="rounded-lg border border-slate-200 p-2.5 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50 sm:p-3"
                            >
                                <span className="text-sm font-medium text-slate-700">{p.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-center text-white sm:mt-12 sm:p-6">
                    <h3 className="mb-2 text-lg font-bold sm:text-xl">Get {province.name} Tender Alerts</h3>
                    <p className="mb-4 text-sm text-emerald-100 sm:text-base">
                        Subscribe to receive email notifications when new tenders are published in {province.name}.
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
