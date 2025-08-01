// parcel.interface.ts
export type ParcelStatus = 'requested' | 'approved' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled';

export interface IStatusLog {
  status: ParcelStatus;
  timestamp: Date;
  location?: string;
  updatedBy: string; // user id or 'system'
  note?: string;
}

export interface IParcel {
  type: string;
  weight: number;
  sender: string; // User _id
  receiver: string; // User _id
  fromAddress: string;
  toAddress: string;
  division: string; // division _id
  deliveryDate?: Date;
  fee: number;
  trackingId: string;
  status: ParcelStatus;
  statusLogs: IStatusLog[];
  isBlocked?: boolean;
  isCancelled?: boolean;
}

export interface ICreateParcelRequest {
  type: string;
  weight: number;
  receiver: string;
  fromAddress: string;
  toAddress: string;
  division: string;
  deliveryDate?: Date;
}

export interface IUpdateParcelStatusRequest {
  status: ParcelStatus;
  location?: string;
  note?: string;
}