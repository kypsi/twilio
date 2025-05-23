import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phoneNumber, savedBy, notes } = body;

    if (!name || !phoneNumber || !savedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base('contacts').create([
      {
        fields: {
          name,
          phone_number: phoneNumber,
          saved_by: savedBy,
          twilio_number: savedBy,
          notes: notes || '',
        },
      },
    ]);

    return NextResponse.json({ message: 'Contact saved successfully' }, { status: 200 });
  } catch (err) {
    console.error('Failed to save contact:', err);
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
  }
}

// Optional: Add handler for unsupported methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
