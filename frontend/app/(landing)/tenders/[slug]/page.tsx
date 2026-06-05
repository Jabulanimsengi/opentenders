import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { format, isPast, addDays } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  DollarSign,
  Briefcase,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClosingDate } from "@/lib/date-utils";
import { type Tender } from "@/lib/api-client";
import { auth } from "@/auth";
import { DownloadPDFWrapper } from "@/components/download-pdf-wrapper";
import { BookmarkButton } from "@/components/bookmark-button";
import { DocumentAnalysis } from "@/components/document-analysis";
import { Metadata } from "next";
import { checkPaidAccess } from "@/lib/get-subscription";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type RawTenderDocument = {
  title?: string;
  documentType?: string;
  format?: string;
  url?: string;
};

type RawTenderData = {
  sourceId?: string;
  sourceName?: string;
  rawText?: string;
  tender?: {
    contactPerson?: {
      name?: string;
      email?: string;
      telephoneNumber?: string;
    };
    value?: {
      amount?: number;
      currency?: string;
    };
    procurementMethodDetails?: string;
    procurementMethod?: string;
    briefingSession?: {
      compulsory?: boolean;
      date?: string;
      venue?: string;
    };
    deliveryLocation?: string;
    specialConditions?: string;
    province?: string;
    documents?: RawTenderDocument[];
  };
};

function parseDocumentUrls(value?: string | null): RawTenderDocument[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((url): url is string => typeof url === "string" && url.length > 0)
      .map((url) => {
        const cleanUrl = url.split("?")[0] || url;
        const fileName = decodeURIComponent(
          cleanUrl.split("/").pop() || "Tender document",
        );
        const extension = fileName.includes(".")
          ? fileName.split(".").pop()
          : undefined;
        return {
          title: fileName.replace(/[-_]+/g, " "),
          documentType: "Tender document",
          format: extension,
          url,
        };
      });
  } catch {
    return [];
  }
}

function isUsableBriefingDate(
  briefingDate?: string | null,
  publishedDate?: string | null,
  closingDate?: string | null,
) {
  if (!briefingDate) return false;
  const briefing = new Date(briefingDate);
  if (Number.isNaN(briefing.getTime())) return false;

  const oneDayMs = 24 * 60 * 60 * 1000;
  if (publishedDate) {
    const published = new Date(publishedDate);
    if (
      !Number.isNaN(published.getTime()) &&
      briefing.getTime() + oneDayMs < published.getTime()
    ) {
      return false;
    }
  }

  if (closingDate) {
    const closing = new Date(closingDate);
    if (
      !Number.isNaN(closing.getTime()) &&
      briefing.getTime() > closing.getTime() + oneDayMs
    ) {
      return false;
    }
  }

  return true;
}

function formatAdvertisedDate(date?: string | null) {
  if (!date) return "Advertised date unavailable";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() <= 1971) {
    return "Advertised date unavailable";
  }

  return format(parsed, "dd MMM yyyy");
}

