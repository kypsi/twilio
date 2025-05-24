// lib/models/Chat.ts
import mongoose, { Schema, Document } from 'mongoose';
// import Message from '@/lib/models/Message';

export interface IChat extends Document {
  name?: string;
  isGroupChat: boolean;
  participants: mongoose.Types.ObjectId[];
  admin?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageContent?: string;
  participantNumbers: string[];
}

const ChatSchema = new Schema<IChat>({
  name: { type: String },
  isGroupChat: { type: Boolean, default: false },
  // participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  participantNumbers: {
    type: [String], // Store all as phone numbers/Twilio numbers
    required: true,
  },

  admin: { type: Schema.Types.ObjectId, ref: 'User' },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  lastMessageContent: { type: String },
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
