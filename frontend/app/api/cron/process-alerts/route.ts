import { processAlerts } from "@/lib/alerts";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const results = await processAlerts();
        return NextResponse.json({ success: true, alertsSent: results });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to process alerts" }, { status: 500 });
    }
}
