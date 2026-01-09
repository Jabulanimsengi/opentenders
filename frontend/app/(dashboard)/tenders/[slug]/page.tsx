import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format, isPast, addDays } from 'date-fns';
import { ArrowLeft, Calendar, Building2, MapPin, Clock, User, Mail, Phone, FileText, AlertTriangle, DollarSign, Briefcase, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatClosingDate } from '@/lib/date-utils';
import { type Tender } from '@/lib/api-client';
import { auth } from '@/auth';
import { TenderViewGate } from '@/components/tender-view-gate';
import { DownloadPDFWrapper } from '@/components/download-pdf-wrapper';
import { BookmarkButton } from '@/components/bookmark-button';
import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    try {
        const response = await fetch(`${API_BASE}/tenders/${slug}`, { cache: 'no-store' });
        if (!response.ok) {
            return { title: 'Tender Not Found' };
        }

        const tender: Tender = await response.json();
        const truncatedTitle = tender.title.length > 60 ? tender.title.substring(0, 57) + '...' : tender.title;
        const description = `${tender.buyerName || 'Government'} tender: ${tender.title.substring(0, 150)}. ${tender.closingDate ? `Closing: ${format(new Date(tender.closingDate), 'dd MMM yyyy')}` : ''}`;

        return {
            title: truncatedTitle,
            description: description,
            keywords: [
                'government tender',
                tender.category || 'public sector',
                tender.region || 'South Africa',
                tender.buyerName || '',
            ].filter(Boolean),
            openGraph: {
                title: tender.title,
                description: description,
                type: 'article',
            },
        };
    } catch {
        return { title: 'Tender Details' };
    }
}

