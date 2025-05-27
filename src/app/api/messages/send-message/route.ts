import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Chat from '@/lib/models/Chat';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import twilio from "twilio";

// import Contact from '@/lib/models/Contact';

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { from, to, body: messageBody } = body;
        // console.log("body", body)
        // console.log("from", from)
        // console.log("to", to)
        // console.log("messageBody", messageBody)
        if (!from || !to || !messageBody || !Array.isArray(to) || to.length === 0) {
            return NextResponse.json({ success: false, message: 'Missing or invalid fields' }, { status: 400 });
        }

        await connectDB();

        // Find sender by their Twilio number (must be a User)
        const sender = await User.findOne({ twilioNumber: from });
        if (!sender) {
            return NextResponse.json({ success: false, message: 'Sender not found' }, { status: 404 });
        }

        // Define chat participants as strings — either phone numbers or Twilio numbers
        const allParticipants = [from, ...to].sort();

        // Look for existing chat with same participants
        const allChats = await Chat.find({
            isGroupChat: to.length > 1
        });

        let chat = allChats.find((c) => {
            if (!Array.isArray(c.participantNumbers)) return false; // skip invalid chat
            const participantNumbers = [...c.participantNumbers].sort();
            return JSON.stringify(participantNumbers) === JSON.stringify(allParticipants);
        });

        // If not found, create a new chat
        if (!chat) {
            chat = await Chat.create({
                isGroupChat: to.length > 1,
                participantNumbers: allParticipants,
                name: `Group Chat ${Date.now()}`,
                admin: sender._id,
            });
            // console.log("Creating chat with:", allParticipants);
        }

        const sendResults = [];
        for (const recipient of to) {
            try {
                const message = await client.messages.create({
                    from,
                    to: recipient,
                    body: messageBody,
                });
                sendResults.push({ to: recipient, sid: message.sid, status: 'sent' });
            } catch (err) {
                console.error(`Failed to send SMS to ${recipient}`, err);
                sendResults.push({ to: recipient, error: 'Failed to send SMS' });
            }
        }

        // Save message
        const newMessage = await Message.create({
            chat: chat._id,
            sender: sender._id,
            content: messageBody,
            recipients: to, // Optional field to store where it was sent
        });

        // Update last message
        chat.lastMessage = newMessage._id;
        chat.lastMessageContent = newMessage.content;
        await chat.save();

        return NextResponse.json({
            success: true,
            chatId: chat._id,
            messageId: newMessage._id,
            sendResults,
        });

    } catch (err) {
        console.error('Error sending message:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
