// /api/message-history route
import { NextResponse } from "next/server";
import Airtable from "airtable";

interface HistoryItem {
    id: string;
    from: string;
    to: string;
    message: string;
    date: string;
    type: string;
}

export async function GET() {
    try {
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID as string);
        const records: HistoryItem[] = [];

        await base(process.env.AIRTABLE_TABLE_NAME as string)
            .select({ sort: [{ field: "Date", direction: "desc" }] })
            .eachPage((pageRecords, fetchNextPage) => {
                pageRecords.forEach((record) => {
                    records.push({
                        id: record.id,
                        from: record.get("From") as string,
                        to: record.get("To") as string,
                        message: record.get("Message") as string,
                        date: record.get("Date") as string,
                        type: record.get("Type") as string,
                    });
                });
                fetchNextPage();
            });

        return NextResponse.json({ records });
    } catch (error) {
        console.error("[History Fetch Error]", error);
        return NextResponse.json({ error: "Failed to fetch message history." }, { status: 500 });
    }
}
