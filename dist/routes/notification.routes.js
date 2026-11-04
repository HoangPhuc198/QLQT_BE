"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_service_1 = require("../services/notification.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { page, limit, isRead } = req.query;
        const result = await (0, notification_service_1.getNotifications)(req.user.userId, {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            isRead: isRead !== undefined ? isRead === 'true' : undefined,
        });
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id/read', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await (0, notification_service_1.markAsRead)(id, req.user.userId);
        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    }
    catch (err) {
        next(err);
    }
});
router.put('/read-all', auth_1.authenticate, async (req, res, next) => {
    try {
        await (0, notification_service_1.markAllAsRead)(req.user.userId);
        res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
    }
    catch (err) {
        next(err);
    }
});
router.get('/unread-count', auth_1.authenticate, async (req, res, next) => {
    try {
        const count = await (0, notification_service_1.getUnreadCount)(req.user.userId);
        res.json({ success: true, data: { unreadCount: count } });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map