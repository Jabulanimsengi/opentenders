import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProvinceBySlug, getMunicipalitiesByProvince, PROVINCES } from '@/lib/municipalities';
import { Card, CardContent } from '@/components/ui/card';
import { TypesenseSearch } from '@/components/typesense-search';
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
                            <MapPin className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Tenders in {province.name}
                            </h1>
                            <p className="text-slate-600">Government tender opportunities in {province.name}</p>
                        </div>
                    </div>
                    <p className="text-slate-600 mt-4 max-w-3xl">
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
                <div className="mb-8">
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
                    <CardContent className="p-6">
                        <TypesenseSearch />
                    </CardContent>
                </Card>

                {/* Other Provinces */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Browse Other Provinces</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {PROVINCES.filter(p => p.slug !== province.slug).map((p) => (
                            <Link
                                key={p.slug}
                                href={`/tenders/province/${p.slug}`}
                                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-center"
                            >
                                <span className="text-sm font-medium text-slate-700">{p.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white text-center">
                    <h3 className="text-xl font-bold mb-2">Get {province.name} Tender Alerts</h3>
                    <p className="text-emerald-100 mb-4">
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
