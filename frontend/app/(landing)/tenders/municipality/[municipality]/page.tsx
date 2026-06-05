import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMunicipalityBySlug, getMunicipalitiesByProvince, getProvinceBySlug, MUNICIPALITIES, PROVINCES } from '@/lib/municipalities';
import { Card, CardContent } from '@/components/ui/card';
import { PostgresSearch } from '@/components/postgres-search';
import { MapPin, ArrowLeft, Building2, Users, Landmark } from 'lucide-react';

// Generate static params for ALL 234 municipalities
export async function generateStaticParams() {
    return MUNICIPALITIES.map((municipality) => ({
        municipality: municipality.slug,
    }));
}

// Dynamic metadata for SEO - unique for each municipality
export async function generateMetadata({ params }: { params: Promise<{ municipality: string }> }): Promise<Metadata> {
    const { municipality: municipalitySlug } = await params;
    const municipality = getMunicipalityBySlug(municipalitySlug);

    if (!municipality) {
        return { title: 'Municipality Not Found' };
    }

    const isMetro = municipality.type === 'Metropolitan';
    const isDistrict = municipality.type === 'District';
    const typeLabel = isMetro ? 'Metropolitan Municipality' : isDistrict ? 'District Municipality' : 'Local Municipality';

    return {
        title: `${municipality.name} Tenders 2026 | ${municipality.province} Government Tenders`,
        description: `Find government tenders from ${municipality.name} ${typeLabel} in ${municipality.province}. Browse construction, cleaning, security, and IT tender opportunities. Updated daily with the latest RFQs and bids.`,
        keywords: [
            `${municipality.name} tenders`,
            `${municipality.name} municipality tenders`,
            `${municipality.name} government tenders`,
            `tenders in ${municipality.name}`,
            `${municipality.province} tenders`,
            `${isMetro ? 'metro' : isDistrict ? 'district municipality' : 'local municipality'} tenders`,
            'government tenders South Africa',
            'municipal tenders 2026',
        ],
        openGraph: {
            title: `${municipality.name} Government Tenders - ${municipality.province}`,
            description: `Browse government tender opportunities from ${municipality.name} in ${municipality.province}. Construction, cleaning, security, IT, and more.`,
        },
    };
}

