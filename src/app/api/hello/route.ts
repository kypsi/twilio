import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ name: 'Hello, Im Jaskaran Singh' });
}