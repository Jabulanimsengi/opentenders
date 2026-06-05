import { MetadataRoute } from "next";
import { SECTORS, PROVINCES, MUNICIPALITIES } from "@/lib/municipalities";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://opentenders.co.za";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type SitemapTender = {
  id: string;
  slug?: string | null;
  updatedAt?: string | null;
};

type TenderListResponse = {
  data?: SitemapTender[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/tenders`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Sector landing pages
  const sectorPages: MetadataRoute.Sitemap = SECTORS.map((sector) => ({
    url: `${siteUrl}/tenders/sector/${sector.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // Province landing pages
  const provincePages: MetadataRoute.Sitemap = PROVINCES.map((province) => ({
    url: `${siteUrl}/tenders/province/${province.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // Municipality landing pages (234 municipalities)
  const municipalityPages: MetadataRoute.Sitemap = MUNICIPALITIES.map(
    (municipality) => ({
      url: `${siteUrl}/tenders/municipality/${municipality.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: municipality.type === "Metropolitan" ? 0.8 : 0.7,
    }),
  );

  // Dynamic tender pages from backend API
  let tenderPages: MetadataRoute.Sitemap = [];

  try {
    const response = await fetch(`${API_BASE}/tenders?limit=1000`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = (await response.json()) as TenderListResponse;
      tenderPages = (data.data || []).map((tender) => ({
        url: `${siteUrl}/tenders/${tender.slug || tender.id}`,
        lastModified: tender.updatedAt
          ? new Date(tender.updatedAt)
          : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("Error generating tender sitemap:", error);
  }

  return [
    ...staticPages,
    ...sectorPages,
    ...provincePages,
    ...municipalityPages,
    ...tenderPages,
  ];
}
