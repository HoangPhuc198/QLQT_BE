"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const config_1 = require("../config");
const storage_service_1 = require("../services/storage.service");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: config_1.config.maxFileSize, files: 1 } });
const database_1 = __importDefault(require("../config/database"));
const express_1 = require("express");
const zod_1 = require("zod");
const event_schema_1 = require("../schemas/event.schema");
const eventSubmissionValidation_1 = require("../services/eventSubmissionValidation");
const event_service_1 = require("../services/event.service");
const workflow_service_1 = require("../services/workflow.service");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// List events
router.get('/', auth_1.authenticate, async (req, res, next) => {
    try {
        const { status, search, page, limit } = req.query;
        const result = await (0, event_service_1.getEvents)({
            status: status,
            search: search,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        }, req.user.userId, req.user.role);
        res.json({ success: true, ...result });
    }
    catch (err) {
        next(err);
    }
});
// Create event
router.post('/', auth_1.authenticate, (0, validate_1.validate)(event_schema_1.createEventSchema), async (req, res, next) => {
    try {
        if (!['BTC', 'ADMIN'].includes(req.user.role)) {
            res.status(403).json({ error: 'Không có quyền tạo hồ sơ' });
            return;
        }
        const requestId = req.get('Idempotency-Key');
        if (requestId && !zod_1.z.string().uuid().safeParse(requestId).success) {
            res.status(400).json({ success: false, error: 'Mã yêu cầu lưu hồ sơ không hợp lệ' });
            return;
        }
        const event = await (0, event_service_1.createEvent)(req.body, req.user.userId, undefined, requestId);
        res.status(201).json({ success: true, data: event });
    }
    catch (err) {
        if (err instanceof event_service_1.EventCreateIdempotencyConflictError) {
            res.status(409).json({ success: false, error: err.message });
            return;
        }
        res.status(400).json({ success: false, error: err.message });
    }
});
// Import is explicit, idempotent, and saves the untouched original for recovery.
router.post('/import-legacy', auth_1.authenticate, async (req, res) => {
    try {
        if (!['BTC', 'ADMIN'].includes(req.user.role) || req.body.createdById !== req.user.userId) {
            res.status(403).json({ error: 'Chỉ được nhập hồ sơ của chính tài khoản này' });
            return;
        }
        const sourceId = zod_1.z.string().min(1).max(200).parse(req.body.id);
        const data = event_schema_1.createEventSchema.parse({ ...req.body, booking: undefined });
        const event = await (0, event_service_1.createEvent)(data, req.user.userId, { key: `legacy:${req.user.userId}:${sourceId}`, snapshot: JSON.stringify(req.body) });
        res.json({ success: true, data: event });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const id = String(req.params.id);
        const event = await database_1.default.event.findUnique({ where: { id } });
        if (!event || (event.createdById !== req.user.userId && req.user.role !== 'ADMIN') || event.status !== 'DRAFT') {
            res.status(403).json({ error: 'Chỉ được xóa bản nháp thuộc quyền quản lý' });
            return;
        }
        await database_1.default.$transaction([
            database_1.default.event.update({ where: { id }, data: { deletedAt: new Date() } }),
            database_1.default.resourceBooking.updateMany({ where: { eventId: id }, data: { status: 'REJECTED' } }),
        ]);
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put('/:id/report', auth_1.authenticate, async (req, res) => {
    try {
        const id = String(req.params.id);
        const event = await database_1.default.event.findUnique({ where: { id } });
        if (!event || (!['BTC', 'ADMIN'].includes(req.user.role))) {
            res.status(403).json({ error: 'Không có quyền lưu báo cáo này' });
            return;
        }
        const data = zod_1.z.object({ actualAttendees: zod_1.z.number().int().nonnegative().optional(), summary: zod_1.z.string().optional(), achievements: zod_1.z.string().optional(), challenges: zod_1.z.string().optional(), lessonsLearned: zod_1.z.string().optional(), recommendations: zod_1.z.string().optional(), status: zod_1.z.enum(['DRAFT', 'SUBMITTED']).optional() }).parse(req.body);
        const report = await database_1.default.eventReport.upsert({ where: { eventId: id }, create: { ...data, eventId: id }, update: data });
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/:id/handover', auth_1.authenticate, async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!['CSVC', 'ADMIN'].includes(req.user.role)) {
            res.status(403).json({ error: 'Chỉ cán bộ CSVC được xác nhận bàn giao' });
            return;
        }
        const data = zod_1.z.object({ type: zod_1.z.enum(['PRE_EVENT', 'POST_EVENT']), facilityCondition: zod_1.z.string(), equipmentNotes: zod_1.z.string(), hasIncident: zod_1.z.boolean().optional(), incidentDetails: zod_1.z.string().optional() }).parse(req.body);
        const event = await database_1.default.event.findUniqueOrThrow({ where: { id } });
        const allowed = data.type === 'PRE_EVENT' ? ['READY_FOR_EVENT'] : ['FACILITY_RETURN_PENDING', 'FACILITY_INSPECTION'];
        if (!allowed.includes(event.status))
            throw new Error('Trạng thái hồ sơ chưa cho phép lập biên bản này');
        const status = data.type === 'PRE_EVENT' ? 'FACILITY_HANDED_OVER' : data.hasIncident ? 'FACILITY_INCIDENT' : 'REPORT_PENDING';
        await database_1.default.$transaction(async (tx) => {
            await tx.handoverRecord.create({ data: { eventId: id, type: data.type, handoverById: req.user.userId, receivedById: event.createdById, facilityCondition: data.facilityCondition, equipmentList: data.equipmentNotes, notes: data.incidentDetails, status: 'CONFIRMED', confirmedAt: new Date() } });
            await tx.event.update({ where: { id }, data: { status, currentVersion: { increment: 1 } } });
            await tx.workflowHistory.create({ data: { eventId: id, fromStatus: event.status, toStatus: status, action: data.type, actorId: req.user.userId, actorRole: req.user.role, actorName: req.user.fullName, comments: data.facilityCondition } });
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get event by ID
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const event = await (0, event_service_1.getEventById)(id);
        if (!event || event.deletedAt) {
            res.status(404).json({ success: false, error: 'Không tìm thấy hồ sơ' });
            return;
        }
        res.json({ success: true, data: event });
    }
    catch (err) {
        next(err);
    }
});
// Update event
router.put('/:id', auth_1.authenticate, (0, validate_1.validate)(event_schema_1.createEventSchema.partial().extend({ changeNote: zod_1.z.string().optional(), expectedVersion: zod_1.z.number().int().positive().optional() })), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await (0, event_service_1.updateEvent)(id, req.body, req.user.userId, req.user.role);
        res.json({ success: true, data: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Submit event
router.post('/:id/submit', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await (0, event_service_1.submitEvent)(id, req.user.userId);
        res.json({ success: true, data: result, message: 'Đã nộp hồ sơ thành công' });
    }
    catch (err) {
        if (err instanceof eventSubmissionValidation_1.EventSubmissionValidationError) {
            res.status(422).json({ success: false, error: err.message, data: err.issues });
            return;
        }
        res.status(400).json({ success: false, error: err.message });
    }
});
// Review / Workflow transition
router.post('/:id/review', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { action, comments, reason } = req.body;
        if (!action) {
            res.status(400).json({ success: false, error: 'Thiếu hành động phê duyệt (action)' });
            return;
        }
        const result = await (0, workflow_service_1.transitionState)(id, action, req.user.userId, req.user.role, { comments, reason });
        res.json({ success: true, data: result, message: `Thao tác "${action}" thành công` });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Get available actions for current user
router.get('/:id/available-actions', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const event = await (0, event_service_1.getEventById)(id);
        if (!event || event.deletedAt) {
            res.status(404).json({ success: false, error: 'Không tìm thấy hồ sơ' });
            return;
        }
        const actions = (0, workflow_service_1.getAvailableActions)(event.status, req.user.role);
        res.json({ success: true, data: actions });
    }
    catch (err) {
        next(err);
    }
});
// Get workflow history
router.get('/:id/history', auth_1.authenticate, async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const history = await (0, event_service_1.getEventHistory)(id);
        res.json({ success: true, data: history });
    }
    catch (err) {
        next(err);
    }
});
// Upload attachment
router.post('/:id/attachments', auth_1.authenticate, async (req, res, next) => {
    try {
        const event = await database_1.default.event.findUnique({ where: { id: String(req.params.id) } });
        if (!event || event.deletedAt || (event.createdById !== req.user.userId && req.user.role !== 'ADMIN')) {
            res.status(403).json({ error: 'Không có quyền tải tệp lên hồ sơ này' });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
}, upload.single('file'), async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!req.file) {
            res.status(400).json({ success: false, error: 'Chưa chọn tệp tải lên' });
            return;
        }
        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const stored = await (0, storage_service_1.saveAttachment)(id, originalName, req.file.mimetype, req.file.buffer);
        const attachment = await database_1.default.attachment.create({
            data: {
                eventId: id,
                fileName: stored.fileName,
                originalName: originalName,
                fileType: req.file.mimetype,
                filePath: stored.filePath,
                fileSize: req.file.size,
                uploadedById: req.user.userId,
            },
            include: {
                uploadedBy: { select: { id: true, fullName: true } },
            },
        });
        res.status(201).json({ success: true, data: attachment, message: 'Tải lên tài liệu thành công' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Download attachment
router.get('/:id/attachments/:attachmentId/download', auth_1.authenticate, async (req, res) => {
    try {
        const attachmentId = Array.isArray(req.params.attachmentId) ? req.params.attachmentId[0] : req.params.attachmentId;
        const attachment = await database_1.default.attachment.findUnique({ where: { id: attachmentId } });
        const event = attachment ? await database_1.default.event.findUnique({ where: { id: attachment.eventId } }) : null;
        // Match existing event visibility: all authenticated application roles can read non-deleted events.
        if (!attachment || attachment.eventId !== String(req.params.id) || !event || event.deletedAt) {
            res.status(404).json({ success: false, error: 'Không tìm thấy tệp đính kèm' });
            return;
        }
        res.setHeader('Cache-Control', 'private, no-store');
        const location = await (0, storage_service_1.resolveAttachment)(attachment.filePath);
        if ('url' in location) {
            res.json({ success: true, url: location.url });
            return;
        }
        res.download(location.localPath, attachment.originalName || attachment.fileName);
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=event.routes.js.map