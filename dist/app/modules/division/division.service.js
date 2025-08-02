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
exports.DivisionService = void 0;
const division_model_1 = require("./division.model");
const createDivision = (divisionData) => __awaiter(void 0, void 0, void 0, function* () {
    const division = new division_model_1.Division(divisionData);
    return yield division.save();
});
const getAllDivisions = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield division_model_1.Division.find().select('name basePrice');
});
const getDivisionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield division_model_1.Division.findById(id);
});
const updateDivision = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield division_model_1.Division.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });
});
const deleteDivision = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield division_model_1.Division.findByIdAndDelete(id);
});
const getDivisionByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield division_model_1.Division.findOne({ name: name.trim() });
});
exports.DivisionService = {
    createDivision,
    getAllDivisions,
    getDivisionById,
    updateDivision,
    deleteDivision,
    getDivisionByName
};
