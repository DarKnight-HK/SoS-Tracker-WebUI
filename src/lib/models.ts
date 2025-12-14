import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interfaces ---
export interface ILocation extends Document {
  lat: number;
  lng: number;
  type: 'GPS' | 'LBS';
  battery: number;
  timestamp: Date;
}

export interface ICommand extends Document {
  cmd: string;
  status: 'PENDING' | 'EXECUTED';
  createdAt: Date;
}

// [NEW] Interface for Settings
export interface ISettings extends Document {
  guardianNumber: string;
  updatedAt: Date;
}

// --- Schemas ---
const LocationSchema = new Schema<ILocation>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  type: { type: String, default: 'GPS' },
  battery: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const CommandSchema = new Schema<ICommand>({
  cmd: { type: String, required: true },
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

// [NEW] Schema for Settings
const SettingsSchema = new Schema<ISettings>({
  guardianNumber: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

// --- Models ---
// Prevent overwriting models during hot-reload
export const Location: Model<ILocation> = mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);
export const Command: Model<ICommand> = mongoose.models.Command || mongoose.model<ICommand>('Command', CommandSchema);
export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
