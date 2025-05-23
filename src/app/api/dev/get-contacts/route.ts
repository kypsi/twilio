import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(req: NextRequest) {
  const savedBy = req.nextUrl.searchParams.get('savedBy');
  console.log(savedBy)
  if (!savedBy) {
    return NextResponse.json({ error: 'Missing savedBy parameter' }, { status: 400 });
  }

  try {
    const records = await base('contacts')
      .select({
        filterByFormula: `{saved_by} = '${savedBy}'`,
        sort: [{ field: 'name', direction: 'asc' }],
      })
      .all();

    const contacts = records.map((record) => ({
      id: record.id,
      name: record.get('name'),
      phoneNumber: record.get('phone_number'),
      savedBy: record.get('saved_by'),
      notes: record.get('notes') || '',
    }));

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
