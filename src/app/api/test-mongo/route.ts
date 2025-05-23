// app/api/test-mongo/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    return NextResponse.json({ status: 'connected', userCount });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return NextResponse.json({ status: 'error', error: (error as Error).message }, { status: 500 });
  }
}
