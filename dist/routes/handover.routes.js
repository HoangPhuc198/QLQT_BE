"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const handover_service_1 = require("../services/handover.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Create handover record
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const record = await (0, handover_service_1.createHandoverRecord)({
            ...req.body,
            handoverById: req.user.userId,
        });
        res.status(201).json({ success: true, data: record, message: 'Đã lưu biên bản bàn giao' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Create return inspection
router.post('/inspection', auth_1.authenticate, async (req, res, next) => {
    try {
        const inspection = await (0, handover_service_1.createReturnInspection)({
            ...req.body,
            inspectedById: req.user.userId,
        });
        res.status(201).json({ success: true, data: inspection, message: 'Đã lưu kết quả kiểm tra hoàn trả' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Create incident report
router.post('/incident', auth_1.authenticate, async (req, res, next) => {
    try {
        const incident = await (0, handover_service_1.createIncidentReport)({
            ...req.body,
            reportedById: req.user.userId,
        });
        res.status(201).json({ success: true, data: incident, message: 'Đã lập biên bản sự cố' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Get records by eventId
router.get('/:eventId', auth_1.authenticate, async (req, res, next) => {
    try {
        const eventId = Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId;
        const [handovers, inspections, incidents] = await Promise.all([
            database_1.default.handoverRecord.findMany({
                where: { eventId },
                include: {
                    handoverBy: { select: { id: true, fullName: true, role: true } },
                    receivedBy: { select: { id: true, fullName: true, role: true } },
                },
            }),
            database_1.default.returnInspection.findMany({
                where: { eventId },
                include: { inspectedBy: { select: { id: true, fullName: true, role: true } } },
            }),
            database_1.default.incidentReport.findMany({
                where: { eventId },
                include: { reportedBy: { select: { id: true, fullName: true, role: true } } },
            }),
        ]);
        res.json({ success: true, data: { handovers, inspections, incidents } });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=handover.routes.js.map