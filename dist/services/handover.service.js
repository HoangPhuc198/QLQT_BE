"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandoverRecord = createHandoverRecord;
exports.createReturnInspection = createReturnInspection;
exports.createIncidentReport = createIncidentReport;
const database_1 = __importDefault(require("../config/database"));
async function createHandoverRecord(data) {
    return database_1.default.handoverRecord.create({
        data: {
            eventId: data.eventId,
            type: data.type,
            handoverById: data.handoverById,
            receivedById: data.receivedById,
            facilityCondition: data.facilityCondition,
            equipmentList: data.equipmentList,
            notes: data.notes,
            status: 'CONFIRMED',
            confirmedAt: new Date(),
        },
        include: {
            handoverBy: { select: { id: true, fullName: true, role: true } },
            receivedBy: { select: { id: true, fullName: true, role: true } },
        },
    });
}
async function createReturnInspection(data) {
    return database_1.default.returnInspection.create({
        data: {
            eventId: data.eventId,
            inspectedById: data.inspectedById,
            facilityCondition: data.facilityCondition,
            equipmentCondition: data.equipmentCondition,
            overallResult: data.overallResult,
            notes: data.notes,
        },
        include: {
            inspectedBy: { select: { id: true, fullName: true, role: true } },
        },
    });
}
async function createIncidentReport(data) {
    return database_1.default.incidentReport.create({
        data: {
            eventId: data.eventId,
            reportedById: data.reportedById,
            type: data.type,
            description: data.description,
            severity: data.severity,
            resolution: data.resolution,
            status: 'OPEN',
        },
        include: {
            reportedBy: { select: { id: true, fullName: true, role: true } },
        },
    });
}
//# sourceMappingURL=handover.service.js.map