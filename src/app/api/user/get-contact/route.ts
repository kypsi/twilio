// app/api/dev/get-contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Contact from "@/lib/models/Contact";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const savedBy = searchParams.get("savedBy");

    if (!phone || !savedBy) {
        return NextResponse.json({ error: "Missing phone or savedBy" }, { status: 400 });
    }

    try {
        await connectDB();

        // Find contact by phoneNumber and savedBy (assuming your schema fields)
        const contact = await Contact.findOne({
            phoneNumber: phone,
            savedBy: savedBy,
        }).lean();

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        // Prepare response data similar to Airtable version

        const data = contact;
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching contact:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
