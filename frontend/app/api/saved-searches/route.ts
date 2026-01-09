import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, criteria } = body;

    if (!name || !criteria) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        const savedSearch = await prisma.savedSearch.create({
            data: {
                userId: session.user.id,
                name,
                criteria: JSON.stringify(criteria),
            },
        });
        return NextResponse.json(savedSearch);
    } catch (error) {
        return NextResponse.json({ error: "Failed to save search" }, { status: 500 });
    }
}
