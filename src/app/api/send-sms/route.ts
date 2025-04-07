import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import Airtable from "airtable";

// interface Data {
//   success?: boolean;
//   message?: string;
//   error?: string;
// }

export async function POST(req: NextRequest) {
  console.log("Received request:", req.method); // Debugging log

  try {
    const { numbers, message } = await req.json(); // Read JSON from request body

    // Basic validation
    if (!numbers || !message || !Array.isArray(numbers) || numbers.length === 0) {
      console.error("Validation Error: Missing numbers or message.");
      return NextResponse.json({ error: "Numbers (array) and message are required." }, { status: 400 });
    }

    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error("Twilio configuration missing. Check environment variables.");
      return NextResponse.json({ error: "Server misconfiguration. Contact support." }, { status: 500 });
    }

    // Check if AirTable credentials are configured
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME) {
      console.error("[Configuration Error] Airtable credentials missing in environment variables.");
      return NextResponse.json({ error: "Server misconfiguration. Please contact support." }, { status: 500 });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const airTableBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    console.log(`[Process] Sending message: "${message}" to numbers: ${numbers.join(', ')}`);
    const messages = numbers.map((number: string) => {
      if (!/^\+?[1-9]\d{1,14}$/.test(number)) {
        console.error(`Invalid phone number: ${number}`);
        throw new Error(`Invalid phone number format: ${number}`);
      }

      console.log(`Sending SMS to: ${number}`); // Debugging log
      return client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: numbers.join(', '),
      });
    });

    await Promise.all(messages);
    console.log("[Process] All messages sent successfully.");

    await airTableBase(process.env.AIRTABLE_TABLE_NAME).create([
      {
        fields: {
          From: process.env.TWILIO_PHONE_NUMBER,
          To: numbers.join(", "),
          Message: message,
        },
      },
    ]);

    console.log("[Process] Message history saved to Airtable successfully.");
    return NextResponse.json({ success: true, message: "Messages sent and history saved successfully!" }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error sending messages:", error);

    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
