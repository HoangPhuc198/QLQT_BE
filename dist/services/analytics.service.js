"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getApprovalRates = getApprovalRates;
exports.getProcessingTimes = getProcessingTimes;
exports.getBudgetAnalysis = getBudgetAnalysis;
exports.getResourceUtilization = getResourceUtilization;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
async function getDashboardStats(role, userId) {
    const baseWhere = { deletedAt: null };
    if (role === types_1.UserRole.BTC)
        baseWhere.createdById = userId;
    const [totalEvents, draftEvents, pendingApproval, approvedEvents, completedEvents, cancelledEvents, recentHistory, eventsByStatus,] = await Promise.all([
        database_1.default.event.count({ where: baseWhere }),
        database_1.default.event.count({ where: { ...baseWhere, status: 'DRAFT' } }),
        database_1.default.event.count({
            where: {
                ...baseWhere,
                status: {
                    in: role === types_1.UserRole.BCN_KHOA ? ['FACULTY_REVIEW'] :
                        role === types_1.UserRole.DOAN_TRUONG ? ['UNIVERSITY_REVIEW', 'BUDGET_REVIEW', 'PERMIT_ISSUED'] :
                            role === types_1.UserRole.CSVC ? ['FACILITY_REVIEW', 'FACILITY_RETURN_PENDING'] :
                                role === types_1.UserRole.KHTC ? ['FINANCE_REVIEW', 'FINANCE_APPROVAL_PENDING'] :
                                    ['FACULTY_REVIEW', 'UNIVERSITY_REVIEW', 'BUDGET_REVIEW', 'FACILITY_REVIEW', 'FINANCE_REVIEW'],
                },
            },
        }),
        database_1.default.event.count({ where: { ...baseWhere, status: { in: ['UNIVERSITY_APPROVED', 'PERMIT_ISSUED', 'FACILITY_RESERVED', 'READY_FOR_EVENT'] } } }),
        database_1.default.event.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
        database_1.default.event.count({ where: { ...baseWhere, status: 'CANCELLED' } }),
        database_1.default.workflowHistory.findMany({
            where: role === types_1.UserRole.BTC ? { event: { createdById: userId } } : {},
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                event: { select: { id: true, eventCode: true, title: true } },
            },
        }),
        database_1.default.event.groupBy({
            by: ['status'],
            where: baseWhere,
            _count: { status: true },
        }),
    ]);
    const needsRevision = await database_1.default.event.count({
        where: {
            ...baseWhere,
            status: { in: ['FACULTY_REVISION_REQUESTED', 'UNIVERSITY_REVISION_REQUESTED', 'BUDGET_REVISION_REQUESTED', 'FACILITY_REVISION_REQUESTED', 'FINANCE_REVISION_REQUESTED'] },
        },
    });
    const upcomingEvents = await database_1.default.event.count({
        where: {
            ...baseWhere,
            startDate: { gte: new Date() },
            status: { in: ['READY_FOR_EVENT', 'FACILITY_HANDED_OVER', 'FACILITY_RESERVED'] },
        },
    });
    return {
        totalEvents,
        draftEvents,
        pendingApproval,
        approvedEvents,
        completedEvents,
        cancelledEvents,
        needsRevision,
        upcomingEvents,
        recentActivity: recentHistory,
        eventsByStatus: eventsByStatus.map((e) => ({ status: e.status, count: e._count.status })),
    };
}
async function getApprovalRates() {
    const totalDecisions = await database_1.default.approvalDecision.count();
    const approved = await database_1.default.approvalDecision.count({ where: { decision: 'APPROVED' } });
    const rejected = await database_1.default.approvalDecision.count({ where: { decision: 'REJECTED' } });
    const revision = await database_1.default.approvalDecision.count({ where: { decision: 'REVISION_REQUESTED' } });
    return {
        total: totalDecisions,
        approved,
        rejected,
        revision,
        approvalRate: totalDecisions > 0 ? Math.round((approved / totalDecisions) * 100) : 0,
        rejectionRate: totalDecisions > 0 ? Math.round((rejected / totalDecisions) * 100) : 0,
        revisionRate: totalDecisions > 0 ? Math.round((revision / totalDecisions) * 100) : 0,
    };
}
async function getProcessingTimes() {
    const events = await database_1.default.event.findMany({
        where: { status: 'COMPLETED', deletedAt: null },
        include: { workflowHistory: { orderBy: { createdAt: 'asc' } } },
    });
    if (events.length === 0) {
        return { averageDays: 0, events: [] };
    }
    const times = events.map((e) => {
        const firstSubmit = e.workflowHistory.find((h) => h.action === 'SUBMIT');
        const completion = e.workflowHistory.find((h) => h.toStatus === 'COMPLETED');
        if (firstSubmit && completion) {
            const days = (completion.createdAt.getTime() - firstSubmit.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return { eventCode: e.eventCode, title: e.title, days: Math.round(days * 10) / 10 };
        }
        return null;
    }).filter(Boolean);
    const avgDays = times.length > 0
        ? Math.round((times.reduce((sum, t) => sum + (t?.days || 0), 0) / times.length) * 10) / 10
        : 0;
    return { averageDays: avgDays, events: times };
}
async function getBudgetAnalysis() {
    const settlements = await database_1.default.settlement.findMany({
        where: { status: 'SETTLED' },
        include: { event: { select: { eventCode: true, title: true } } },
    });
    return settlements.map((s) => ({
        eventCode: s.event.eventCode,
        title: s.event.title,
        budgeted: s.totalBudgeted,
        actual: s.totalActual,
        difference: s.difference,
    }));
}
async function getResourceUtilization() {
    const facilities = await database_1.default.facility.findMany({ where: { isActive: true } });
    const bookings = await database_1.default.resourceBooking.findMany({
        where: { status: 'CONFIRMED' },
        include: { facility: true },
    });
    const utilization = facilities.map((f) => {
        const facilityBookings = bookings.filter((b) => b.facilityId === f.id);
        return {
            facilityCode: f.code,
            facilityName: f.name,
            totalBookings: facilityBookings.length,
            capacity: f.capacity,
        };
    });
    return utilization;
}
//# sourceMappingURL=analytics.service.js.map