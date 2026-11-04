export declare function createHandoverRecord(data: {
    eventId: string;
    type: 'PRE_EVENT' | 'POST_EVENT';
    handoverById: string;
    receivedById?: string;
    facilityCondition?: string;
    equipmentList?: string;
    notes?: string;
}): Promise<{
    handoverBy: {
        id: string;
        fullName: string;
        role: string;
    };
    receivedBy: {
        id: string;
        fullName: string;
        role: string;
    } | null;
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    status: string;
    notes: string | null;
    eventId: string;
    confirmedAt: Date | null;
    facilityCondition: string | null;
    handoverById: string;
    receivedById: string | null;
    equipmentList: string | null;
    handoverDate: Date;
}>;
export declare function createReturnInspection(data: {
    eventId: string;
    inspectedById: string;
    facilityCondition?: string;
    equipmentCondition?: string;
    overallResult: 'PASSED' | 'FAILED' | 'INCIDENT';
    notes?: string;
}): Promise<{
    inspectedBy: {
        id: string;
        fullName: string;
        role: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    notes: string | null;
    eventId: string;
    inspectedById: string;
    facilityCondition: string | null;
    equipmentCondition: string | null;
    overallResult: string;
    inspectedAt: Date;
}>;
export declare function createIncidentReport(data: {
    eventId: string;
    reportedById: string;
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    resolution?: string;
}): Promise<{
    reportedBy: {
        id: string;
        fullName: string;
        role: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    status: string;
    description: string;
    eventId: string;
    reportedById: string;
    severity: string;
    resolution: string | null;
}>;