export default async function TenderPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const slugParam = params.slug;
    const session = await auth();

    // TODO: Check actual subscription status from database
    // For now, logged-in users are considered subscribed (update this when Payfast is integrated)
    const isSubscribed = !!session?.user;

    // Fetch from backend API
    const response = await fetch(`${API_BASE}/tenders/${slugParam}`, { cache: 'no-store' });
    let tender: Tender | null = null;

    if (response.ok) {
        const text = await response.text();
        if (text && text.length > 0) {
            try {
                tender = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse tender JSON", e);
            }
        }
    }

    if (!tender) {
        return <div className="p-10">Tender not found</div>;
    }

    let rawData: any = {};
    try {
        if (tender.rawData) rawData = JSON.parse(tender.rawData);
    } catch (e) { }

    const isClosed = tender.closingDate ? isPast(new Date(tender.closingDate)) : false;
    const isClosingSoon = tender.closingDate && !isClosed && new Date(tender.closingDate) < addDays(new Date(), 7);
    const closingInfo = tender.closingDate ? formatClosingDate(tender.closingDate) : null;

    // Extract additional data from rawData
    const contactPerson = rawData.tender?.contactPerson;
    const value = rawData.tender?.value;
    const procurementMethod = rawData.tender?.procurementMethodDetails || rawData.tender?.procurementMethod;
    const briefingSession = rawData.tender?.briefingSession;
    const deliveryLocation = rawData.tender?.deliveryLocation;
    const specialConditions = rawData.tender?.specialConditions;
    const province = rawData.tender?.province;

    return (
        <TenderViewGate tenderId={tender.id} isSubscribed={isSubscribed}>
            <div className="container mx-auto py-10 px-4 max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                        <BookmarkButton tenderId={tender.id} />
                        <DownloadPDFWrapper
                            tender={{
                                title: tender.title,
                                description: tender.description || '',
                                buyerName: tender.buyerName || '',
                                region: tender.region || '',
                                category: tender.category || '',
                                closingDate: tender.closingDate ? new Date(tender.closingDate).toISOString() : null,
                                publishedDate: tender.publishedDate ? new Date(tender.publishedDate).toISOString() : null,
                                status: tender.status || 'active',
                                ocid: tender.ocid,
                            }}
                            isLoggedIn={!!session?.user}
                        />
                    </div>
                </div>

                {/* Hero Header Section - Separated from content */}
                <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Reference: {tender.ocid}</p>
                                <h1 className="text-xl md:text-2xl font-bold">{tender.description?.substring(0, 150) || tender.title}</h1>
                            </div>
                            <Badge
                                className={cn(
                                    "text-sm px-3 py-1 shrink-0",
                                    isClosed && "bg-red-500 hover:bg-red-600 text-white border-0",
                                    isClosingSoon && "bg-orange-500 hover:bg-orange-600 text-white border-0",
                                    !isClosed && !isClosingSoon && "bg-emerald-500 text-white border-0"
                                )}
                            >
                                {isClosed ? 'Closed' : isClosingSoon ? 'Closing Soon' : tender.status || 'Active'}
                            </Badge>
                        </div>

                        {/* Procurement Type Badge */}
                        {procurementMethod && (
                            <div className="mt-3">
                                <span className="inline-flex items-center gap-1 bg-emerald-500/20 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                                    <Briefcase className="w-3 h-3" />
                                    {procurementMethod}
                                </span>
                            </div>
                        )}

                        {/* Countdown - Inside Hero */}
                        {closingInfo && (
                            <div className={cn(
                                "mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 text-sm font-medium",
                                closingInfo.closed ? "text-red-400" : closingInfo.urgent ? "text-orange-400" : "text-emerald-400"
                            )}>
                                <Clock className="w-4 h-4" />
                                {closingInfo.text}
                                {tender.closingDate && !closingInfo.closed && (
                                    <span className="text-slate-400 ml-2">
                                        ({format(new Date(tender.closingDate), 'dd MMM yyyy, HH:mm')})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Card - Separated */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-6">
                        {/* Value Section */}
                        {value && value.amount > 0 && (
                            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 text-green-700">
                                    <DollarSign className="w-5 h-5" />
                                    <span className="font-semibold">Estimated Value:</span>
                                    <span className="text-xl font-bold">
                                        {value.currency || 'ZAR'} {value.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Buyer */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Buyer / Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{tender.buyerName || 'Unknown'}</p>
                                    {(province || tender.region) && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {province || tender.region}
                                        </p>
                                    )}
                                    {tender.category && (
                                        <p className="text-sm text-muted-foreground mt-1">{tender.category}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Key Dates */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Key Dates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    <p><span className="text-muted-foreground">Published:</span> {format(new Date(tender.publishedDate), 'dd MMM yyyy')}</p>
                                    {tender.closingDate && (
                                        <p><span className="text-muted-foreground">Closing:</span> {format(new Date(tender.closingDate), 'dd MMM yyyy, HH:mm')}</p>
                                    )}
                                    {(briefingSession?.date || tender.briefingDate) && (
                                        <p><span className="text-muted-foreground">Briefing:</span> {format(new Date(briefingSession?.date || tender.briefingDate), 'dd MMM yyyy, HH:mm')}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Contact Person */}
                            {contactPerson && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                            <User className="w-4 h-4" /> Contact Person
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1 text-sm">
                                        {contactPerson.name && <p className="font-medium">{contactPerson.name}</p>}
                                        {contactPerson.email && (
                                            <p className="flex items-center gap-1">
                                                <Mail className="w-3 h-3 text-muted-foreground" />
                                                <a href={`mailto:${contactPerson.email}`} className="text-emerald-600 hover:underline">{contactPerson.email}</a>
                                            </p>
                                        )}
                                        {contactPerson.telephoneNumber && (
                                            <p className="flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-muted-foreground" />
                                                <a href={`tel:${contactPerson.telephoneNumber}`} className="text-emerald-600 hover:underline">{contactPerson.telephoneNumber}</a>
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Briefing Session Details */}
                        {briefingSession && (briefingSession.venue || briefingSession.compulsory) && (
                            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Briefing Session
                                </h3>
                                <div className="text-sm text-amber-700 space-y-1">
                                    {briefingSession.compulsory && (
                                        <p className="flex items-center gap-1">
                                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                                            <strong>Compulsory attendance required</strong>
                                        </p>
                                    )}
                                    {briefingSession.venue && <p><span className="font-medium">Venue:</span> {briefingSession.venue}</p>}
                                    {briefingSession.date && <p><span className="font-medium">Date:</span> {format(new Date(briefingSession.date), 'dd MMM yyyy, HH:mm')}</p>}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Description
                            </h3>
                            <div className="prose max-w-none text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                                {tender.description}
                            </div>
                        </div>

                        {/* Special Conditions */}
                        {specialConditions && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Special Conditions
                                </h3>
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-800 whitespace-pre-line">
                                    {specialConditions}
                                </div>
                            </div>
                        )}

                        {/* Delivery Location */}
                        {deliveryLocation && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Delivery Location
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                    {deliveryLocation}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {rawData.tender?.documents && rawData.tender.documents.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Documents & Links
                                </h3>

                                {isSubscribed ? (
                                    <div className="grid gap-2">
                                        {rawData.tender.documents.map((doc: any, i: number) => (
                                            <a
                                                key={i}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 group">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 group-hover:text-emerald-600">{doc.title || doc.documentType || 'Document'}</p>
                                                        {doc.format && <p className="text-xs text-muted-foreground uppercase">{doc.format}</p>}
                                                    </div>
                                                </div>
                                                <span className="text-emerald-600 text-sm">Download →</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative overflow-hidden rounded-lg border border-slate-200">
                                        <div className="grid gap-2 p-3 opacity-40 blur-[2px] pointer-events-none select-none">
                                            {[1, 2].map((_, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                                        <div className="space-y-2">
                                                            <div className="h-4 w-32 bg-gray-200 rounded" />
                                                            <div className="h-3 w-12 bg-gray-200 rounded" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-[1px]">
                                            <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 text-center max-w-sm mx-4">
                                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Lock className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <h4 className="font-semibold text-slate-900 mb-1">Documents Locked</h4>
                                                <p className="text-sm text-slate-500 mb-3">Upgrade to a paid plan to download unlimited tender documents.</p>
                                                <Link href="/pricing">
                                                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-4 py-1.5 cursor-pointer">
                                                        Upgrade Now
                                                    </Badge>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reference Info */}
                        <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
                            <p><strong>OCID:</strong> {tender.ocid}</p>
                            <p><strong>Internal ID:</strong> {tender.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </TenderViewGate>
    );
}
