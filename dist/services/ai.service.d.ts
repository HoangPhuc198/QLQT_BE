export interface AIReviewResult {
    isAI: boolean;
    aiProvider?: string;
    score: number;
    summary: string;
    missingFields: string[];
    inconsistencies: string[];
    risks: string[];
    suggestions: string[];
    details: {
        category: string;
        level: 'INFO' | 'WARNING' | 'ERROR';
        message: string;
    }[];
}
export declare function reviewApplication(eventId: string): Promise<AIReviewResult>;
export declare function suggestResources(data: {
    expectedAttendees: number;
    startTime: string;
    endTime: string;
    eventType?: string;
}): Promise<{
    isAI: boolean;
    requestedAttendees: number;
    options: {
        facility: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            type: string;
            description: string | null;
            location: string | null;
            capacity: number | null;
            amenities: string | null;
        };
        isAvailable: boolean;
        suitabilityScore: number;
        recommendedEquipment: {
            equipmentId: string;
            name: string;
            suggestedQuantity: number;
        }[];
    }[];
}>;
export declare function generateReportDraft(eventId: string): Promise<{
    isAI: boolean;
    actualAttendees: number;
    summary: string;
    achievements: string;
    challenges: string;
    lessonsLearned: string;
    recommendations: string;
    financialOverview: {
        totalBudget: number;
        totalActual: number;
        difference: number;
    };
}>;
