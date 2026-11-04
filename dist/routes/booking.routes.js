"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const booking_service_1 = require("../services/booking.service");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// List facilities
router.get('/facilities', async (_req, res, next) => {
    try {
        const facilities = await database_1.default.facility.findMany({ where: { isActive: true } });
        res.json({ success: true, data: facilities });
    }
    catch (err) {
        next(err);
    }
});
// List equipment
router.get('/equipment', async (_req, res, next) => {
    try {
        const equipment = await database_1.default.equipment.findMany({ where: { isActive: true } });
        res.json({ success: true, data: equipment });
    }
    catch (err) {
        next(err);
    }
});
// List bookings
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { status, eventId } = req.query;
        const bookings = await (0, booking_service_1.getAllBookings)({
            status: status,
            eventId: eventId,
        });
        res.json({ success: true, data: bookings });
    }
    catch (err) {
        next(err);
    }
});
// Check availability
router.get('/availability', auth_1.authenticate, async (req, res, next) => {
    try {
        const { facilityId, startTime, endTime } = req.query;
        if (!facilityId || !startTime || !endTime) {
            res.status(400).json({ success: false, error: 'Thiếu tham số facilityId, startTime, endTime' });
            return;
        }
        const conflicts = await (0, booking_service_1.checkAvailability)(facilityId, new Date(startTime), new Date(endTime));
        res.json({ success: true, isAvailable: conflicts.length === 0, conflicts });
    }
    catch (err) {
        next(err);
    }
});
// Create booking
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const booking = await (0, booking_service_1.createBooking)(req.body);
        res.status(201).json({ success: true, data: booking });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Confirm booking (CSVC or ADMIN)
router.put('/:id/confirm', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.CSVC, types_1.UserRole.ADMIN), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const confirmed = await (0, booking_service_1.confirmBooking)(id, req.user.userId);
        res.json({ success: true, data: confirmed, message: 'Đã phê duyệt đặt chỗ CSVC' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Reject booking (CSVC or ADMIN)
router.put('/:id/reject', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.CSVC, types_1.UserRole.ADMIN), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const rejected = await (0, booking_service_1.rejectBooking)(id, req.user.userId);
        res.json({ success: true, data: rejected, message: 'Đã từ chối đặt chỗ' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Get calendar for a facility
router.get('/facilities/:id/calendar', async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
        const end = endDate ? new Date(endDate) : new Date(Date.now() + 60 * 86400000);
        const bookings = await (0, booking_service_1.getBookingsForFacility)(id, start, end);
        res.json({ success: true, data: bookings });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=booking.routes.js.map