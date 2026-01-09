import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://opentenders.co.za';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/dashboard/',
                    '/settings/',
                    '/bookmarks/',
                    '/saved-searches/',
                    '/subscribe/',
                ],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
