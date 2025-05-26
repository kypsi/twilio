// app/api/messages/fetch-chats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Chat from '@/lib/models/Chat';
import Contact from '@/lib/models/Contact';
import User from '@/lib/models/User';
// import Message from '@/lib/models/Message'; 

export async function POST(req: NextRequest) {
    try {
        const { twilioNumber } = await req.json();

        if (!twilioNumber) {
            return NextResponse.json({ success: false, message: 'Twilio number required' }, { status: 400 });
        }

        await connectDB();

        // Find user by twilioNumber to get _id
        const user = await User.findOne({ twilioNumber });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Find all chats involving this user's twilioNumber
        const chats = await Chat.find({ participantNumbers: twilioNumber })
            .sort({ updatedAt: -1 })
            // .populate('lastMessage');
 
            // console.log("chats", chats)
        // Fetch contacts saved by this user
        const contacts = await Contact.find({ savedBy: user._id });

        // Map contacts for quick lookup: phoneNumber -> name
        const contactMap = new Map(contacts.map(c => [c.phoneNumber, c.name]));
 
        const responseChats = chats.map(chat => {
            // Filter out logged-in user's number to find other participant(s)
            const otherNumbers = chat.participantNumbers.filter((num: string) => num !== twilioNumber);

            // Determine chat display name
            let chatName = chat.name; // for group chats

            if (!chat.isGroupChat && otherNumbers.length === 1) {
                // Use contact name if found, else fallback to number
                chatName = contactMap.get(otherNumbers[0]) || otherNumbers[0];
            }

            return {
                chatId: chat._id,
                name: chatName,
                isGroupChat: chat.isGroupChat,
                lastMessage: chat.lastMessageContent || '',
                time: chat.lastMessage?.createdAt || chat.updatedAt,
                participantNumbers: chat.participantNumbers,
            };
        });

        return NextResponse.json({ success: true, chats: responseChats });

    } catch (err) {
        console.error('Error fetching chats:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
