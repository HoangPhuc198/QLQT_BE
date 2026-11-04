"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventCreateIdempotencyConflictError = exports.eventInclude = void 0;
exports.createEvent = createEvent;
exports.getEvents = getEvents;
exports.getEventById = getEventById;
exports.updateEvent = updateEvent;
exports.submitEvent = submitEvent;
exports.getEventHistory = getEventHistory;
const database_1 = __importDefault(require("../config/database"));
const node_crypto_1 = require("node:crypto");
const types_1 = require("../types");
const generateCode_1 = require("../utils/generateCode");
const eventSubmissionValidation_1 = require("./eventSubmissionValidation");
exports.eventInclude = {
    createdBy: {
        select: { id: true, fullName: true, email: true, role: true, department: true },
    },
    budgetItems: { orderBy: { createdAt: 'asc' } },
    scheduleItems: { orderBy: { sortOrder: 'asc' } },
    approvalDecisions: {
        include: {
            decidedBy: { select: { id: true, fullName: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
    },
    workflowHistory: { orderBy: { createdAt: 'desc' } },
    attachments: {
        include: {
            uploadedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
    },
    resourceBookings: {
        include: {
            facility: true,
            bookingItems: { include: { equipment: true } },
        },
    },
    handoverRecords: {
        include: {
            handoverBy: { select: { id: true, fullName: true } },
            receivedBy: { select: { id: true, fullName: true } },
        },
    },
    returnInspections: {
        include: {
            inspectedBy: { select: { id: true, fullName: true } },
        },
    },
    incidentReports: {
        include: {
            reportedBy: { select: { id: true, fullName: true } },
        },
    },
    settlements: {
        include: {
            items: true,
            documents: true,
            submittedBy: { select: { id: true, fullName: true } },
            reviewedBy: { select: { id: true, fullName: true } },
        },
    },
    eventReport: true,
    versions: { orderBy: { version: 'desc' } },
};
class EventCreateIdempotencyConflictError extends Error {
    constructor() {
        super('Yêu cầu này đã lưu một bản nháp khác. Không tạo hồ sơ trùng; hãy tải lại hồ sơ đã lưu trước khi tiếp tục.');
        this.name = 'EventCreateIdempotencyConflictError';
    }
}
exports.EventCreateIdempotencyConflictError = EventCreateIdempotencyConflictError;
const activeBookingStatuses = ['PENDING', 'CONFIRMED', 'TENTATIVE'];
async function validateEventBooking(tx, booking, expectedAttendees, excludeEventId) {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    if (start.getTime() === end.getTime()) {
        throw new Error('Giờ kết thúc không được trùng với giờ bắt đầu');
    }
    if (!(start < end))
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
    const facility = await tx.facility.findUnique({ where: { id: booking.facilityId } });
    if (!facility?.isActive)
        throw new Error('Địa điểm được chọn không tồn tại hoặc tạm ngưng hoạt động');
    if (facility.capacity && (expectedAttendees || 0) > facility.capacity) {
        throw new Error(`Số người tham dự (${expectedAttendees}) vượt quá sức chứa tối đa của ${facility.name} (${facility.capacity} chỗ)`);
    }
    const overlap = {
        status: { in: activeBookingStatuses },
        startTime: { lt: end },
        endTime: { gt: start },
        ...(excludeEventId ? { eventId: { not: excludeEventId } } : {}),
    };
    if (await tx.resourceBooking.count({ where: { facilityId: booking.facilityId, ...overlap } })) {
        throw new Error('Địa điểm đã có sự kiện đăng ký trong khung giờ này. Vui lòng chọn khung giờ khác.');
    }
    for (const item of booking.equipmentItems || []) {
        const equipment = await tx.equipment.findUnique({ where: { id: item.equipmentId } });
        const used = await tx.resourceBookingItem.aggregate({
            where: {
                equipmentId: item.equipmentId,
                booking: overlap,
            },
            _sum: { quantity: true },
        });
        if (!equipment?.isActive || (used._sum?.quantity || 0) + item.quantity > equipment.totalQuantity) {
            throw new Error('Thiết bị không đủ số lượng');
        }
    }
}
async function createEvent(data, userId, legacy, requestId) {
    const eventCode = await (0, generateCode_1.generateEventCode)();
    const idempotencySettingKey = requestId ? `create-event:${userId}:${requestId}` : undefined;
    const requestFingerprint = requestId
        ? (0, node_crypto_1.createHash)('sha256').update(JSON.stringify(data)).digest('hex')
        : undefined;
    let event;
    try {
        event = await database_1.default.$transaction(async (tx) => {
            if (idempotencySettingKey && requestFingerprint) {
                const previousRequest = await tx.systemSetting.findUnique({ where: { key: idempotencySettingKey } });
                if (previousRequest) {
                    const previous = JSON.parse(previousRequest.value);
                    if (previous.fingerprint !== requestFingerprint || !previous.eventId) {
                        throw new EventCreateIdempotencyConflictError();
                    }
                    return { id: previous.eventId };
                }
            }
            if (legacy) {
                const existing = await tx.systemSetting.findUnique({ where: { key: legacy.key } });
                if (existing)
                    return { id: JSON.parse(existing.value).eventId };
            }
            if (data.startDate && data.endDate) {
                const start = new Date(data.startDate);
                const end = new Date(data.endDate);
                const now = new Date(Date.now() - 5 * 60 * 1000); // 5 phút dung sai
                if (start < now) {
                    throw new Error('Thời gian bắt đầu không được ở trong quá khứ');
                }
                if (end < now) {
                    throw new Error('Thời gian kết thúc không được ở trong quá khứ');
                }
                if (start.getTime() === end.getTime()) {
                    throw new Error('Giờ kết thúc không được trùng với giờ bắt đầu');
                }
                if (start > end) {
                    throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
                }
            }
            if (data.booking) {
                await validateEventBooking(tx, data.booking, data.expectedAttendees);
            }
            const created = await tx.event.create({
                data: {
                    eventCode,
                    title: data.title,
                    description: data.description,
                    objectives: data.objectives,
                    targetAudience: data.targetAudience,
                    expectedAttendees: data.expectedAttendees,
                    organizingUnit: data.organizingUnit,
                    contactPerson: data.contactPerson,
                    contactEmail: data.contactEmail,
                    contactPhone: data.contactPhone,
                    startDate: data.startDate ? new Date(data.startDate) : undefined,
                    endDate: data.endDate ? new Date(data.endDate) : undefined,
                    setupTime: data.setupTime ? new Date(data.setupTime) : undefined,
                    teardownTime: data.teardownTime ? new Date(data.teardownTime) : undefined,
                    preferredVenue: data.preferredVenue,
                    planContent: data.planContent,
                    safetyPlan: data.safetyPlan,
                    communicationPlan: data.communicationPlan,
                    status: types_1.EventStatus.DRAFT,
                    createdById: userId,
                },
            });
            if (data.budgetItems?.length) {
                await tx.budgetItem.createMany({
                    data: data.budgetItems.map((item) => ({
                        eventId: created.id,
                        category: item.category,
                        itemName: item.itemName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice,
                        notes: item.notes,
                    })),
                });
            }
            if (data.scheduleItems?.length) {
                await tx.eventScheduleItem.createMany({
                    data: data.scheduleItems.map((item, index) => ({
                        eventId: created.id,
                        timeSlot: item.timeSlot,
                        activity: item.activity,
                        responsible: item.responsible,
                        notes: item.notes,
                        sortOrder: item.sortOrder ?? index,
                    })),
                });
            }
            if (data.booking) {
                const b = data.booking;
                await tx.resourceBooking.create({ data: {
                        eventId: created.id, facilityId: b.facilityId,
                        startTime: new Date(b.startTime), endTime: new Date(b.endTime),
                        bookingItems: { create: (b.equipmentItems || []).map(i => ({ equipmentId: i.equipmentId, quantity: i.quantity })) },
                    } });
            }
            if (idempotencySettingKey && requestFingerprint) {
                await tx.systemSetting.create({
                    data: {
                        key: idempotencySettingKey,
                        category: 'EVENT_CREATE_IDEMPOTENCY',
                        value: JSON.stringify({ eventId: created.id, fingerprint: requestFingerprint }),
                    },
                });
            }
            if (legacy)
                await tx.systemSetting.create({ data: {
                        key: legacy.key, category: 'LEGACY_BACKUP', value: JSON.stringify({ eventId: created.id, snapshot: legacy.snapshot }),
                    } });
            // Create initial version
            await tx.eventVersion.create({
                data: {
                    eventId: created.id,
                    version: 1,
                    title: created.title,
                    description: created.description,
                    objectives: created.objectives,
                    planContent: created.planContent,
                    changedBy: userId,
                    changeNote: 'Khởi tạo hồ sơ',
                },
            });
            // Create workflow history
            await tx.workflowHistory.create({
                data: {
                    eventId: created.id,
                    fromStatus: '',
                    toStatus: types_1.EventStatus.DRAFT,
                    action: 'CREATE',
                    actorId: userId,
                    actorName: (await tx.user.findUnique({ where: { id: userId } }))?.fullName,
                    actorRole: (await tx.user.findUnique({ where: { id: userId } }))?.role,
                    comments: 'Tạo hồ sơ sự kiện mới',
                },
            });
            return created;
        });
    }
    catch (error) {
        if (error instanceof EventCreateIdempotencyConflictError)
            throw error;
        const isUniqueConflict = !!error && typeof error === 'object' && 'code' in error && error.code === 'P2002';
        if (!idempotencySettingKey || !requestFingerprint || !isUniqueConflict)
            throw error;
        const committedRequest = await database_1.default.systemSetting.findUnique({ where: { key: idempotencySettingKey } });
        if (!committedRequest)
            throw error;
        const committed = JSON.parse(committedRequest.value);
        if (committed.fingerprint !== requestFingerprint || !committed.eventId) {
            throw new EventCreateIdempotencyConflictError();
        }
        event = { id: committed.eventId };
    }
    return getEventById(event.id);
}
async function getEvents(filters, userId, role) {
    const { status, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where = { deletedAt: null };
    // Synchronized view across all roles
    // All roles can see events to track workflow progress
    if (status) {
        where.status = status;
    }
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { eventCode: { contains: search } },
            { organizingUnit: { contains: search } },
        ];
    }
    const [events, total] = await Promise.all([
        database_1.default.event.findMany({
            where,
            include: exports.eventInclude,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        database_1.default.event.count({ where }),
    ]);
    return {
        events,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function getEventById(id) {
    const event = await database_1.default.event.findUnique({
        where: { id },
        include: exports.eventInclude,
    });
    return event;
}
async function updateEvent(id, data, userId, userRole) {
    const event = await database_1.default.event.findUnique({ where: { id } });
    if (!event || event.deletedAt)
        throw new Error('Không tìm thấy hồ sơ');
    const editableStatuses = [
        types_1.EventStatus.DRAFT,
        types_1.EventStatus.FACULTY_REVISION_REQUESTED,
        types_1.EventStatus.UNIVERSITY_REVISION_REQUESTED,
        types_1.EventStatus.BUDGET_REVISION_REQUESTED,
        types_1.EventStatus.FACILITY_CONFLICT,
        types_1.EventStatus.FACILITY_REVISION_REQUESTED,
    ];
    if (!editableStatuses.includes(event.status)) {
        throw new Error('Không thể chỉnh sửa hồ sơ ở trạng thái hiện tại');
    }
    if (event.createdById !== userId && userRole !== 'ADMIN') {
        throw new Error('Không có quyền chỉnh sửa hồ sơ này');
    }
    const startVal = data.startDate !== undefined ? data.startDate : event.startDate;
    const endVal = data.endDate !== undefined ? data.endDate : event.endDate;
    if (startVal && endVal) {
        const start = new Date(startVal);
        const end = new Date(endVal);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            if (start.getTime() === end.getTime()) {
                throw new Error('Giờ kết thúc không được trùng với giờ bắt đầu');
            }
            if (start > end) {
                throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
            }
        }
    }
    const fields = ['title', 'description', 'objectives', 'targetAudience', 'expectedAttendees', 'organizingUnit', 'contactPerson', 'contactEmail', 'contactPhone', 'preferredVenue', 'safetyPlan', 'planContent', 'communicationPlan'];
    const patch = {};
    for (const key of fields)
        if (data[key] !== undefined)
            patch[key] = data[key];
    for (const key of ['startDate', 'endDate', 'setupTime', 'teardownTime']) {
        if (data[key] !== undefined)
            patch[key] = data[key] ? new Date(data[key]) : null;
    }
    await database_1.default.$transaction(async (tx) => {
        const changed = await tx.event.updateMany({ where: { id, currentVersion: Number(data.expectedVersion ?? event.currentVersion), status: event.status }, data: { ...patch, currentVersion: { increment: 1 } } });
        if (!changed.count)
            throw new Error('Hồ sơ đã được máy khác cập nhật. Tải lại trang trước khi sửa tiếp.');
        if (Array.isArray(data.budgetItems)) {
            await tx.budgetItem.deleteMany({ where: { eventId: id } });
            await tx.budgetItem.createMany({ data: data.budgetItems.map((i) => ({ eventId: id, category: i.category, itemName: i.itemName, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.quantity * i.unitPrice, notes: i.notes })) });
        }
        if (Array.isArray(data.scheduleItems)) {
            await tx.eventScheduleItem.deleteMany({ where: { eventId: id } });
            await tx.eventScheduleItem.createMany({ data: data.scheduleItems.map((i, index) => ({ eventId: id, timeSlot: i.timeSlot, activity: i.activity, responsible: i.responsible, notes: i.notes, sortOrder: index })) });
        }
        if (data.booking !== undefined) {
            const currentBooking = await tx.resourceBooking.findFirst({
                where: { eventId: id, status: { in: [...activeBookingStatuses, 'CONFLICT'] } },
                orderBy: { updatedAt: 'desc' },
            });
            if (data.booking === null) {
                if (currentBooking) {
                    await tx.resourceBooking.update({ where: { id: currentBooking.id }, data: { status: 'REJECTED' } });
                }
            }
            else {
                const booking = data.booking;
                await validateEventBooking(tx, booking, Number(data.expectedAttendees ?? event.expectedAttendees) || undefined, id);
                const bookingData = {
                    facilityId: booking.facilityId,
                    startTime: new Date(booking.startTime),
                    endTime: new Date(booking.endTime),
                };
                const savedBooking = currentBooking
                    ? await tx.resourceBooking.update({ where: { id: currentBooking.id }, data: bookingData })
                    : await tx.resourceBooking.create({ data: { eventId: id, ...bookingData } });
                await tx.resourceBookingItem.deleteMany({ where: { bookingId: savedBooking.id } });
                if (booking.equipmentItems?.length) {
                    await tx.resourceBookingItem.createMany({
                        data: booking.equipmentItems.map((item) => ({
                            bookingId: savedBooking.id,
                            equipmentId: item.equipmentId,
                            quantity: item.quantity,
                        })),
                    });
                }
            }
        }
        const user = await tx.user.findUnique({ where: { id: userId } });
        await tx.workflowHistory.create({ data: { eventId: id, fromStatus: event.status, toStatus: event.status, action: 'UPDATE', actorId: userId, actorName: user?.fullName, actorRole: user?.role, comments: String(data.changeNote || 'Cập nhật hồ sơ') } });
    });
    return getEventById(id);
}
async function submitEvent(id, userId) {
    const event = await database_1.default.event.findUnique({
        where: { id },
        include: {
            budgetItems: true,
            scheduleItems: true,
            resourceBookings: { include: { facility: true } },
        },
    });
    if (!event || event.deletedAt)
        throw new Error('Không tìm thấy hồ sơ');
    if (event.status === types_1.EventStatus.FACULTY_REVIEW) {
        const previousSubmission = await database_1.default.workflowHistory.findFirst({
            where: {
                eventId: id,
                action: 'SUBMIT',
                actorId: userId,
                toStatus: types_1.EventStatus.FACULTY_REVIEW,
            },
        });
        if (previousSubmission)
            return getEventById(id);
    }
    // BTC or ADMIN can submit
    const submittableStatuses = [
        types_1.EventStatus.DRAFT,
        types_1.EventStatus.FACULTY_REVISION_REQUESTED,
        types_1.EventStatus.UNIVERSITY_REVISION_REQUESTED,
        types_1.EventStatus.BUDGET_REVISION_REQUESTED,
    ];
    if (!submittableStatuses.includes(event.status)) {
        throw new Error('Không thể nộp hồ sơ ở trạng thái hiện tại');
    }
    const issues = (0, eventSubmissionValidation_1.validateEventSubmission)(event);
    if (issues.length)
        throw new eventSubmissionValidation_1.EventSubmissionValidationError(issues);
    const user = await database_1.default.user.findUnique({ where: { id: userId } });
    const result = await database_1.default.$transaction(async (tx) => {
        const changed = await tx.event.updateMany({ where: { id, status: event.status, currentVersion: event.currentVersion }, data: { status: types_1.EventStatus.FACULTY_REVIEW, currentVersion: { increment: 1 } } });
        if (!changed.count)
            throw new Error('Hồ sơ đã thay đổi trên máy khác');
        const updated = await tx.event.findUniqueOrThrow({ where: { id } });
        await tx.workflowHistory.create({
            data: {
                eventId: id,
                fromStatus: event.status,
                toStatus: types_1.EventStatus.FACULTY_REVIEW,
                action: 'SUBMIT',
                actorId: userId,
                actorName: user?.fullName,
                actorRole: user?.role,
                comments: 'Nộp hồ sơ xét duyệt',
            },
        });
        // Notify BCN_KHOA users
        const bcnUsers = await tx.user.findMany({
            where: { role: types_1.UserRole.BCN_KHOA, isActive: true },
        });
        for (const u of bcnUsers) {
            await tx.notification.create({
                data: {
                    userId: u.id,
                    eventId: id,
                    title: 'Hồ sơ mới cần xét duyệt',
                    content: `Hồ sơ "${event.title}" (${event.eventCode}) đã được nộp và cần xét duyệt.`,
                    type: 'ACTION_REQUIRED',
                    category: 'APPROVAL',
                    linkUrl: `/events/${id}`,
                },
            });
        }
        // Notify BTC
        await tx.notification.create({
            data: {
                userId: userId,
                eventId: id,
                title: 'Hồ sơ đã được nộp',
                content: `Hồ sơ "${event.title}" (${event.eventCode}) đã được nộp thành công.`,
                type: 'SUCCESS',
                category: 'APPROVAL',
                linkUrl: `/events/${id}`,
            },
        });
        return updated;
    });
    return result;
}
async function getEventHistory(id) {
    return database_1.default.workflowHistory.findMany({
        where: { eventId: id },
        orderBy: { createdAt: 'desc' },
    });
}
//# sourceMappingURL=event.service.js.map