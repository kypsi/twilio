// /api/user/edit-contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Contact from "@/lib/models/Contact";

export async function PUT(req: NextRequest) {
  await connectDB();

  // Get id from query params
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id query parameter" }, { status: 400 });
  }

  try {
    const { name, phoneNumber } = await req.json();

    if (!name || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await Contact.findByIdAndUpdate(
      id,
      { name, phoneNumber },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Contact updated", contact: updated }, { status: 200 });
  } catch (err) {
    console.error("Failed to update contact:", err);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}
