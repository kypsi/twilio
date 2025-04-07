import { NextRequest, NextResponse } from "next/server";
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(req: NextRequest) {
  try {
    const { from, to, message } = await req.json();

    if (!from || !to || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await base('smsHistory').create([
      {
        fields: {
          from,
          to: to.join(', '), 
          message,
          dateTime: new Date().toISOString(),
        },
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving history:", error);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}
