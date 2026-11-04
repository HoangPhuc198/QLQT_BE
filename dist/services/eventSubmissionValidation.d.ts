export interface EventSubmissionIssue {
    field: string;
    message: string;
}
interface EventSubmissionData {
    title: string | null;
    organizingUnit: string | null;
    objectives: string | null;
    expectedAttendees: number | null;
    startDate: Date | null;
    endDate: Date | null;
    scheduleItems: Array<{
        timeSlot: string;
        activity: string;
    }>;
    budgetItems: Array<{
        itemName: string;
        quantity: number;
        unitPrice: number;
    }>;
    resourceBookings: Array<{
        facilityId: string;
        facility: {
            isActive: boolean;
        } | null;
    }>;
}
export declare function validateEventSubmission(event: EventSubmissionData, now?: Date): EventSubmissionIssue[];
export declare class EventSubmissionValidationError extends Error {
    readonly issues: EventSubmissionIssue[];
    constructor(issues: EventSubmissionIssue[]);
}
export {};
