// File: /app/api/user/get-contacts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Contact from '@/lib/models/Contact';

export async function GET(req: NextRequest) {
  await connectDB();

  const savedBy = req.nextUrl.searchParams.get('savedBy');

  if (!savedBy) {
    return NextResponse.json({ error: 'Missing savedBy parameter' }, { status: 400 });
  }

  try {
    const contacts = await Contact.find({ savedBy }).sort({ name: 1 }); // sort by name ascending

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
