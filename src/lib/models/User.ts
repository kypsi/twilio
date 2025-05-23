// lib/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email?: string;
    phoneNumber: string;
    isAdmin: boolean;
    role?: string;
    twilioNumber?: string;
    password?: string;

}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String },
    isAdmin: { type: Boolean, default: false },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    twilioNumber: { type: String, required: true, },
    password: { type: String, required: true },

}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
