// app/api/messages/get-or-create-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const body = await req.json();
        const { from, participantNumbers } = body;

        if (!from || !participantNumbers || participantNumbers.length < 2) {
            return NextResponse.json({ success: false, error: 'Missing participants or sender' }, { status: 400 });
        }

        // Find the user making the request (admin)
        const sender = await User.findOne({ twilioNumber: from });
        if (!sender) {
            return NextResponse.json({ success: false, error: 'Sender not found' }, { status: 404 });
        }

        // Sort for consistency
        const sorted = [...participantNumbers].sort();

        let chat = await Chat.findOne({
            isGroupChat: false,
            participantNumbers: { $all: sorted, $size: 2 },
        });

        if (!chat) {
            chat = await Chat.create({
                name: 'One-on-one chat',
                isGroupChat: false,
                participantNumbers: sorted,
                admin: sender._id,
            });
        }

        return NextResponse.json({ success: true, chat }, { status: 200 });

    } catch (err) {
        console.error('Error in get-or-create-chat:', err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
