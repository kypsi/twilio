// /api/user/delete-contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Contact from "@/lib/models/Contact";

export async function DELETE(req: NextRequest) {
  await connectDB();

  // Get id from query params
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id query parameter" }, { status: 400 });
  }

  try {
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Contact deleted" }, { status: 200 });
  } catch (err) {
    console.error("Failed to delete contact:", err);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
