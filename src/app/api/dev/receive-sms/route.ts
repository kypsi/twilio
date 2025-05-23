// app/api/receive-sms/route.ts
import { NextResponse } from "next/server";
import Airtable from "airtable";
// import { v4 as uuidv4 } from "uuid";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID as string
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const From = formData.get("From") as string;
    const To = formData.get("To") as string;
    const Body = formData.get("Body") as string;

    if (!From || !To || !Body) {
      return NextResponse.json({ error: "Missing SMS data" }, { status: 400 });
    }

    const conversationId = `${To}-${From}`; // Reverse since Twilio number is receiver
    await base("messages").create([
      {
        fields: {
          sender_number: From,
          receiver_number: To,
          conversation_id: conversationId,
          chat_id: conversationId,
          message_text: Body,
          direction: "incoming",
          is_read: false,
          status: "received",
          twilio_number: To,
          // messageBy: "other",
        },
      },
    ]);

    return NextResponse.json({ message: "Message saved." }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  }
}