function labelSourceType(sourceType?: string | null) {
  if (!sourceType) return null;
  return sourceType
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await fetch(`${API_BASE}/tenders/${slug}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { title: "Tender Not Found" };
    }

    const tender: Tender = await response.json();
    const truncatedTitle =
      tender.title.length > 60
        ? tender.title.substring(0, 57) + "..."
        : tender.title;
    const description = `${tender.buyerName || "Government"} tender: ${tender.title.substring(0, 150)}. ${tender.closingDate ? `Closing: ${format(new Date(tender.closingDate), "dd MMM yyyy")}` : ""}`;

    return {
      title: truncatedTitle,
      description: description,
      keywords: [
        "government tender",
        tender.category || "public sector",
        tender.region || "South Africa",
        tender.buyerName || "",
      ].filter(Boolean),
      openGraph: {
        title: tender.title,
        description: description,
        type: "article",
      },
    };
  } catch {
    return { title: "Tender Details" };
  }
}

export default async function TenderPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const slugParam = params.slug;
  const session = await auth();
  const { isPaid: isSubscribed } = await checkPaidAccess();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  // Fetch from backend API
  const response = await fetch(`${API_BASE}/tenders/${slugParam}`, {
    cache: "no-store",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
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

  let rawData: RawTenderData = {};
  try {
    if (tender.rawData) rawData = JSON.parse(tender.rawData);
  } catch {}

  const isClosed = tender.closingDate
    ? isPast(new Date(tender.closingDate))
    : false;
  const isClosingSoon =
    tender.closingDate &&
    !isClosed &&
    new Date(tender.closingDate) < addDays(new Date(), 7);
  const closingInfo = tender.closingDate
    ? formatClosingDate(tender.closingDate)
    : null;

  // Extract additional data from rawData
  const contactPerson = rawData.tender?.contactPerson;
  const externalContact =
    tender.contactName || tender.contactEmail || tender.contactPhone
      ? {
          name: tender.contactName || undefined,
          email: tender.contactEmail || undefined,
          telephoneNumber: tender.contactPhone || undefined,
        }
      : undefined;
  const resolvedContact = contactPerson || externalContact;
  const value =
    rawData.tender?.value ||
    (typeof tender.estimatedValue === "number"
      ? { amount: tender.estimatedValue, currency: tender.currency || "ZAR" }
      : undefined);
  const valueAmount = typeof value?.amount === "number" ? value.amount : null;
  const procurementMethod =
    rawData.tender?.procurementMethodDetails ||
    rawData.tender?.procurementMethod ||
    tender.submissionMethod;
  const rawBriefingSession = rawData.tender?.briefingSession;
  const briefingDate = isUsableBriefingDate(
    tender.briefingDate,
    tender.publishedDate,
    tender.closingDate,
  )
    ? tender.briefingDate
    : undefined;
  const briefingSession =
    briefingDate ||
    tender.briefingVenue ||
    tender.briefingCompulsory ||
    rawBriefingSession?.venue ||
    rawBriefingSession?.compulsory
      ? {
          compulsory:
            tender.briefingCompulsory || rawBriefingSession?.compulsory,
          date: briefingDate || undefined,
          venue: tender.briefingVenue || rawBriefingSession?.venue,
        }
      : undefined;
  const deliveryLocation =
    rawData.tender?.deliveryLocation || tender.submissionAddress;
  const specialConditions =
    rawData.tender?.specialConditions || tender.specialConditions;
  const province = rawData.tender?.province || tender.province;
  const documents = rawData.tender?.documents?.length
    ? rawData.tender.documents
    : parseDocumentUrls(tender.documentUrls);
  const displayReference =
    tender.referenceNumber || tender.tenderNumber || tender.ocid;
  const isLoggedIn = !!session?.user;
  const advertisedSource =
    tender.sourceName || labelSourceType(tender.sourceType);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/tenders?status=active"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tenders
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {isLoggedIn && (
            <>
              <BookmarkButton
                tenderId={tender.id}
                isSubscriber={isSubscribed}
              />
              <DownloadPDFWrapper
                tender={{
                  title: tender.title,
                  description: tender.description || "",
                  buyerName: tender.buyerName || "",
                  region: tender.region || "",
                  category: tender.category || "",
                  closingDate: tender.closingDate
                    ? new Date(tender.closingDate).toISOString()
                    : null,
                  publishedDate: tender.publishedDate
                    ? new Date(tender.publishedDate).toISOString()
                    : null,
                  status: tender.status || "active",
                  ocid: tender.ocid,
                }}
                isLoggedIn={isLoggedIn}
              />
            </>
          )}
        </div>
      </div>

      {/* Hero Header Section - Separated from content */}
      <div className="mb-5 overflow-hidden rounded-lg bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white shadow-lg sm:mb-8 sm:rounded-xl">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="mb-1 break-words text-xs text-slate-400 sm:text-sm">
                Reference: {displayReference}
              </p>
              <h1 className="break-words text-lg font-bold leading-snug sm:text-xl md:text-2xl">
                {tender.title}
              </h1>
            </div>
            <Badge
              className={cn(
                "shrink-0 px-2.5 py-1 text-xs sm:px-3 sm:text-sm",
                isClosed && "bg-red-500 hover:bg-red-600 text-white border-0",
                isClosingSoon &&
                  "bg-orange-500 hover:bg-orange-600 text-white border-0",
                !isClosed &&
                  !isClosingSoon &&
                  "bg-emerald-500 text-white border-0",
              )}
            >
              {isClosed
                ? "Closed"
                : isClosingSoon
                  ? "Closing Soon"
                  : tender.status || "Active"}
            </Badge>
          </div>

          {/* Procurement Type Badge */}
          {procurementMethod && (
            <div className="mt-3">
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-xs sm:px-3 sm:text-sm">
                <Briefcase className="w-3 h-3" />
                <span className="truncate">{procurementMethod}</span>
              </span>
            </div>
          )}

          {/* Countdown - Inside Hero */}
          {closingInfo && (
            <div
              className={cn(
                "mt-4 flex flex-wrap items-center gap-2 border-t border-slate-700 pt-4 text-xs font-medium sm:text-sm",
                closingInfo.closed
                  ? "text-red-400"
                  : closingInfo.urgent
                    ? "text-orange-400"
                    : "text-emerald-400",
              )}
            >
              <Clock className="w-4 h-4" />
              {closingInfo.text}
              {tender.closingDate && !closingInfo.closed && (
                <span className="text-slate-400 sm:ml-2">
                  ({format(new Date(tender.closingDate), "dd MMM yyyy, HH:mm")})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!isLoggedIn && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm sm:rounded-xl">
            <div className="p-4 sm:p-6">
              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Building2 className="h-4 w-4" /> Buyer / Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="font-medium text-slate-900">
                      {tender.buyerName || "Unknown buyer"}
                    </p>
                    {(province || tender.region) && (
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {province || tender.region}
                      </p>
                    )}
                    {tender.category && (
                      <p className="text-muted-foreground">
                        {tender.category}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Calendar className="h-4 w-4" /> Key Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Advertised:</span>{" "}
                      {formatAdvertisedDate(tender.publishedDate)}
                    </p>
                    {tender.closingDate && (
                      <p>
                        <span className="text-muted-foreground">Closing:</span>{" "}
                        {format(
                          new Date(tender.closingDate),
                          "dd MMM yyyy, HH:mm",
                        )}
                      </p>
                    )}
                    {briefingDate && (
                      <p>
                        <span className="text-muted-foreground">Briefing:</span>{" "}
                        {format(new Date(briefingDate), "dd MMM yyyy, HH:mm")}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <FileText className="h-4 w-4" /> Tender Reference
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {tender.tenderNumber && (
                      <p>
                        <span className="text-muted-foreground">Tender No:</span>{" "}
                        {tender.tenderNumber}
                      </p>
                    )}
                    {displayReference && (
                      <p>
                        <span className="text-muted-foreground">Reference:</span>{" "}
                        {displayReference}
                      </p>
                    )}
                    {procurementMethod && (
                      <p className="text-muted-foreground">
                        {procurementMethod}
                      </p>
                    )}
                    {advertisedSource && (
                      <p>
                        <span className="text-muted-foreground">Source:</span>{" "}
                        {advertisedSource}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="mb-5">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  <FileText className="h-4 w-4" /> Description
                </h2>
                <div className="rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                  {tender.description ||
                    "No public description was supplied for this tender."}
                </div>
              </div>

              {briefingSession &&
                (briefingSession.venue || briefingSession.compulsory) && (
                  <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <Calendar className="h-4 w-4" /> Briefing Session
                    </h2>
                    <div className="space-y-1 text-sm text-amber-700">
                      {briefingSession.compulsory && (
                        <p className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <strong>Compulsory attendance required</strong>
                        </p>
                      )}
                      {briefingSession.venue && (
                        <p>
                          <span className="font-medium">Venue:</span>{" "}
                          {briefingSession.venue}
                        </p>
                      )}
                    </div>
                  </div>
                )}

              {specialConditions && (
                <div className="mb-5">
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    <AlertTriangle className="h-4 w-4" /> Special Conditions
                  </h2>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 whitespace-pre-line">
                    {specialConditions}
                  </div>
                </div>
              )}

              {deliveryLocation && (
                <div>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    <MapPin className="h-4 w-4" /> Delivery Location
                  </h2>
                  <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    {deliveryLocation}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-white shadow-sm sm:rounded-xl">
            <div className="p-5 text-center sm:p-8">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 sm:mb-4 sm:h-12 sm:w-12">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-slate-900 sm:text-xl">
                Sign in for documents and paid tools
              </h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto mb-5">
                Tender overview details are public. Sign in or subscribe to save
                tenders, download documents, analyse documents, and manage
                alerts.
              </p>
              <Link href="/pricing">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 px-4 py-1.5 cursor-pointer">
                  View Plans
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      )}

      {isLoggedIn && (
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm sm:rounded-xl">
        <div className="p-4 sm:p-6">
          {/* Value Section */}
          {valueAmount !== null && valueAmount > 0 && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 sm:mb-6 sm:p-4">
              <div className="flex flex-wrap items-center gap-2 text-green-700">
                <DollarSign className="h-5 w-5 shrink-0" />
                <span className="font-semibold">Estimated Value:</span>
                <span className="text-lg font-bold sm:text-xl">
                  {value?.currency || "ZAR"} {valueAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Key Info Grid */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {/* Buyer */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Buyer / Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{tender.buyerName || "Unknown"}</p>
                {(province || tender.region) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {province || tender.region}
                  </p>
                )}
                {tender.category && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {tender.category}
                  </p>
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
                <p>
                  <span className="text-muted-foreground">Advertised:</span>{" "}
                  {formatAdvertisedDate(tender.publishedDate)}
                </p>
                {tender.closingDate && (
                  <p>
                    <span className="text-muted-foreground">Closing:</span>{" "}
                    {format(new Date(tender.closingDate), "dd MMM yyyy, HH:mm")}
                  </p>
                )}
                {briefingDate && (
                  <p>
                    <span className="text-muted-foreground">Briefing:</span>{" "}
                    {format(new Date(briefingDate), "dd MMM yyyy, HH:mm")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact Person */}
            {isSubscribed &&
              (tender.sourceName ||
              tender.sourceUrl ||
              tender.tenderNumber ||
                tender.referenceNumber) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Source & Reference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {tender.tenderNumber && (
                    <p>
                      <span className="text-muted-foreground">Tender No:</span>{" "}
                      {tender.tenderNumber}
                    </p>
                  )}
                  {tender.referenceNumber &&
                    tender.referenceNumber !== tender.tenderNumber && (
                      <p>
                        <span className="text-muted-foreground">
                          Reference:
                        </span>{" "}
                        {tender.referenceNumber}
                      </p>
                    )}
                  {tender.sourceName && (
                    <p>
                      <span className="text-muted-foreground">Source:</span>{" "}
                      {tender.sourceName}
                    </p>
                  )}
                  {tender.sourceUrl && (
                    <p>
                      <a
                        href={tender.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Open original source
                      </a>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {resolvedContact && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Contact Person
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {resolvedContact.name && (
                    <p className="font-medium">{resolvedContact.name}</p>
                  )}
                  {resolvedContact.email && (
                    <p className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <a
                        href={`mailto:${resolvedContact.email}`}
                        className="text-emerald-600 hover:underline"
                      >
                        {resolvedContact.email}
                      </a>
                    </p>
                  )}
                  {resolvedContact.telephoneNumber && (
                    <p className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <a
                        href={`tel:${resolvedContact.telephoneNumber}`}
                        className="text-emerald-600 hover:underline"
                      >
                        {resolvedContact.telephoneNumber}
                      </a>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Briefing Session Details */}
          {briefingSession &&
            (briefingSession.venue || briefingSession.compulsory) && (
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
                  {briefingSession.venue && (
                    <p>
                      <span className="font-medium">Venue:</span>{" "}
                      {briefingSession.venue}
                    </p>
                  )}
                  {briefingSession.date && (
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {format(
                        new Date(briefingSession.date),
                        "dd MMM yyyy, HH:mm",
                      )}
                    </p>
                  )}
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
          {documents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Documents & Links
              </h3>

              {isSubscribed ? (
                <div className="grid gap-2">
                  {documents.map((doc, i: number) => (
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
                          <p className="font-medium text-gray-900 group-hover:text-emerald-600">
                            {doc.title || doc.documentType || "Document"}
                          </p>
                          {doc.format && (
                            <p className="text-xs text-muted-foreground uppercase">
                              {doc.format}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-emerald-600 text-sm">
                        Download →
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-lg border border-slate-200">
                  <div className="grid gap-2 p-3 opacity-40 blur-[2px] pointer-events-none select-none">
                    {[1, 2].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
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
                      <h4 className="font-semibold text-slate-900 mb-1">
                        Documents Locked
                      </h4>
                      <p className="text-sm text-slate-500 mb-3">
                        Upgrade to a paid plan to download unlimited tender
                        documents.
                      </p>
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

          {isSubscribed && (
            <DocumentAnalysis
              tenderTitle={tender.title}
              tenderDescription={tender.description}
              documents={documents}
            />
          )}

          {/* Reference Info */}
          {isSubscribed && (
            <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
              <p>
                <strong>OCID:</strong> {tender.ocid}
              </p>
              {tender.sourceName && (
              <p>
                <strong>Source:</strong> {tender.sourceName}
              </p>
              )}
              {tender.sourceUrl && (
              <p>
                <strong>Source URL:</strong> {tender.sourceUrl}
              </p>
              )}
              <p>
                <strong>Internal ID:</strong> {tender.id}
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