export default async function MunicipalityPage({ params }: { params: Promise<{ municipality: string }> }) {
    const { municipality: municipalitySlug } = await params;
    const municipality = getMunicipalityBySlug(municipalitySlug);

    if (!municipality) {
        notFound();
    }

    const isMetro = municipality.type === 'Metropolitan';
    const isDistrict = municipality.type === 'District';
    const province = PROVINCES.find(p => p.name === municipality.province);
    const provinceMunicipalities = getMunicipalitiesByProvince(municipality.province);
    const nearbyMunicipalities = provinceMunicipalities
        .filter(m => m.slug !== municipality.slug)
        .slice(0, 6);

    // Unique content variations based on municipality type
    const sectorFocus = isMetro
        ? ['construction', 'IT services', 'security', 'cleaning', 'transport', 'professional services']
        : isDistrict
            ? ['infrastructure', 'bulk water', 'roads', 'regional planning', 'economic development']
            : ['construction', 'cleaning', 'security', 'road maintenance', 'water services'];

    // JSON-LD structured data for the municipality page
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${municipality.name} Government Tenders`,
        description: `Government tender opportunities from ${municipality.name} ${municipality.type} Municipality`,
        url: `https://opentenders.co.za/tenders/municipality/${municipality.slug}`,
        about: {
            '@type': 'GovernmentOrganization',
            name: `${municipality.name} ${municipality.type} Municipality`,
            areaServed: {
                '@type': 'AdministrativeArea',
                name: municipality.name,
                containedInPlace: {
                    '@type': 'State',
                    name: municipality.province,
                    containedInPlace: {
                        '@type': 'Country',
                        name: 'South Africa',
                    },
                },
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
                <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:mb-6 sm:text-sm">
                    <Link href="/tenders" className="hover:text-emerald-600">Tenders</Link>
                    <span>/</span>
                    {province && (
                        <>
                            <Link href={`/tenders/province/${province.slug}`} className="hover:text-emerald-600">
                                {province.name}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-slate-900 font-medium">{municipality.name}</span>
                </div>

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="mb-4 flex items-start gap-3 sm:gap-4">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg sm:h-14 sm:w-14 ${isMetro ? 'bg-emerald-100' : isDistrict ? 'bg-purple-100' : 'bg-blue-100'}`}>
                            {isMetro ? (
                                <Landmark className="h-5 w-5 text-emerald-600 sm:h-7 sm:w-7" />
                            ) : isDistrict ? (
                                <MapPin className="h-5 w-5 text-purple-600 sm:h-7 sm:w-7" />
                            ) : (
                                <Building2 className="h-5 w-5 text-blue-600 sm:h-7 sm:w-7" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isMetro ? 'bg-emerald-100 text-emerald-700' : isDistrict ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {municipality.type} Municipality
                                </span>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs text-slate-500">{municipality.province}</span>
                            </div>
                            <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
                                {municipality.name} Tenders
                            </h1>
                        </div>
                    </div>

                    {/* Unique description based on municipality type */}
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 sm:p-4">
                        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                            {isMetro ? (
                                <>
                                    <strong>{municipality.name} Metropolitan Municipality</strong>{" "}is one of South Africa&apos;s major metros,
                                    regularly publishing high-value tenders across multiple sectors. As a metro, {municipality.name} offers
                                    significant opportunities in {sectorFocus.slice(0, 3).join(', ')}, and more.
                                    Subscribe to receive alerts when new {municipality.name} tenders are published.
                                </>
                            ) : isDistrict ? (
                                <>
                                    <strong>{municipality.name}</strong>{" "}is a district municipality in {municipality.province},
                                    responsible for regional infrastructure and services. District municipalities publish tenders for
                                    {' '}{sectorFocus.slice(0, 3).join(', ')}, and cross-municipal projects.
                                    Stay updated with {municipality.name} tender opportunities.
                                </>
                            ) : (
                                <>
                                    <strong>{municipality.name} Local Municipality</strong>{" "}in {municipality.province} publishes
                                    tenders for local infrastructure and service delivery. Common opportunities include
                                    {' '}{sectorFocus.slice(0, 3).join(', ')}, and community development projects.
                                    Stay updated with the latest {municipality.name} tender notices.
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Sector Keywords */}
                <div className="mb-5 sm:mb-6">
                    <h2 className="text-sm font-medium text-slate-700 mb-2">Common tender categories in {municipality.name}:</h2>
                    <div className="flex flex-wrap gap-2">
                        {sectorFocus.map((sector) => (
                            <span key={sector} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                                {sector}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <Card className="mb-8">
                    <CardContent className="p-3 sm:p-6">
                        <h2 className="mb-3 text-base font-semibold text-slate-900 sm:mb-4 sm:text-lg">
                            Search {municipality.name} Tenders
                        </h2>
                        <PostgresSearch defaultQuery={municipality.name} />
                    </CardContent>
                </Card>

                {/* Nearby Municipalities */}
                {nearbyMunicipalities.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                        <h2 className="mb-3 text-base font-semibold text-slate-900 sm:mb-4 sm:text-lg">
                            Other Municipalities in {municipality.province}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {nearbyMunicipalities.map((m) => (
                                <Link
                                    key={m.slug}
                                    href={`/tenders/municipality/${m.slug}`}
                                    className="rounded-lg border border-slate-200 p-2.5 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50 sm:p-3"
                                >
                                    <span className="text-sm font-medium text-slate-700">{m.name}</span>
                                    <span className="block text-xs text-slate-400 mt-1">{m.type}</span>
                                </Link>
                            ))}
                        </div>
                        {province && (
                            <div className="mt-3 text-center">
                                <Link
                                    href={`/tenders/province/${province.slug}`}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    View all {municipality.province} municipalities →
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* CTA */}
                <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-center text-white sm:p-6">
                    <h3 className="mb-2 text-lg font-bold sm:text-xl">Get {municipality.name} Tender Alerts</h3>
                    <p className="mb-4 text-sm text-emerald-100 sm:text-base">
                        Never miss a tender from {municipality.name}. Subscribe for email notifications.
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-block bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                    >
                        Start Free Trial
                    </Link>
                </div>

                {/* SEO Footer Content */}
                <div className="mt-8 border-t border-slate-200 pt-6 sm:mt-12 sm:pt-8">
                    <h2 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg">
                        About {municipality.name} Municipality Tenders
                    </h2>
                    <div className="prose prose-slate prose-sm max-w-none">
                        <p>
                            {municipality.name} {municipality.type} Municipality, located in {municipality.province},
                            South Africa, regularly publishes government tenders for various goods and services.
                            These include {sectorFocus.join(', ')}, and other municipal requirements.
                        </p>
                        <p>
                            Open Tenders aggregates all publicly available tender notices from {municipality.name}
                            and other South African municipalities, making it easy for businesses to find and
                            apply for government contracts. Our platform provides instant search, email alerts,
                            and the ability to save and track tender opportunities.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
