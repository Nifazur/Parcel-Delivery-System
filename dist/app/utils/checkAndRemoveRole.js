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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndRemoveRole = void 0;
const parcel_model_1 = require("../modules/parcel/parcel.model");
const user_model_1 = require("../modules/user/user.model");
const checkAndRemoveRole = (userId, roleToCheck, parcelField) => __awaiter(void 0, void 0, void 0, function* () {
    const stillHasRole = yield parcel_model_1.Parcel.findOne({
        [parcelField]: userId,
        status: { $nin: ['delivered', 'cancelled'] },
    });
    if (!stillHasRole) {
        const user = yield user_model_1.User.findById(userId);
        if (user && user.role.includes(roleToCheck)) {
            user.role = user.role.filter((r) => r !== roleToCheck);
            yield user.save();
        }
    }
});
exports.checkAndRemoveRole = checkAndRemoveRole;
