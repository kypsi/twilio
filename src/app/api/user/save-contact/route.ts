// import Contact from '@/lib/models/Contact';
// import connectDB from '@/lib/mongo';
// import { NextResponse } from 'next/server';


// export async function POST(req: Request) {
//   await connectDB();

//   try {
//     const { name, phoneNumber, savedBy } = await req.json();

//     if (!name || !phoneNumber || !savedBy) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     await Contact.create({ name, phoneNumber, savedBy });

//     return NextResponse.json({ message: 'Contact saved successfully' }, { status: 200 });
//   } catch (err) {
//     console.error('Failed to save contact:', err);
//     return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
//   }
// }

// export async function GET() {
//   return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
// }


import Contact from '@/lib/models/Contact';
import connectDB from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    await connectDB();

    try {
        const { name, phoneNumber, savedBy } = await req.json();

        if (!name || !phoneNumber || !savedBy) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const trimmedPhone = phoneNumber.trim();
        const trimmedName = name.trim();

        // Check if contact already exists for this user
        const existingContact = await Contact.findOne({
            phoneNumber: trimmedPhone,
            savedBy,
        });

        if (existingContact) {
            return NextResponse.json(
                { error: 'This contact is already saved.' },
                { status: 409 } // 409 Conflict
            );
        }

        await Contact.create({ name: trimmedName, phoneNumber: trimmedPhone, savedBy });

        return NextResponse.json({ message: 'Contact saved successfully' }, { status: 200 });
    } catch (err) {
        console.error('Failed to save contact:', err);
        return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
