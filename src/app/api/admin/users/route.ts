// app/api/admin/users/route.ts
import { getAllUsers } from '@/lib/airtable/airtable';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await getAllUsers();
  return NextResponse.json(users);
}
