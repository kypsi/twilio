// /api/message-history route
import { NextResponse } from "next/server";
import Airtable from "airtable";

export async function GET() {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID as string);
    const records: any[] = [];

    await base(process.env.AIRTABLE_TABLE_NAME as string)
      .select({ sort: [{ field: "Date", direction: "desc" }] })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push({
            id: record.id,
            from: record.get("From"),
            to: record.get("To"),
            message: record.get("Message"),
            date: record.get("Date"),
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
