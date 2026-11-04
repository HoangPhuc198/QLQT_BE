"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubmissionValidationError = void 0;
exports.validateEventSubmission = validateEventSubmission;
function validateEventSubmission(event, now = new Date()) {
    const issues = [];
    const addIssue = (field, message) => {
        if (!issues.some((issue) => issue.field === field))
            issues.push({ field, message });
    };
    if (!event.title?.trim()) {
        addIssue('title', 'Vui lòng nhập tên sự kiện');
    }
    else if (event.title.trim().length < 5) {
        addIssue('title', 'Tên sự kiện cần có ít nhất 5 ký tự');
    }
    if (!event.organizingUnit?.trim()) {
        addIssue('organizingUnit', 'Vui lòng nhập đơn vị tổ chức');
    }
    if (!event.objectives?.trim()) {
        addIssue('objectives', 'Vui lòng nhập mục tiêu sự kiện');
    }
    else if (event.objectives.trim().length < 10) {
        addIssue('objectives', 'Mục tiêu cần có ít nhất 10 ký tự');
    }
    if (!event.expectedAttendees || event.expectedAttendees <= 0) {
        addIssue('expectedAttendees', 'Vui lòng nhập số người tham dự lớn hơn 0');
    }
    if (!event.startDate || event.startDate < now) {
        addIssue('startDate', 'Vui lòng chọn thời gian bắt đầu trong tương lai');
    }
    if (!event.endDate || event.endDate < now) {
        addIssue('endDate', 'Vui lòng chọn thời gian kết thúc trong tương lai');
    }
    else if (event.startDate && event.endDate <= event.startDate) {
        addIssue('endDate', 'Thời gian kết thúc phải sau thời gian bắt đầu');
    }
    if (event.scheduleItems.length === 0) {
        addIssue('scheduleItems', 'Vui lòng thêm ít nhất một nội dung kịch bản');
    }
    else if (event.scheduleItems.some((item) => !item.timeSlot.trim() || !item.activity.trim())) {
        addIssue('scheduleItems', 'Vui lòng điền khung giờ và nội dung cho từng tiết mục');
    }
    if (event.budgetItems.some((item) => !item.itemName.trim() || !Number.isFinite(item.quantity) || item.quantity <= 0 ||
        !Number.isFinite(item.unitPrice) || item.unitPrice < 0)) {
        addIssue('budgetItems', 'Vui lòng kiểm tra tên, số lượng và đơn giá của các khoản chi');
    }
    if (!event.resourceBookings.some((booking) => booking.facilityId.trim() && booking.facility?.isActive)) {
        addIssue('booking.facilityId', 'Vui lòng chọn địa điểm tổ chức');
    }
    return issues;
}
class EventSubmissionValidationError extends Error {
    issues;
    constructor(issues) {
        super('Thông tin hồ sơ chưa hợp lệ');
        this.issues = issues;
        this.name = 'EventSubmissionValidationError';
    }
}
exports.EventSubmissionValidationError = EventSubmissionValidationError;
//# sourceMappingURL=eventSubmissionValidation.js.map