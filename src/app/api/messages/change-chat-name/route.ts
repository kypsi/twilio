import Chat from "@/lib/models/Chat";
import connectDB from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    await connectDB();

    const { chatId, newName, adminId } = await req.json();

    if (!chatId || !newName?.trim()) {
        return NextResponse.json({ success: false, message: "Chat ID and new name are required" }, { status: 400 });
    }

    if (!chatId || !newName || !adminId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return NextResponse.json({ success: false, message: "Chat not found" }, { status: 404 });
        }

        if (chat.admin?.toString() !== adminId) {
            return NextResponse.json({ success: false, message: "Only admin can rename this group" }, { status: 403 });
        }
        chat.name = newName.trim();
        await chat.save();

        return NextResponse.json({ success: true, message: "Group renamed successfully", updatedChat: chat });

    } catch (error) {
        console.error("Rename chat error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}