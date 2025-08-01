// parcel.model.ts
import { Schema, model } from 'mongoose';
import { IParcel, IStatusLog } from './parcel.interface';

const statusLogSchema = new Schema<IStatusLog>({
  status: {
    type: String,
    enum: ['requested', 'approved', 'dispatched', 'in_transit', 'delivered', 'cancelled'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: String,
    required: true
  },
  note: {
    type: String,
    trim: true
  }
}, { _id: false });

const parcelSchema = new Schema<IParcel>({
  type: {
    type: String,
    required: [true, 'Parcel type is required'],
    trim: true,
    enum: ['document', 'package', 'electronics', 'clothing', 'food', 'others'],
    default: 'package'
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0.1, 'Weight must be at least 0.1 kg'],
    max: [50, 'Weight cannot exceed 50 kg']
  },
  sender: {
    type: String,
    required: [true, 'Sender is required'],
    ref: 'User'
  },
  receiver: {
    type: String,
    required: [true, 'Receiver is required'],
    ref: 'User'
  },
  fromAddress: {
    type: String,
    required: [true, 'From address is required'],
    trim: true,
    minlength: [10, 'From address must be at least 10 characters']
  },
  toAddress: {
    type: String,
    required: [true, 'To address is required'],
    trim: true,
    minlength: [10, 'To address must be at least 10 characters']
  },
  division: {
    type: String,
    required: [true, 'Division is required'],
  },
  deliveryDate: {
    type: Date,
    validate: {
      validator: function (value: Date) {
        return !value || value > new Date();
      },
      message: 'Delivery date must be in the future'
    }
  },
  fee: {
    type: Number,
    required: [true, 'Fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  trackingId: {
    type: String,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'dispatched', 'in_transit', 'delivered', 'cancelled'],
    default: 'requested'
  },
  statusLogs: [statusLogSchema],
  isBlocked: {
    type: Boolean,
    default: false
  },
  isCancelled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate tracking ID
parcelSchema.pre('save', function (next) {
  if (this.isNew && !this.trackingId) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.trackingId = `TRK-${year}${month}${day}-${random}`;
  }
  next();
});

// Pre-save middleware to add status log when status changes


// Index for better query performance
parcelSchema.index({ sender: 1, status: 1 });
parcelSchema.index({ receiver: 1, status: 1 });
parcelSchema.index({ status: 1 });

export const Parcel = model<IParcel>('Parcel', parcelSchema);