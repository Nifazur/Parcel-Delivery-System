/* eslint-disable @typescript-eslint/no-explicit-any */
import { Parcel } from './parcel.model';
import { Division } from '../division/division.model';
import { ICreateParcelRequest, IUpdateParcelStatusRequest, ParcelStatus } from './parcel.interface';
import { User } from '../user/user.model';
import { Role } from '../user/user.interface';
import AppError from '../../errorHelpers/AppError';
import httpStatus from 'http-status-codes'
import { checkAndRemoveRole } from '../../utils/checkAndRemoveRole';
import { ensureActiveUser } from '../../utils/ensureActiveUser';

const calculateFee = (weight: number, basePrice: number): number => {
    const weightMultiplier = Math.ceil(weight);
    return basePrice * weightMultiplier;
};

const isValidStatusTransition = (currentStatus: ParcelStatus, newStatus: ParcelStatus): boolean => {
    const validTransitions: Record<ParcelStatus, ParcelStatus[]> = {
        requested: ['approved', 'cancelled'],
        approved: ['dispatched', 'cancelled'],
        dispatched: ['in_transit', 'cancelled'],
        in_transit: ['delivered', 'cancelled'],
        delivered: [],
        cancelled: []
    };
    return validTransitions[currentStatus]?.includes(newStatus) || false;
};

const createParcel = async (parcelData: ICreateParcelRequest, senderId: string) => {
    await ensureActiveUser(senderId);

    const division = await Division.findOne({ name: parcelData.division });
    if (!division) {
        throw new AppError(httpStatus.NOT_FOUND, 'Division not found');
    }
    const receiverUser = await User.findOne({ email: parcelData.receiver });
    if (!receiverUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'Receiver user not found');
    }
    const fee = calculateFee(parcelData.weight, division.basePrice);

    //   add sender role
    const user = await User.findById(senderId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    if (!user.role.includes(Role.SENDER)) {
        user.role.push(Role.SENDER)
        await user.save();
    }

    // add receiver role
    if (!receiverUser.role.includes(Role.RECEIVER)) {
        receiverUser.role.push(Role.RECEIVER)
        await receiverUser.save()
    }

    const parcel = new Parcel({
        ...parcelData,
        sender: senderId,
        receiver: receiverUser._id,
        fee,
        status: 'requested'
    });

    return await parcel.save();
};

const getParcelById = async (id: string) => {
  return await Parcel.findById(id)
    .populate('sender', '_id name email phone')
    .populate('receiver', '_id name email phone')
    .populate('division', 'name basePrice');
};

const getParcelByTrackingId = async (trackingId: string) => {
    return await Parcel.findOne({ trackingId })
        .populate('sender', 'name email phone')
        .populate('receiver', 'name email phone')
        .populate('division', 'name basePrice');
};

const getSenderParcels = async (senderId: string, status?: ParcelStatus) => {
    await ensureActiveUser(senderId)

    const query: any = { sender: senderId };
    if (status) query.status = status;

    return await Parcel.find(query)
        .populate('receiver', 'name email phone')
        .populate('division', 'name basePrice')
        .sort({ createdAt: -1 });
};

const getReceiverParcels = async (receiverId: string, status?: ParcelStatus) => {
    await ensureActiveUser(receiverId)

    const query: any = { receiver: receiverId };
    if (status) query.status = status;

    return await Parcel.find(query)
        .populate('sender', 'name email phone')
        .populate('division', 'name basePrice')
        .sort({ createdAt: -1 });
};

const getAllParcels = async (page = 1, limit = 10, status?: ParcelStatus) => {
    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const parcels = await Parcel.find(query)
        .populate('sender', 'name email phone')
        .populate('receiver', 'name email phone')
        .populate('division', 'name basePrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Parcel.countDocuments(query);

    return {
        parcels,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

const updateParcelStatus = async (id: string, statusData: IUpdateParcelStatusRequest, updatedBy: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    if (!isValidStatusTransition(parcel.status, statusData.status)) {
        throw new AppError(httpStatus.BAD_REQUEST, `Invalid status transition from ${parcel.status} to ${statusData.status}`);
    }

    parcel.statusLogs.push({
        status: statusData.status,
        timestamp: new Date(),
        location: statusData.location,
        updatedBy,
        note: statusData.note
    });

    parcel.status = statusData.status;

    if (statusData.status === 'cancelled') parcel.isCancelled = true;

    return await parcel.save();
};

const cancelParcel = async (id: string, userId: string, userRole: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    const isSender = parcel.sender.toString() === userId;

    if (userRole !== 'admin' && !isSender) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized to cancel this parcel');
    }

    if (userRole !== 'admin' && ['dispatched', 'in_transit', 'delivered'].includes(parcel.status)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Cannot cancel after dispatch');
    }

    return await updateParcelStatus(id, {
        status: 'cancelled',
        note: 'Cancelled by user'
    }, userId);
};

const confirmDelivery = async (id: string, receiverId: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    if (parcel.receiver.toString() !== receiverId) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    if (parcel.status !== 'in_transit') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Must be in transit to confirm');
    }

    await updateParcelStatus(id, {
        status: 'delivered',
        note: 'Confirmed by receiver'
    }, receiverId);

    await checkAndRemoveRole(receiverId, Role.RECEIVER, 'receiver')
};

const blockParcel = async (id: string, adminId: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    parcel.isBlocked = true;
    parcel.statusLogs.push({
        status: parcel.status,
        timestamp: new Date(),
        updatedBy: adminId,
        note: 'Parcel blocked by admin'
    });

    return await parcel.save();
};

const unblockParcel = async (id: string, adminId: string) => {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
    }

    parcel.isBlocked = false;
    parcel.statusLogs.push({
        status: parcel.status,
        timestamp: new Date(),
        updatedBy: adminId,
        note: 'Parcel unblocked by admin'
    });

    return await parcel.save();
};

const getParcelStatistics = async () => {
    const stats = await Parcel.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalFee: { $sum: '$fee' }
            }
        }
    ]);

    const total = await Parcel.countDocuments();

    return {
        total,
        byStatus: stats,
        totalRevenue: stats.reduce((sum, s) => sum + s.totalFee, 0)
    };
};

const getMyParcels = async (userId: string) => {
    await ensureActiveUser(userId)

    const allParcels = await Parcel.find({
        status: { $in: ['delivered', 'cancelled'] },
        $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    const delivered: any[] = [];
    const received: any[] = [];
    const cancelled: any[] = [];

    allParcels.forEach(parcel => {
        if (parcel.status === 'delivered') {
            if (parcel.sender.toString() === userId) {
                delivered.push(parcel);
            } else if (parcel.receiver.toString() === userId) {
                received.push(parcel);
            }
        } else if (parcel.status === 'cancelled') {
            cancelled.push(parcel);
        }
    });

    return { delivered, received, cancelled };
};

export const ParcelService = {
    createParcel,
    getParcelById,
    getParcelByTrackingId,
    getSenderParcels,
    getReceiverParcels,
    getAllParcels,
    updateParcelStatus,
    cancelParcel,
    confirmDelivery,
    blockParcel,
    unblockParcel,
    getParcelStatistics,
    getMyParcels
};