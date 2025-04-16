import { NextRequest, NextResponse } from 'next/server';
import { twiml } from 'twilio';
import { airTableBase } from '@/lib/airtable';
import 'dotenv/config';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const from = formData.get('From') as string;
  const to = formData.get('To') as string;
  const body = formData.get('Body') as string;

  console.log("📩 New message received:");
  console.log("From:", from);
  console.log("To:", to);
  console.log("Message:", body);

  try {
    await airTableBase(process.env.AIRTABLE_TABLE_NAME!).create([
      {
        fields: {
          from,
          to,
          message: body,
          date: new Date().toISOString(),
        } as any, // 👈 temporarily use 'any' to satisfy TS, or use custom interface
      },
    ]);
    console.log("✅ Message saved to Airtable");
  } catch (err) {
    console.error("❌ Error saving to Airtable:", err);
  }

  const messagingResponse = new twiml.MessagingResponse();
  messagingResponse.message("Thanks! We received your message.");

  return new NextResponse(messagingResponse.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
