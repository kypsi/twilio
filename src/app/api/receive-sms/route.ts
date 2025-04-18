// app/api/receive-sms/route.ts
import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable client
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID as string);

export async function POST(req: Request) {
  // const { From, To, Body } = await req.json(); // Get data from the request body

  // console.log("📩 New SMS received!", req);
  // console.log("From:", From);
  // console.log("To:", To);
  // console.log("Body:", Body);


  // Save to Airtable
  try {
    const formData = await req.formData();

    const From = formData.get("From") as string;
    const To = formData.get("To") as string;
    const Body = formData.get("Body") as string;

    // console.log("From:", From);
    // console.log("To:", To);
    // console.log("Body:", Body);

    // Always add a dummy row to confirm the API was hit
    await base(process.env.AIRTABLE_TABLE_NAME as string).create([
      {
        fields: {
          From: "Webhook Triggered",
          To: "N/A",
          Message: "Dummy entry to confirm API was hit.",
          Type: "Debug",
        },
      },
    ]);

    if(From && To && Body){
      await base(process.env.AIRTABLE_TABLE_NAME  as string).create([
        {
          fields: {
            From: From,
            To: To,
            Message: Body,
            Type: "Received",
          }
        }
      ])
    }
    console.log("✅ SMS saved to Airtable");

    return NextResponse.json({ message: "Message received and saved to Airtable." }, { status: 200 });
  } catch (error) {
    console.error("Error saving to Airtable:", error);
    return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  }
}
