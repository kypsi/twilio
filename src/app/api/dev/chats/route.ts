// app/api/messages/chats/route.ts
import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { Message } from '@/types/message';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY! }).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(req: Request) {
  const { twilioNumber } = await req.json();

  if (!twilioNumber) {
    return NextResponse.json({ success: false, error: 'Twilio number required' }, { status: 400 });
  }

  const allMessages: Message[] = [];

  await base('messages')
    .select({ sort: [{ field: 'time_stamp', direction: 'desc' }] })
    .eachPage((records, fetchNextPage) => {
      records.forEach((record) => {
        const fields = record.fields;
        allMessages.push({
          id: record.id,
          sender: fields.sender_number ? String(fields.sender_number) : '',  
          receiver: fields.receiver_number ? String(fields.receiver_number) : '', 
          message: fields.message_text ? String(fields.message_text) : '',
          time: fields.time_stamp ? String(fields.time_stamp) : '',
        });
      });
      fetchNextPage();
    });

  const groupedChats: Record<string, Message> = {};

  allMessages.forEach((msg) => {
    if (
      msg.sender === twilioNumber ||
      msg.receiver === twilioNumber
    ) {
      const otherNumber = msg.sender === twilioNumber ? msg.receiver : msg.sender;

      if (!groupedChats[otherNumber]) {
        groupedChats[otherNumber] = msg; // Since it's sorted DESC by time
      }
    }
  });

  return NextResponse.json({
    success: true,
    chats: Object.entries(groupedChats).map(([number, msg]: [string, Message]) => ({
      number,
      message: msg.message,
      time: msg.time,
    })),
  });
}
