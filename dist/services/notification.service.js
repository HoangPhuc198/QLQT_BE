"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.getNotifications = getNotifications;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
exports.getUnreadCount = getUnreadCount;
exports.notifyEventStatusChange = notifyEventStatusChange;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
async function createNotification(data) {
    return database_1.default.notification.create({ data });
}
async function getNotifications(userId, filters) {
    const { page = 1, limit = 20, isRead } = filters || {};
    const skip = (page - 1) * limit;
    const where = { userId };
    if (isRead !== undefined)
        where.isRead = isRead;
    const [notifications, total] = await Promise.all([
        database_1.default.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                event: { select: { id: true, eventCode: true, title: true } },
            },
        }),
        database_1.default.notification.count({ where }),
    ]);
    return {
        notifications,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
async function markAsRead(notificationId, userId) {
    return database_1.default.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true, readAt: new Date() },
    });
}
async function markAllAsRead(userId) {
    return database_1.default.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
    });
}
async function getUnreadCount(userId) {
    return database_1.default.notification.count({ where: { userId, isRead: false } });
}
const statusLabels = {
    DRAFT: 'Bản nháp',
    FACULTY_REVIEW: 'BCN Khoa đang xét duyệt',
    FACULTY_REVISION_REQUESTED: 'BCN Khoa yêu cầu chỉnh sửa',
    FACULTY_REJECTED: 'BCN Khoa từ chối',
    UNIVERSITY_REVIEW: 'Đoàn Trường đang thẩm định',
    UNIVERSITY_REVISION_REQUESTED: 'Đoàn Trường yêu cầu chỉnh sửa',
    UNIVERSITY_REJECTED: 'Đoàn Trường từ chối',
    UNIVERSITY_APPROVED: 'Đoàn Trường chấp thuận',
    PERMIT_ISSUED: 'Đã cấp phép',
    BUDGET_REVIEW: 'Đang xét duyệt ngân sách',
    BUDGET_REVISION_REQUESTED: 'Yêu cầu điều chỉnh ngân sách',
    BUDGET_REJECTED: 'Ngân sách không đạt',
    FACILITY_REVIEW: 'Đang xét CSVC',
    FACILITY_CONFLICT: 'Xung đột lịch CSVC',
    FACILITY_REVISION_REQUESTED: 'Yêu cầu đổi CSVC',
    FACILITY_RESERVED: 'CSVC đã đặt chỗ',
    READY_FOR_EVENT: 'Sẵn sàng tổ chức',
    FACILITY_HANDED_OVER: 'Đã bàn giao CSVC',
    EVENT_IN_PROGRESS: 'Đang diễn ra',
    FACILITY_RETURN_PENDING: 'Chờ hoàn trả CSVC',
    FACILITY_INSPECTION: 'Đang kiểm tra CSVC',
    FACILITY_INCIDENT: 'Có sự cố CSVC',
    FACILITY_ACCEPTED: 'Đã nghiệm thu CSVC',
    REPORT_PENDING: 'Chờ báo cáo tổng kết',
    FINANCE_DOCUMENTS_PENDING: 'Chờ chứng từ tài chính',
    FINANCE_REVIEW: 'KHTC đang kiểm tra',
    FINANCE_REVISION_REQUESTED: 'KHTC yêu cầu bổ sung',
    FINANCE_APPROVAL_PENDING: 'Chờ phê duyệt thanh toán',
    PAYMENT_REJECTED: 'Từ chối thanh toán',
    SETTLED: 'Đã quyết toán',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
};
async function notifyEventStatusChange(event, fromStatus, toStatus, actorName, comments) {
    const label = statusLabels[toStatus] || toStatus;
    const title = `Cập nhật hồ sơ: ${event.eventCode}`;
    const content = `Hồ sơ "${event.title}" đã chuyển sang trạng thái: ${label}. ${comments ? `Ghi chú: ${comments}` : ''}`;
    // Always notify the event creator
    await createNotification({
        userId: event.createdById,
        eventId: event.id,
        title,
        content,
        type: toStatus.includes('REJECTED') ? 'ERROR' : toStatus.includes('REVISION') ? 'WARNING' : 'INFO',
        category: 'APPROVAL',
        linkUrl: `/events/${event.id}`,
    });
    // Notify specific role based on new status
    let targetRole = null;
    if (toStatus === types_1.EventStatus.FACULTY_REVIEW)
        targetRole = types_1.UserRole.BCN_KHOA;
    else if (toStatus === types_1.EventStatus.UNIVERSITY_REVIEW || toStatus === types_1.EventStatus.BUDGET_REVIEW)
        targetRole = types_1.UserRole.DOAN_TRUONG;
    else if (toStatus === types_1.EventStatus.FACILITY_REVIEW)
        targetRole = types_1.UserRole.CSVC;
    else if (toStatus === types_1.EventStatus.FINANCE_REVIEW || toStatus === types_1.EventStatus.FINANCE_APPROVAL_PENDING)
        targetRole = types_1.UserRole.KHTC;
    if (targetRole) {
        const users = await database_1.default.user.findMany({
            where: { role: targetRole, isActive: true },
        });
        for (const u of users) {
            if (u.id !== event.createdById) {
                await createNotification({
                    userId: u.id,
                    eventId: event.id,
                    title: `Hồ sơ cần xử lý: ${event.eventCode}`,
                    content: `Hồ sơ "${event.title}" cần được xử lý. Trạng thái: ${label}`,
                    type: 'ACTION_REQUIRED',
                    category: 'APPROVAL',
                    linkUrl: `/events/${event.id}`,
                });
            }
        }
    }
}
//# sourceMappingURL=notification.service.js.map