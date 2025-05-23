// Fetch messages between two numbers
import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(req: NextRequest) {
  try {
    const { sender, receiver } = await req.json();

    if (!sender || !receiver) {
      return NextResponse.json({ success: false, error: 'Missing sender or receiver' }, { status: 400 });
    }

    const records = await base('messages')
      .select({
        filterByFormula: `OR(
          AND({sender_number} = "${sender}", {receiver_number} = "${receiver}"),
          AND({sender_number} = "${receiver}", {receiver_number} = "${sender}")
        )`,
        sort: [{ field: 'time_stamp', direction: 'asc' }],
      })
      .all();

    const messages = records.map((r) => ({
      sender_number: r.get('sender_number'),
      receiver_number: r.get('receiver_number'),
      message_text: r.get('message_text'),
      time_stamp: r.get('time_stamp'),
    }));

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('[FETCH_MESSAGES_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
