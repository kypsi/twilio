// app/api/dev/send-sms/route.ts
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID as string
);

export async function POST(req: NextRequest) {
  try {
    const { from, to, body, conversation_id } = await req.json();

    if (!from || !to || !body || !conversation_id) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

    const recipients = Array.isArray(to) ? to : [to];
    const results = [];

    for (const recipient of recipients) {
      const message = await client.messages.create({
        from,
        to: recipient,
        body,
      });

      await base("messages").create([
        {
          fields: {
            sender_number: from,
            receiver_number: recipient,
            chat_id: conversation_id,
            conversation_id,
            message_text: body,
            direction: "outgoing",
            is_read: false,
            status: "sent",
            twilio_number: from,
          },
        },
      ]);

      results.push({ recipient, sid: message.sid });
    }

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json({ error: "Message sending failed." }, { status: 500 });
  }
}
