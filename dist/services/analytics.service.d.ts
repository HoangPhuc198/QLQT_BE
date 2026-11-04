export declare function getDashboardStats(role: string, userId: string): Promise<{
    totalEvents: number;
    draftEvents: number;
    pendingApproval: number;
    approvedEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    needsRevision: number;
    upcomingEvents: number;
    recentActivity: ({
        event: {
            id: string;
            title: string;
            eventCode: string;
        };
    } & {
        id: string;
        createdAt: Date;
        eventId: string;
        fromStatus: string;
        toStatus: string;
        action: string;
        actorId: string | null;
        actorName: string | null;
        actorRole: string | null;
        comments: string | null;
        metadata: string | null;
    })[];
    eventsByStatus: {
        status: string;
        count: number;
    }[];
}>;
export declare function getApprovalRates(): Promise<{
    total: number;
    approved: number;
    rejected: number;
    revision: number;
    approvalRate: number;
    rejectionRate: number;
    revisionRate: number;
}>;
export declare function getProcessingTimes(): Promise<{
    averageDays: number;
    events: ({
        eventCode: string;
        title: string;
        days: number;
    } | null)[];
}>;
export declare function getBudgetAnalysis(): Promise<{
    eventCode: string;
    title: string;
    budgeted: number;
    actual: number;
    difference: number;
}[]>;
export declare function getResourceUtilization(): Promise<{
    facilityCode: string;
    facilityName: string;
    totalBookings: number;
    capacity: number | null;
}[]>;
