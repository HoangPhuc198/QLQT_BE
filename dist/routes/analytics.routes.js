"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_service_1 = require("../services/analytics.service");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
router.get('/dashboard', auth_1.authenticate, async (req, res, next) => {
    try {
        const stats = await (0, analytics_service_1.getDashboardStats)(req.user.role, req.user.userId);
        res.json({ success: true, data: stats });
    }
    catch (err) {
        next(err);
    }
});
router.get('/approvals', auth_1.authenticate, async (_req, res, next) => {
    try {
        const rates = await (0, analytics_service_1.getApprovalRates)();
        res.json({ success: true, data: rates });
    }
    catch (err) {
        next(err);
    }
});
router.get('/processing-times', auth_1.authenticate, async (_req, res, next) => {
    try {
        const times = await (0, analytics_service_1.getProcessingTimes)();
        res.json({ success: true, data: times });
    }
    catch (err) {
        next(err);
    }
});
router.get('/budget', auth_1.authenticate, async (_req, res, next) => {
    try {
        const budget = await (0, analytics_service_1.getBudgetAnalysis)();
        res.json({ success: true, data: budget });
    }
    catch (err) {
        next(err);
    }
});
router.get('/resources', auth_1.authenticate, async (_req, res, next) => {
    try {
        const resources = await (0, analytics_service_1.getResourceUtilization)();
        res.json({ success: true, data: resources });
    }
    catch (err) {
        next(err);
    }
});
router.get('/export', auth_1.authenticate, async (_req, res, next) => {
    try {
        const events = await database_1.default.event.findMany({
            where: { deletedAt: null },
            include: { budgetItems: true },
        });
        const headers = ['Mã sự kiện', 'Tên sự kiện', 'Đơn vị', 'Trạng thái', 'Ngày bắt đầu', 'Tổng dự toán'];
        const rows = events.map((e) => [
            e.eventCode,
            `"${e.title.replace(/"/g, '""')}"`,
            `"${e.organizingUnit.replace(/"/g, '""')}"`,
            e.status,
            e.startDate ? e.startDate.toISOString() : '',
            e.budgetItems.reduce((s, i) => s + i.totalPrice, 0),
        ]);
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=eventflow_report.csv');
        res.send(csvContent);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map