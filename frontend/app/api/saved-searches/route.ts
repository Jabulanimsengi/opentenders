import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserSubscription } from "@/lib/get-subscription";
import { isPaidUser } from "@/lib/subscription";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, criteria, alertsEnabled, alertFrequency } = body;

    if (!name || !criteria) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        const normalizedCriteria = {
            ...criteria,
            ...(Array.isArray(criteria.q) && { q: criteria.q.join(' ') }),
        };

        if (alertsEnabled) {
            const subscription = await getUserSubscription(session.user.id);
            if (!isPaidUser(subscription)) {
                return NextResponse.json(
                    { error: "A paid subscription is required for alerts" },
                    { status: 403 },
                );
            }
        }

        const savedSearch = await prisma.savedSearch.create({
            data: {
                userId: session.user.id,
                name,
                criteria: JSON.stringify(normalizedCriteria),
                alertsEnabled: Boolean(alertsEnabled),
                alertFrequency: alertFrequency === "weekly" ? "weekly" : "daily",
            },
        });
        return NextResponse.json(savedSearch);
    } catch {
        return NextResponse.json({ error: "Failed to save search" }, { status: 500 });
    }
}
