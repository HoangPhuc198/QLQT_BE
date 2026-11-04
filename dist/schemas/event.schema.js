"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventSchema = exports.bookingSchema = void 0;
const zod_1 = require("zod");
const optionalText = zod_1.z.string().trim().optional();
exports.bookingSchema = zod_1.z.object({
    facilityId: zod_1.z.string().trim().min(1, 'Vui lòng chọn địa điểm tổ chức'),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    equipmentItems: zod_1.z.array(zod_1.z.object({
        equipmentId: zod_1.z.string().trim().min(1, 'Vui lòng chọn thiết bị hợp lệ'),
        quantity: zod_1.z.number().int().positive('Số lượng thiết bị phải lớn hơn 0'),
    })).optional(),
});
exports.createEventSchema = zod_1.z.object({
    booking: exports.bookingSchema.nullable().optional(),
    title: zod_1.z.string({ required_error: 'Vui lòng nhập tên sự kiện' }).trim().min(1, 'Vui lòng nhập tên sự kiện'),
    description: optionalText,
    objectives: optionalText,
    targetAudience: optionalText,
    expectedAttendees: zod_1.z.number().int().positive('Số người tham dự phải lớn hơn 0').optional(),
    organizingUnit: zod_1.z.string({ required_error: 'Vui lòng nhập đơn vị tổ chức' }).trim().min(1, 'Vui lòng nhập đơn vị tổ chức'),
    contactPerson: optionalText,
    contactEmail: zod_1.z.union([
        zod_1.z.string().trim().email('Email liên hệ không hợp lệ'),
        zod_1.z.literal(''),
    ]).optional(),
    contactPhone: optionalText,
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    setupTime: zod_1.z.string().datetime().optional(),
    teardownTime: zod_1.z.string().datetime().optional(),
    preferredVenue: optionalText,
    planContent: optionalText,
    safetyPlan: optionalText,
    communicationPlan: optionalText,
    budgetItems: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.string(),
        itemName: zod_1.z.string(),
        quantity: zod_1.z.number().finite(),
        unitPrice: zod_1.z.number().finite(),
        notes: zod_1.z.string().optional(),
    })).optional(),
    scheduleItems: zod_1.z.array(zod_1.z.object({
        timeSlot: zod_1.z.string(),
        activity: zod_1.z.string(),
        responsible: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        sortOrder: zod_1.z.number().optional(),
    })).optional(),
});
//# sourceMappingURL=event.schema.js.map