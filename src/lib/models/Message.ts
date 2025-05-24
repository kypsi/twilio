// lib/models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  mediaUrl?: string;
  createdAt: Date;
  recipients: string[];
}

const MessageSchema = new Schema<IMessage>({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  mediaUrl: { type: String },
  recipients: { type: [String] },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
