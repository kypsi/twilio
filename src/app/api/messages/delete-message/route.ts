import connectDB from '@/lib/mongo';
import Message from '@/lib/models/Message';
import Chat from '@/lib/models/Chat';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messageId, userId } = await req.json();

    // console.log("===========>", messageId, userId);

    if (!messageId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid IDs' }, { status: 400 });
    }

    await connectDB();

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    // Check if logged-in user is the sender
    if (message.sender.toString() !== userId) {
      return NextResponse.json({ success: false, error: 'Not authorized to delete this message' }, { status: 403 });
    }

    // Find the chat
    const chat = await Chat.findById(message.chat);

    if (!chat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });
    }

    // Delete the message
    await message.deleteOne();

    // If this was the last message, update chat last message content
    if (chat.lastMessage?.toString() === messageId) {
      // Find the new last message (latest message in this chat)
      const lastMsg = await Message.findOne({ chat: chat._id }).sort({ createdAt: -1 });

      if (lastMsg) {
        chat.lastMessage = lastMsg._id;
        chat.lastMessageContent = lastMsg.content;
      } else {
        chat.lastMessage = null;
        chat.lastMessageContent = "This message was deleted";
      }

      await chat.save();
    }

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
