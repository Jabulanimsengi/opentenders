import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export async function POST(request: Request) {
    const session = await auth();
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;

    if (!accessToken) {
        return NextResponse.json({ message: 'Please sign in before analysing documents.' }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(`${API_BASE}/documents/analyze-url`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({ message: 'Document analysis failed.' }));
    return NextResponse.json(payload, { status: response.status });
}
