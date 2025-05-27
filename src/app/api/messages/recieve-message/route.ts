// /api/messages/receive-message/route.ts
import connectDB from '@/lib/mongo';
import Chat from '@/lib/models/Chat';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const From = formData.get('From') as string;
    const To = formData.get('To') as string;
    const Body = formData.get('Body') as string;

    if (!From || !To || !Body) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Find if "To" is a Twilio number of any user in our system
    const recipientUser = await User.findOne({ twilioNumber: To });
    if (!recipientUser) {
      // The message was not sent to a user we manage, ignore or just respond OK
      return NextResponse.json({ success: true, message: 'Recipient not found, ignoring' });
    }

    // Check if From is one of our users' Twilio numbers (to avoid duplicate message created in send-message API)
    const senderUser = await User.findOne({ twilioNumber: From });

    if (senderUser) {
      // This is a message sent from one of our users' Twilio numbers - skip saving to avoid duplicates
      // Because the send-message API already saved this message when sending out.
      return NextResponse.json({ success: true, message: 'Message from own user, skipping save to avoid duplicate' });
    }

    // Now find or create a chat between these two participants: [From, To]
    const participants = [From, To].sort();

    // Find chat where participantNumbers matches these participants exactly
    let chat = await Chat.findOne({
      isGroupChat: false,
      participantNumbers: { $all: participants, $size: participants.length }
    });

    if (!chat) {
      // Create a new chat for these two participants
      chat = await Chat.create({
        isGroupChat: false,
        participantNumbers: participants,
        name: `Chat between ${participants.join(' & ')}`,
        // admin? We can leave admin undefined for 1-on-1 chats
      });
    }

    // Save the incoming message
    const newMessage = await Message.create({
      chat: chat._id,
      sender: recipientUser._id,  // sender is the user whose Twilio number received the message
      content: Body,
      recipients: [From],  // recipient is the original sender phone number
    });

    // Update chat's last message info
    chat.lastMessage = newMessage._id;
    chat.lastMessageContent = Body;
    await chat.save();

    return NextResponse.json({ success: true, messageId: newMessage._id });
  } catch (err) {
    console.error('Error receiving message:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
