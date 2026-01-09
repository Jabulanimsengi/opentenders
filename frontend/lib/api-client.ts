/**
 * API Client for Open Tenders Backend
 * Base URL: http://localhost:3001/api
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Type definitions
export interface Tender {
    id: string;
    ocid: string;
    slug: string | null;
    publishedDate: string;
    title: string;
    description: string | null;
    status: string | null;
    category: string | null;
    region: string | null;
    closingDate: string | null;
    briefingDate: string | null;
    buyerName: string | null;
    rawData: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TenderStats {
    totalCount: number;
    newThisWeek: number;
    closingSoon: number;
    activeCount: number;
    closedCount: number;
    cancelledCount: number;
    awardedCount: number;
}

export interface TenderFacets {
    regions: { value: string; count: number }[];
    categories: { value: string; count: number }[];
    buyers: { value: string; count: number }[];
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface User {
    id: string;
    name: string | null;
    email: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// Storage helpers
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
};

// Fetch wrapper with auth
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// Auth API
export const authApi = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await fetchApi<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(response.access_token);
        return response;
    },

    register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
        const response = await fetchApi<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        setToken(response.access_token);
        return response;
    },

    getProfile: async (): Promise<User> => {
        return fetchApi<User>('/auth/me');
    },

    logout: () => {
        removeToken();
    },
};

// Tenders API
export interface TenderQueryParams {
    q?: string;
    page?: number;
    limit?: number;
    status?: string[];
    region?: string[];
    category?: string[];
    buyer?: string[];
}

export const tendersApi = {
    list: async (params: TenderQueryParams = {}): Promise<PaginatedResponse<Tender>> => {
        const searchParams = new URLSearchParams();

        if (params.q) searchParams.set('q', params.q);
        if (params.page) searchParams.set('page', String(params.page));
        if (params.limit) searchParams.set('limit', String(params.limit));
        if (params.status?.length) searchParams.set('status', params.status.join(','));
        if (params.region?.length) searchParams.set('region', params.region.join(','));
        if (params.category?.length) searchParams.set('category', params.category.join(','));
        if (params.buyer?.length) searchParams.set('buyer', params.buyer.join(','));

        const query = searchParams.toString();
        return fetchApi<PaginatedResponse<Tender>>(`/tenders${query ? `?${query}` : ''}`);
    },

    getOne: async (slug: string): Promise<Tender | null> => {
        try {
            return await fetchApi<Tender>(`/tenders/${slug}`);
        } catch {
            return null;
        }
    },

    getStats: async (): Promise<TenderStats> => {
        return fetchApi<TenderStats>('/tenders/stats');
    },

    getFacets: async (): Promise<TenderFacets> => {
        return fetchApi<TenderFacets>('/tenders/facets');
    },
};

// Server-side fetch (for SSR)
export async function serverFetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}
