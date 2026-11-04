"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableActions = getAvailableActions;
exports.transitionState = transitionState;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
const notification_service_1 = require("./notification.service");
// State machine: which transitions are valid from each status
const transitions = {
    [types_1.EventStatus.DRAFT]: {
        SUBMIT: { to: types_1.EventStatus.FACULTY_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FACULTY_REVIEW]: {
        APPROVE: { to: types_1.EventStatus.UNIVERSITY_REVIEW, roles: [types_1.UserRole.BCN_KHOA, types_1.UserRole.ADMIN] },
        REQUEST_REVISION: { to: types_1.EventStatus.FACULTY_REVISION_REQUESTED, roles: [types_1.UserRole.BCN_KHOA, types_1.UserRole.ADMIN], requireComment: true },
        REJECT: { to: types_1.EventStatus.FACULTY_REJECTED, roles: [types_1.UserRole.BCN_KHOA, types_1.UserRole.ADMIN], requireComment: true },
    },
    [types_1.EventStatus.FACULTY_REVISION_REQUESTED]: {
        RESUBMIT: { to: types_1.EventStatus.FACULTY_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.UNIVERSITY_REVIEW]: {
        APPROVE: { to: types_1.EventStatus.PERMIT_ISSUED, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.ADMIN] },
        REQUEST_REVISION: { to: types_1.EventStatus.UNIVERSITY_REVISION_REQUESTED, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.ADMIN], requireComment: true },
        REJECT: { to: types_1.EventStatus.UNIVERSITY_REJECTED, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.ADMIN], requireComment: true },
    },
    [types_1.EventStatus.UNIVERSITY_REVISION_REQUESTED]: {
        RESUBMIT: { to: types_1.EventStatus.FACULTY_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.PERMIT_ISSUED]: {
        PROCEED_BUDGET: { to: types_1.EventStatus.BUDGET_REVIEW, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
        CONFIRM_FACILITY: { to: types_1.EventStatus.FACILITY_REVIEW, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.BUDGET_REVIEW]: {
        APPROVE: { to: types_1.EventStatus.FACILITY_REVIEW, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.ADMIN] },
        REQUEST_REVISION: { to: types_1.EventStatus.BUDGET_REVISION_REQUESTED, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.ADMIN], requireComment: true },
        REJECT: { to: types_1.EventStatus.BUDGET_REJECTED, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.ADMIN], requireComment: true },
    },
    [types_1.EventStatus.BUDGET_REVISION_REQUESTED]: {
        RESUBMIT: { to: types_1.EventStatus.BUDGET_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FACILITY_REVIEW]: {
        CONFIRM: { to: types_1.EventStatus.FACILITY_RESERVED, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN] },
        CONFLICT: { to: types_1.EventStatus.FACILITY_CONFLICT, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN], requireComment: true },
        REQUEST_REVISION: { to: types_1.EventStatus.FACILITY_REVISION_REQUESTED, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN], requireComment: true },
    },
    [types_1.EventStatus.FACILITY_CONFLICT]: {
        ADJUST: { to: types_1.EventStatus.FACILITY_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FACILITY_REVISION_REQUESTED]: {
        ADJUST: { to: types_1.EventStatus.FACILITY_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FACILITY_RESERVED]: {
        READY: { to: types_1.EventStatus.READY_FOR_EVENT, roles: [types_1.UserRole.CSVC, types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.READY_FOR_EVENT]: {
        HANDOVER: { to: types_1.EventStatus.FACILITY_HANDED_OVER, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN] },
        START_EVENT: { to: types_1.EventStatus.EVENT_IN_PROGRESS, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
        END_EVENT: { to: types_1.EventStatus.FACILITY_RETURN_PENDING, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FACILITY_HANDED_OVER]: {
        START_EVENT: { to: types_1.EventStatus.EVENT_IN_PROGRESS, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
        END_EVENT: { to: types_1.EventStatus.FACILITY_RETURN_PENDING, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.EVENT_IN_PROGRESS]: {
        END_EVENT: { to: types_1.EventStatus.FACILITY_RETURN_PENDING, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FACILITY_RETURN_PENDING]: {
        INSPECT: { to: types_1.EventStatus.FACILITY_INSPECTION, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN] },
        ACCEPT: { to: types_1.EventStatus.REPORT_PENDING, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FACILITY_INSPECTION]: {
        ACCEPT: { to: types_1.EventStatus.REPORT_PENDING, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN] },
        INCIDENT: { to: types_1.EventStatus.FACILITY_INCIDENT, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN], requireComment: true },
    },
    [types_1.EventStatus.FACILITY_INCIDENT]: {
        RESOLVE: { to: types_1.EventStatus.REPORT_PENDING, roles: [types_1.UserRole.CSVC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.REPORT_PENDING]: {
        SUBMIT_REPORT: { to: types_1.EventStatus.FINANCE_DOCUMENTS_PENDING, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
        COMPLETE: { to: types_1.EventStatus.COMPLETED, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FINANCE_DOCUMENTS_PENDING]: {
        SUBMIT_DOCUMENTS: { to: types_1.EventStatus.FINANCE_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
        COMPLETE: { to: types_1.EventStatus.COMPLETED, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FINANCE_REVIEW]: {
        APPROVE: { to: types_1.EventStatus.FINANCE_APPROVAL_PENDING, roles: [types_1.UserRole.KHTC, types_1.UserRole.ADMIN] },
        REQUEST_REVISION: { to: types_1.EventStatus.FINANCE_REVISION_REQUESTED, roles: [types_1.UserRole.KHTC, types_1.UserRole.ADMIN], requireComment: true },
    },
    [types_1.EventStatus.FINANCE_REVISION_REQUESTED]: {
        RESUBMIT: { to: types_1.EventStatus.FINANCE_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.FINANCE_APPROVAL_PENDING]: {
        SETTLE: { to: types_1.EventStatus.SETTLED, roles: [types_1.UserRole.KHTC, types_1.UserRole.ADMIN] },
        REJECT_PAYMENT: { to: types_1.EventStatus.PAYMENT_REJECTED, roles: [types_1.UserRole.KHTC, types_1.UserRole.ADMIN], requireComment: true },
    },
    [types_1.EventStatus.PAYMENT_REJECTED]: {
        RESUBMIT: { to: types_1.EventStatus.FINANCE_REVIEW, roles: [types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
    [types_1.EventStatus.SETTLED]: {
        COMPLETE: { to: types_1.EventStatus.COMPLETED, roles: [types_1.UserRole.DOAN_TRUONG, types_1.UserRole.BTC, types_1.UserRole.ADMIN] },
    },
};
// Cancel can happen from many statuses
const cancellableStatuses = [
    types_1.EventStatus.DRAFT, types_1.EventStatus.SUBMITTED, types_1.EventStatus.FACULTY_REVIEW,
    types_1.EventStatus.FACULTY_REVISION_REQUESTED, types_1.EventStatus.FACULTY_APPROVED,
    types_1.EventStatus.UNIVERSITY_REVIEW, types_1.EventStatus.UNIVERSITY_REVISION_REQUESTED,
    types_1.EventStatus.PERMIT_ISSUED, types_1.EventStatus.BUDGET_REVIEW,
    types_1.EventStatus.BUDGET_REVISION_REQUESTED, types_1.EventStatus.FACILITY_REVIEW,
    types_1.EventStatus.FACILITY_CONFLICT, types_1.EventStatus.FACILITY_REVISION_REQUESTED,
    types_1.EventStatus.FACILITY_RESERVED, types_1.EventStatus.READY_FOR_EVENT,
];
function getAvailableActions(currentStatus, userRole) {
    const statusTransitions = transitions[currentStatus];
    if (!statusTransitions)
        return [];
    const actions = [];
    for (const [action, def] of Object.entries(statusTransitions)) {
        if (userRole === types_1.UserRole.ADMIN || def.roles.includes(userRole)) {
            actions.push(action);
        }
    }
    // Add cancel action
    if (cancellableStatuses.includes(currentStatus) &&
        (userRole === types_1.UserRole.ADMIN || userRole === types_1.UserRole.BTC)) {
        actions.push('CANCEL');
    }
    return actions;
}
function mapActionToStage(action, currentStatus) {
    if (currentStatus.startsWith('FACULTY'))
        return types_1.ApprovalStage.FACULTY_REVIEW;
    if (currentStatus.startsWith('UNIVERSITY') || currentStatus === types_1.EventStatus.PERMIT_ISSUED)
        return types_1.ApprovalStage.UNIVERSITY_REVIEW;
    if (currentStatus.startsWith('BUDGET'))
        return types_1.ApprovalStage.BUDGET_REVIEW;
    if (currentStatus.startsWith('FACILITY'))
        return types_1.ApprovalStage.FACILITY_REVIEW;
    if (currentStatus.startsWith('FINANCE') || currentStatus === types_1.EventStatus.FINANCE_APPROVAL_PENDING)
        return types_1.ApprovalStage.FINANCE_REVIEW;
    return null;
}
function mapActionToDecision(action) {
    if (action === 'APPROVE' || action === 'CONFIRM' || action === 'ACCEPT' || action === 'SETTLE' || action === 'COMPLETE') {
        return types_1.DecisionType.APPROVED;
    }
    if (action === 'REJECT' || action === 'REJECT_PAYMENT') {
        return types_1.DecisionType.REJECTED;
    }
    if (action === 'REQUEST_REVISION' || action === 'CONFLICT') {
        return types_1.DecisionType.REVISION_REQUESTED;
    }
    return null;
}
async function transitionState(eventId, action, userId, userRole, data) {
    const event = await database_1.default.event.findUnique({ where: { id: eventId } });
    if (!event || event.deletedAt)
        throw new Error('Không tìm thấy hồ sơ');
    // BCH can operate on workflow steps assigned to BTC
    // Handle cancel specially
    if (action === 'CANCEL') {
        if (!cancellableStatuses.includes(event.status)) {
            throw new Error('Không thể hủy hồ sơ ở trạng thái hiện tại');
        }
        if (userRole !== types_1.UserRole.ADMIN && userRole !== types_1.UserRole.BTC) {
            throw new Error('Không có quyền hủy hồ sơ');
        }
        return executeTransition(event, types_1.EventStatus.CANCELLED, action, userId, userRole, data);
    }
    // Normal transition
    const statusTransitions = transitions[event.status];
    if (!statusTransitions || !statusTransitions[action]) {
        throw new Error(`Hành động "${action}" không hợp lệ cho trạng thái "${event.status}"`);
    }
    const transitionDef = statusTransitions[action];
    // Check role
    if (!transitionDef.roles.includes(userRole)) {
        throw new Error('Không có quyền thực hiện hành động này');
    }
    // Check required comment
    if (transitionDef.requireComment && !data?.comments && !data?.reason) {
        throw new Error('Vui lòng nhập lý do');
    }
    // Self-approval check: BTC cannot approve their own events
    if (['APPROVE'].includes(action) && userRole === types_1.UserRole.BTC) {
        if (event.createdById === userId) {
            throw new Error('Không thể tự phê duyệt hồ sơ của mình');
        }
    }
    return executeTransition(event, transitionDef.to, action, userId, userRole, data);
}
async function executeTransition(event, toStatus, action, userId, userRole, data) {
    const user = await database_1.default.user.findUnique({ where: { id: userId } });
    const result = await database_1.default.$transaction(async (tx) => {
        // Update event status
        const updateData = { status: toStatus, currentVersion: { increment: 1 } };
        // Update sub-statuses based on transition
        if (toStatus === types_1.EventStatus.PERMIT_ISSUED) {
            updateData.permitStatus = 'ISSUED';
        }
        if (toStatus === types_1.EventStatus.FACILITY_RESERVED) {
            updateData.facilityStatus = 'RESERVED';
        }
        if (toStatus === types_1.EventStatus.FACILITY_HANDED_OVER) {
            updateData.facilityStatus = 'HANDED_OVER';
        }
        if (toStatus === types_1.EventStatus.FACILITY_ACCEPTED || toStatus === types_1.EventStatus.REPORT_PENDING) {
            updateData.facilityStatus = 'RETURNED';
            updateData.inspectionStatus = 'PASSED';
        }
        if (toStatus === types_1.EventStatus.FACILITY_INCIDENT) {
            updateData.inspectionStatus = 'INCIDENT';
        }
        if (toStatus === types_1.EventStatus.SETTLED) {
            updateData.settlementStatus = 'SETTLED';
        }
        if (toStatus === types_1.EventStatus.COMPLETED) {
            updateData.reportStatus = 'ACCEPTED';
        }
        if (toStatus === types_1.EventStatus.CANCELLED) {
            updateData.facilityStatus = 'CANCELLED';
        }
        const changed = await tx.event.updateMany({ where: { id: event.id, status: event.status, currentVersion: event.currentVersion }, data: updateData });
        if (!changed.count)
            throw new Error('Hồ sơ đã thay đổi trên máy khác. Hãy tải lại.');
        if (toStatus === types_1.EventStatus.FACILITY_RESERVED)
            await tx.resourceBooking.updateMany({ where: { eventId: event.id }, data: { status: 'CONFIRMED' } });
        if (['CANCELLED', 'FACULTY_REJECTED', 'UNIVERSITY_REJECTED', 'BUDGET_REJECTED'].includes(toStatus))
            await tx.resourceBooking.updateMany({ where: { eventId: event.id }, data: { status: 'REJECTED' } });
        const updated = await tx.event.findUniqueOrThrow({ where: { id: event.id } });
        // Create workflow history
        await tx.workflowHistory.create({
            data: {
                eventId: event.id,
                fromStatus: event.status,
                toStatus,
                action,
                actorId: userId,
                actorName: user?.fullName,
                actorRole: userRole,
                comments: data?.comments || data?.reason,
            },
        });
        // Create approval decision if applicable
        const decision = mapActionToDecision(action);
        const stage = mapActionToStage(action, event.status);
        if (decision && stage) {
            await tx.approvalDecision.create({
                data: {
                    eventId: event.id,
                    stage,
                    decision,
                    comments: data?.comments,
                    reason: data?.reason,
                    version: event.currentVersion,
                    decidedById: userId,
                },
            });
        }
        // Release bookings if cancelled or rejected
        if (toStatus === types_1.EventStatus.CANCELLED ||
            toStatus === types_1.EventStatus.FACULTY_REJECTED ||
            toStatus === types_1.EventStatus.UNIVERSITY_REJECTED ||
            toStatus === types_1.EventStatus.BUDGET_REJECTED) {
            await tx.resourceBooking.updateMany({
                where: { eventId: event.id, status: { in: ['PENDING', 'TENTATIVE', 'CONFIRMED'] } },
                data: { status: 'RELEASED' },
            });
        }
        // Create audit log
        await tx.auditLog.create({
            data: {
                userId,
                action: `WORKFLOW_${action}`,
                entityType: 'Event',
                entityId: event.id,
                oldValue: JSON.stringify({ status: event.status }),
                newValue: JSON.stringify({ status: toStatus }),
            },
        });
        return updated;
    });
    // Send notifications (outside transaction for performance)
    await (0, notification_service_1.notifyEventStatusChange)(event, event.status, toStatus, user?.fullName || 'Hệ thống', data?.comments);
    return result;
}
//# sourceMappingURL=workflow.service.js.map