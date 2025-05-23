// lib/models/Chat.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  name?: string;
  isGroupChat: boolean;
  participants: mongoose.Types.ObjectId[];
  admin?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
}

const ChatSchema = new Schema<IChat>({
  name: { type: String },
  isGroupChat: { type: Boolean, default: false },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admin: { type: Schema.Types.ObjectId, ref: 'User' },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
