"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Division = void 0;
// division.model.ts
const mongoose_1 = require("mongoose");
const divisionSchema = new mongoose_1.Schema({
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
exports.Division = (0, mongoose_1.model)('Division', divisionSchema);
