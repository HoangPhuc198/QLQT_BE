"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_service_1 = require("../services/ai.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Review application
router.post('/review', auth_1.authenticate, async (req, res, next) => {
    try {
        const { eventId } = req.body;
        if (!eventId) {
            res.status(400).json({ success: false, error: 'Thiếu eventId' });
            return;
        }
        const result = await (0, ai_service_1.reviewApplication)(eventId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Suggest resources
router.post('/resource-suggestions', auth_1.authenticate, async (req, res, next) => {
    try {
        const { expectedAttendees, startTime, endTime } = req.body;
        if (!expectedAttendees || !startTime || !endTime) {
            res.status(400).json({ success: false, error: 'Thiếu thông tin người tham dự hoặc thời gian' });
            return;
        }
        const suggestions = await (0, ai_service_1.suggestResources)(req.body);
        res.json({ success: true, data: suggestions });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Generate report draft
router.post('/generate-report', auth_1.authenticate, async (req, res, next) => {
    try {
        const { eventId } = req.body;
        if (!eventId) {
            res.status(400).json({ success: false, error: 'Thiếu eventId' });
            return;
        }
        const draft = await (0, ai_service_1.generateReportDraft)(eventId);
        res.json({ success: true, data: draft });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=ai.routes.js.map