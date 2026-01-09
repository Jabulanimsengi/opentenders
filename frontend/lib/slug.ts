// Utility functions for generating and handling slugs

export function generateSlug(title: string, id?: string): string {
    // Convert to lowercase
    let slug = title.toLowerCase();

    // Replace special characters with spaces
    slug = slug.replace(/[^a-z0-9\s-]/g, '');

    // Replace multiple spaces with single space
    slug = slug.replace(/\s+/g, ' ').trim();

    // Replace spaces with hyphens
    slug = slug.replace(/\s/g, '-');

    // Remove multiple consecutive hyphens
    slug = slug.replace(/-+/g, '-');

    // Truncate to reasonable length (max 60 chars for SEO)
    if (slug.length > 60) {
        slug = slug.substring(0, 60);
        // Don't cut off in middle of word
        const lastHyphen = slug.lastIndexOf('-');
        if (lastHyphen > 40) {
            slug = slug.substring(0, lastHyphen);
        }
    }

    // Add short ID suffix to ensure uniqueness
    if (id) {
        const shortId = id.substring(0, 8);
        slug = `${slug}-${shortId}`;
    }

    return slug;
}

// Extract ID from slug (if ID is appended)
export function extractIdFromSlug(slug: string): string | null {
    // Check if slug ends with a UUID-like pattern (8 chars after last hyphen)
    const parts = slug.split('-');
    if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        // UUID short format is 8 chars
        if (lastPart.length === 8 && /^[a-f0-9]+$/.test(lastPart)) {
            return lastPart;
        }
    }
    return null;
}
