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
exports.ParcelController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const parcel_service_1 = require("./parcel.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, weight, receiver, fromAddress, toAddress, division, deliveryDate } = req.body;
    const senderId = req.user.userId;
    const parcel = yield parcel_service_1.ParcelService.createParcel({
        type,
        weight: parseFloat(weight),
        receiver,
        fromAddress,
        toAddress,
        division,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined
    }, senderId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 201,
        message: 'Parcel created successfully',
        data: parcel,
    });
}));
const getParcelById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const parcel = yield parcel_service_1.ParcelService.getParcelById(id);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found');
    }
    // Type guard functions
    const getSenderId = (sender) => {
        if (typeof sender === 'string')
            return sender;
        if (sender && sender._id)
            return sender._id.toString();
        return sender.toString(); // fallback
    };
    const getReceiverId = (receiver) => {
        if (typeof receiver === 'string')
            return receiver;
        if (receiver && receiver._id)
            return receiver._id.toString();
        return receiver.toString(); // fallback
    };
    const senderId = getSenderId(parcel.sender);
    const receiverId = getReceiverId(parcel.receiver);
    const roles = Array.isArray(userRole) ? userRole : [userRole];
    if (!roles.includes('ADMIN') &&
        !roles.includes('SUPER_ADMIN') &&
        senderId !== userId &&
        receiverId !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, 'Unauthorized to view this parcel');
    }
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Parcel retrieved successfully',
        data: parcel,
    });
}));
const trackParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const parcel = yield parcel_service_1.ParcelService.getParcelByTrackingId(trackingId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found with this tracking ID');
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
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Tracking information retrieved successfully',
        data: trackingInfo,
    });
}));
const getMySentParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = req.user.userId;
    const status = req.query.status;
    const parcels = yield parcel_service_1.ParcelService.getSenderParcels(senderId, status);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Sent parcels retrieved successfully',
        data: parcels,
    });
}));
const getMyReceivedParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverId = req.user.userId;
    const status = req.query.status;
    const parcels = yield parcel_service_1.ParcelService.getReceiverParcels(receiverId, status);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Received parcels retrieved successfully',
        data: parcels,
    });
}));
const getAllParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const result = yield parcel_service_1.ParcelService.getAllParcels(page, limit, status);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'All parcels retrieved successfully',
        data: result,
    });
}));
const updateParcelStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, location, note } = req.body;
    const adminId = req.user.userId;
    const parcel = yield parcel_service_1.ParcelService.updateParcelStatus(id, {
        status,
        location,
        note
    }, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Parcel status updated successfully',
        data: parcel,
    });
}));
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const parcel = yield parcel_service_1.ParcelService.cancelParcel(id, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Parcel cancelled successfully',
        data: parcel,
    });
}));
const confirmDelivery = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const receiverId = req.user.userId;
    const parcel = yield parcel_service_1.ParcelService.confirmDelivery(id, receiverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Delivery confirmed successfully',
        data: parcel,
    });
}));
const blockParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const adminId = req.user.userId;
    const parcel = yield parcel_service_1.ParcelService.blockParcel(id, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Parcel blocked successfully',
        data: parcel,
    });
}));
const unblockParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const adminId = req.user.userId;
    const parcel = yield parcel_service_1.ParcelService.unblockParcel(id, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Parcel unblocked successfully',
        data: parcel,
    });
}));
const getParcelStatistics = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield parcel_service_1.ParcelService.getParcelStatistics();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Parcel statistics retrieved successfully',
        data: stats,
    });
}));
//any user can access this
const getMyParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    if (!userId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Unauthorized: User not found");
    }
    const result = yield parcel_service_1.ParcelService.getMyParcels(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "User parcel history fetched successfully",
        data: result,
    });
}));
exports.ParcelController = {
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
