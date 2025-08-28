"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const parcel_model_1 = require("./parcel.model");
const division_model_1 = require("../division/division.model");
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const checkAndRemoveRole_1 = require("../../utils/checkAndRemoveRole");
const ensureActiveUser_1 = require("../../utils/ensureActiveUser");
const calculateFee = (weight, basePrice) => {
    const weightMultiplier = Math.ceil(weight);
    return basePrice * weightMultiplier;
};
const isValidStatusTransition = (currentStatus, newStatus) => {
    var _a;
    const validTransitions = {
        requested: ['approved', 'cancelled'],
        approved: ['dispatched', 'cancelled'],
        dispatched: ['in_transit', 'cancelled'],
        in_transit: ['delivered', 'cancelled'],
        delivered: [],
        cancelled: []
    };
    return ((_a = validTransitions[currentStatus]) === null || _a === void 0 ? void 0 : _a.includes(newStatus)) || false;
};
const createParcel = (parcelData, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, ensureActiveUser_1.ensureActiveUser)(senderId);
    const division = yield division_model_1.Division.findOne({ name: parcelData.division });
    if (!division) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Division not found');
    }
    const receiverUser = yield user_model_1.User.findOne({ email: parcelData.receiver });
    if (!receiverUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Receiver user not found');
    }
    const fee = calculateFee(parcelData.weight, division.basePrice);
    //   add sender role
    const user = yield user_model_1.User.findById(senderId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    if (!user.role.includes(user_interface_1.Role.SENDER)) {
        user.role.push(user_interface_1.Role.SENDER);
        yield user.save();
    }
    // add receiver role
    if (!receiverUser.role.includes(user_interface_1.Role.RECEIVER)) {
        receiverUser.role.push(user_interface_1.Role.RECEIVER);
        yield receiverUser.save();
    }
    const parcel = new parcel_model_1.Parcel(Object.assign(Object.assign({}, parcelData), { sender: senderId, receiver: receiverUser._id, fee, status: 'requested' }));
    return yield parcel.save();
});
const getParcelById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield parcel_model_1.Parcel.findById(id)
        .populate('sender', '_id name email phone')
        .populate('receiver', '_id name email phone')
        .populate('division', 'name basePrice');
});
const getParcelByTrackingId = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield parcel_model_1.Parcel.findOne({ trackingId })
        .populate('sender', 'name email phone')
        .populate('receiver', 'name email phone')
        .populate('division', 'name basePrice');
});
const getSenderParcels = (senderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, ensureActiveUser_1.ensureActiveUser)(senderId);
    const query = { sender: senderId };
    if (status)
        query.status = status;
    return yield parcel_model_1.Parcel.find(query)
        .populate('receiver', 'name email phone')
        .populate('division', 'name basePrice')
        .sort({ createdAt: -1 });
});
const getReceiverParcels = (receiverId, status) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, ensureActiveUser_1.ensureActiveUser)(receiverId);
    const query = { receiver: receiverId };
    if (status)
        query.status = status;
    return yield parcel_model_1.Parcel.find(query)
        .populate('sender', 'name email phone')
        .populate('division', 'name basePrice')
        .sort({ createdAt: -1 });
});
const getAllParcels = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, status) {
    const query = {};
    if (status)
        query.status = status;
    const skip = (page - 1) * limit;
    const parcels = yield parcel_model_1.Parcel.find(query)
        .populate('sender', 'name email phone')
        .populate('receiver', 'name email phone')
        .populate('division', 'name basePrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = yield parcel_model_1.Parcel.countDocuments(query);
    return {
        parcels,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
});
const updateParcelStatus = (id, statusData, updatedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(id);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found');
    }
    if (!isValidStatusTransition(parcel.status, statusData.status)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Invalid status transition from ${parcel.status} to ${statusData.status}`);
    }
    parcel.statusLogs.push({
        status: statusData.status,
        timestamp: new Date(),
        location: statusData.location,
        updatedBy,
        note: statusData.note
    });
    parcel.status = statusData.status;
    if (statusData.status === 'cancelled')
        parcel.isCancelled = true;
    return yield parcel.save();
});
const cancelParcel = (id, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(id);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found');
    }
    const isSender = parcel.sender.toString() === userId;
    if (userRole !== 'admin' && !isSender) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, 'Unauthorized to cancel this parcel');
    }
    if (userRole !== 'admin' && ['dispatched', 'in_transit', 'delivered'].includes(parcel.status)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Cannot cancel after dispatch');
    }
    return yield updateParcelStatus(id, {
        status: 'cancelled',
        note: 'Cancelled by user'
    }, userId);
});
const confirmDelivery = (id, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(id);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found');
    }
    if (parcel.receiver.toString() !== receiverId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, 'Unauthorized');
    }
    if (parcel.status !== 'in_transit') {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Must be in transit to confirm');
    }
    yield updateParcelStatus(id, {
        status: 'delivered',
        note: 'Confirmed by receiver'
    }, receiverId);
    yield (0, checkAndRemoveRole_1.checkAndRemoveRole)(receiverId, user_interface_1.Role.RECEIVER, 'receiver');
});
const blockParcel = (id, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(id);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found');
    }
    parcel.isBlocked = true;
    parcel.statusLogs.push({
        status: parcel.status,
        timestamp: new Date(),
        updatedBy: adminId,
        note: 'Parcel blocked by admin'
    });
    return yield parcel.save();
});
const unblockParcel = (id, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(id);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found');
    }
    parcel.isBlocked = false;
    parcel.statusLogs.push({
        status: parcel.status,
        timestamp: new Date(),
        updatedBy: adminId,
        note: 'Parcel unblocked by admin'
    });
    return yield parcel.save();
});
const getParcelStatistics = () => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield parcel_model_1.Parcel.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalFee: { $sum: '$fee' }
            }
        }
    ]);
    const total = yield parcel_model_1.Parcel.countDocuments();
    return {
        total,
        byStatus: stats,
        totalRevenue: stats.reduce((sum, s) => sum + s.totalFee, 0)
    };
});
const getMyParcels = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, ensureActiveUser_1.ensureActiveUser)(userId);
    const allParcels = yield parcel_model_1.Parcel.find({
        status: { $in: ['delivered', 'cancelled'] },
        $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });
    const delivered = [];
    const received = [];
    const cancelled = [];
    allParcels.forEach(parcel => {
        if (parcel.status === 'delivered') {
            if (parcel.sender.toString() === userId) {
                delivered.push(parcel);
            }
            else if (parcel.receiver.toString() === userId) {
                received.push(parcel);
            }
        }
        else if (parcel.status === 'cancelled') {
            cancelled.push(parcel);
        }
    });
    return { delivered, received, cancelled };
});
exports.ParcelService = {
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
