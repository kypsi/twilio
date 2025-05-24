// models/Contact.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  phoneNumber: string;
  image?: string;
  savedBy: mongoose.Types.ObjectId; // Refers to the User _id
}

const ContactSchema: Schema<IContact> = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  image: { type: String },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
