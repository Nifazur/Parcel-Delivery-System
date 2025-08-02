/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';

import { ParcelStatus } from './parcel.interface';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ParcelService } from './parcel.service';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes'


const createParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { type, weight, receiver, fromAddress, toAddress, division, deliveryDate } = req.body;
  const senderId = (req.user as JwtPayload).userId;

  const parcel = await ParcelService.createParcel({
    type,
    weight: parseFloat(weight),
    receiver,
    fromAddress,
    toAddress,
    division,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined
  }, senderId);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Parcel created successfully',
    data: parcel,
  });
});

const getParcelById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const userId = (req.user as JwtPayload).userId;
  const userRole = (req.user as JwtPayload).role;

  const parcel = await ParcelService.getParcelById(id);
  if (!parcel){
    throw new AppError(httpStatus.NOT_FOUND,'Parcel not found');
  }

  // Type guard functions
  const getSenderId = (sender: any): string => {
    if (typeof sender === 'string') return sender;
    if (sender && sender._id) return sender._id.toString();
    return sender.toString(); // fallback
  };

  const getReceiverId = (receiver: any): string => {
    if (typeof receiver === 'string') return receiver;
    if (receiver && receiver._id) return receiver._id.toString();
    return receiver.toString(); // fallback
  };

  const senderId = getSenderId(parcel.sender);
  const receiverId = getReceiverId(parcel.receiver);

  if (
    userRole !== 'admin' &&
    senderId !== userId &&
    receiverId !== userId
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED,'Unauthorized to view this parcel');
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Parcel retrieved successfully',
    data: parcel,
  });
});

const trackParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { trackingId } = req.params;
  const parcel = await ParcelService.getParcelByTrackingId(trackingId);
  if (!parcel){
    throw new AppError(httpStatus.NOT_FOUND,'Parcel not found with this tracking ID');
  }

  const trackingInfo = {
    trackingId: parcel.trackingId,
    status: parcel.status,
    statusLogs: parcel.statusLogs,
    fromAddress: parcel.fromAddress,
    toAddress: parcel.toAddress,
    deliveryDate: parcel.deliveryDate,
    isBlocked: parcel.isBlocked,
    isCancelled: parcel.isCancelled
  };

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Tracking information retrieved successfully',
    data: trackingInfo,
  });
});

const getMySentParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const senderId = (req.user as JwtPayload).userId;
  const status = req.query.status as ParcelStatus;

  const parcels = await ParcelService.getSenderParcels(senderId, status);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Sent parcels retrieved successfully',
    data: parcels,
  });
});

const getMyReceivedParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const receiverId = (req.user as JwtPayload).userId;
  const status = req.query.status as ParcelStatus;

  const parcels = await ParcelService.getReceiverParcels(receiverId, status);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Received parcels retrieved successfully',
    data: parcels,
  });
});

const getAllParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as ParcelStatus;

  const result = await ParcelService.getAllParcels(page, limit, status);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'All parcels retrieved successfully',
    data: result,
  });
});

const updateParcelStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, location, note } = req.body;
  const adminId = (req.user as JwtPayload).userId;

  const parcel = await ParcelService.updateParcelStatus(id, {
    status,
    location,
    note
  }, adminId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Parcel status updated successfully',
    data: parcel,
  });
});

const cancelParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req.user as JwtPayload).userId;
  const userRole = (req.user as JwtPayload).role;

  const parcel = await ParcelService.cancelParcel(id, userId, userRole);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Parcel cancelled successfully',
    data: parcel,
  });
});

const confirmDelivery = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const receiverId = (req.user as JwtPayload).userId;

  const parcel = await ParcelService.confirmDelivery(id, receiverId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Delivery confirmed successfully',
    data: parcel,
  });
});

const blockParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminId = (req.user as JwtPayload).userId;

  const parcel = await ParcelService.blockParcel(id, adminId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Parcel blocked successfully',
    data: parcel,
  });
});

const unblockParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminId = (req.user as JwtPayload).userId;

  const parcel = await ParcelService.unblockParcel(id, adminId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Parcel unblocked successfully',
    data: parcel,
  });
});

const getParcelStatistics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await ParcelService.getParcelStatistics();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Parcel statistics retrieved successfully',
    data: stats,
  });
});


//any user can access this
const getMyParcels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as JwtPayload).userId;
    if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED,"Unauthorized: User not found");
    }

    const result = await ParcelService.getMyParcels(userId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User parcel history fetched successfully",
      data: result,
    });
  }
);

export const ParcelController = {
  createParcel,
  getParcelById,
  trackParcel,
  getMySentParcels,
  getMyReceivedParcels,
  getAllParcels,
  updateParcelStatus,
  cancelParcel,
  confirmDelivery,
  blockParcel,
  unblockParcel,
  getParcelStatistics,
  getMyParcels
};