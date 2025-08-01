// division.model.ts
import { Schema, model } from 'mongoose';
import { IDivision } from './division.interface';

const divisionSchema = new Schema<IDivision>({
  name: {
    type: String,
    required: [true, 'Division name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Division name must be at least 2 characters'],
    maxlength: [50, 'Division name cannot exceed 50 characters']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  }
}, {
  timestamps: true
});

export const Division = model<IDivision>('Division', divisionSchema);