import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

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

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const messages = numbers.map((number: string) => {
      if (!/^\+?[1-9]\d{1,14}$/.test(number)) {
        console.error(`Invalid phone number: ${number}`);
        throw new Error(`Invalid phone number format: ${number}`);
      }

      console.log(`Sending SMS to: ${number}`); // Debugging log
      return client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: number,
      });
    });

    await Promise.all(messages);

    console.log("Messages sent successfully.");
    return NextResponse.json({ success: true, message: "Messages sent successfully!" }, { status: 200 });

  } catch (error: unknown) { 
    console.error("Error sending messages:", error);

    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
