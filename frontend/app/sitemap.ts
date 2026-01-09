import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SECTORS, PROVINCES, MUNICIPALITIES } from '@/lib/municipalities';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://opentenders.co.za';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${siteUrl}/tenders`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/awards`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
    ];

    // Sector landing pages
    const sectorPages: MetadataRoute.Sitemap = SECTORS.map((sector) => ({
        url: `${siteUrl}/tenders/sector/${sector.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
    }));

    // Province landing pages
    const provincePages: MetadataRoute.Sitemap = PROVINCES.map((province) => ({
        url: `${siteUrl}/tenders/province/${province.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
    }));

    // Municipality landing pages (234 municipalities)
    const municipalityPages: MetadataRoute.Sitemap = MUNICIPALITIES.map((municipality) => ({
        url: `${siteUrl}/tenders/municipality/${municipality.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: municipality.type === 'Metropolitan' ? 0.8 : 0.7,
    }));

    // Dynamic tender pages
    let tenderPages: MetadataRoute.Sitemap = [];

    try {
        const tenders = await prisma.tender.findMany({
            select: {
                slug: true,
                id: true,
                updatedAt: true,
            },
            where: {
                status: 'active',
            },
            orderBy: {
                publishedDate: 'desc',
            },
            take: 5000, // Limit to prevent massive sitemaps
        });

        tenderPages = tenders.map((tender) => ({
            url: `${siteUrl}/tenders/${tender.slug || tender.id}`,
            lastModified: tender.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));
    } catch (error) {
        console.error('Error generating tender sitemap:', error);
    }

    return [...staticPages, ...sectorPages, ...provincePages, ...municipalityPages, ...tenderPages];
}
