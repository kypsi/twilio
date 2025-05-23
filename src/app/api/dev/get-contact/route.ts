// app/api/dev/get-contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);
const tableName = 'contacts';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const savedBy = searchParams.get('savedBy');
    console.log("okkk", phone, savedBy)

    if (!phone || !savedBy) {
        return NextResponse.json({ error: 'Missing phone or savedBy' }, { status: 400 });
    }

    try {
        const records = await base(tableName)
            .select({
                filterByFormula: `AND({phone_number} = '${phone}', {saved_by} = '${savedBy}')`,
                maxRecords: 1,
            })
            .firstPage();

        if (records.length === 0) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        const record = records[0];

        const data = {
            name: record.get('name') as string,
            number: record.get('phone_number') as string,
            image: record.get('image') as string,
            lastSeen: 'Online',
        };

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching contact:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
