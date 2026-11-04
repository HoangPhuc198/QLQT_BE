"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const settlement_service_1 = require("../services/settlement.service");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Get settlement by eventId
router.get('/:eventId', auth_1.authenticate, async (req, res, next) => {
    try {
        const eventId = Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId;
        const settlement = await database_1.default.settlement.findFirst({
            where: { eventId },
            include: {
                items: true,
                documents: true,
                submittedBy: { select: { id: true, fullName: true } },
                reviewedBy: { select: { id: true, fullName: true } },
            },
        });
        res.json({ success: true, data: settlement });
    }
    catch (err) {
        next(err);
    }
});
// Create settlement
router.post('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const settlement = await (0, settlement_service_1.createSettlement)(req.body, req.user.userId);
        res.status(201).json({ success: true, data: settlement });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Update settlement
router.put('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await (0, settlement_service_1.updateSettlement)(id, req.body);
        res.json({ success: true, data: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Submit settlement
router.post('/:id/submit', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const submitted = await (0, settlement_service_1.submitSettlement)(id, req.user.userId);
        res.json({ success: true, data: submitted, message: 'Đã nộp hồ sơ quyết toán cho Phòng KHTC' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Review settlement (KHTC)
router.post('/:id/review', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.KHTC, types_1.UserRole.ADMIN), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { decision, notes } = req.body;
        const reviewed = await (0, settlement_service_1.reviewSettlement)(id, decision, notes, req.user.userId);
        res.json({ success: true, data: reviewed, message: 'Đã xử lý quyết toán' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Add document to settlement
router.post('/:id/documents', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const doc = await (0, settlement_service_1.addFinancialDocument)(id, req.body);
        res.status(201).json({ success: true, data: doc });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Verify document (KHTC)
router.put('/documents/:docId/verify', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.KHTC, types_1.UserRole.ADMIN), async (req, res, next) => {
    try {
        const docId = Array.isArray(req.params.docId) ? req.params.docId[0] : req.params.docId;
        const { isVerified } = req.body;
        const verified = await (0, settlement_service_1.verifyFinancialDocument)(docId, isVerified);
        res.json({ success: true, data: verified });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=settlement.routes.js.map