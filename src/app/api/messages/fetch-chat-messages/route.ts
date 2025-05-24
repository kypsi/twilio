import { NextResponse } from 'next/server';
import Message from '@/lib/models/Message';
import Chat from '@/lib/models/Chat'; // Import Chat model
import { Types } from 'mongoose';
import connectDB from '@/lib/mongo';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { chatId } = await req.json();

    if (!chatId || !Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ success: false, error: 'Invalid chatId' }, { status: 400 });
    }

    // Fetch chat info
    const chat = await Chat.findById(chatId).lean();
    if (!chat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });
    }

    // Fetch messages for that chat
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 }) // oldest to newest
      .lean();

    return NextResponse.json({
      success: true,
      chat, // include the chat object
      messages
    });
  } catch (error) {
    console.error('Fetch Chat Messages Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
