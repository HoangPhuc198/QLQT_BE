export declare function createSettlement(data: {
    eventId: string;
    items: Array<{
        itemName: string;
        category?: string;
        budgetedAmount: number;
        actualAmount: number;
        notes?: string;
    }>;
}, userId: string): Promise<{
    items: {
        id: string;
        createdAt: Date;
        category: string | null;
        itemName: string;
        notes: string | null;
        difference: number;
        budgetedAmount: number;
        actualAmount: number;
        settlementId: string;
    }[];
    documents: {
        id: string;
        createdAt: Date;
        verifiedAt: Date | null;
        description: string | null;
        fileName: string | null;
        filePath: string | null;
        settlementId: string;
        documentType: string;
        documentNumber: string | null;
        amount: number | null;
        isVerified: boolean;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    eventId: string;
    submittedAt: Date | null;
    totalBudgeted: number;
    totalActual: number;
    difference: number;
    submittedById: string | null;
    reviewedById: string | null;
    reviewedAt: Date | null;
    reviewNotes: string | null;
    rejectionReason: string | null;
}>;
export declare function updateSettlement(id: string, data: {
    items?: Array<{
        itemName: string;
        category?: string;
        budgetedAmount: number;
        actualAmount: number;
        notes?: string;
    }>;
}): Promise<({
    items: {
        id: string;
        createdAt: Date;
        category: string | null;
        itemName: string;
        notes: string | null;
        difference: number;
        budgetedAmount: number;
        actualAmount: number;
        settlementId: string;
    }[];
    documents: {
        id: string;
        createdAt: Date;
        verifiedAt: Date | null;
        description: string | null;
        fileName: string | null;
        filePath: string | null;
        settlementId: string;
        documentType: string;
        documentNumber: string | null;
        amount: number | null;
        isVerified: boolean;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    eventId: string;
    submittedAt: Date | null;
    totalBudgeted: number;
    totalActual: number;
    difference: number;
    submittedById: string | null;
    reviewedById: string | null;
    reviewedAt: Date | null;
    reviewNotes: string | null;
    rejectionReason: string | null;
}) | null>;
export declare function submitSettlement(id: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    eventId: string;
    submittedAt: Date | null;
    totalBudgeted: number;
    totalActual: number;
    difference: number;
    submittedById: string | null;
    reviewedById: string | null;
    reviewedAt: Date | null;
    reviewNotes: string | null;
    rejectionReason: string | null;
}>;
export declare function reviewSettlement(id: string, decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED', notes: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    eventId: string;
    submittedAt: Date | null;
    totalBudgeted: number;
    totalActual: number;
    difference: number;
    submittedById: string | null;
    reviewedById: string | null;
    reviewedAt: Date | null;
    reviewNotes: string | null;
    rejectionReason: string | null;
}>;
export declare function addFinancialDocument(settlementId: string, data: {
    documentType: string;
    documentNumber?: string;
    amount?: number;
    description?: string;
    fileName?: string;
    filePath?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    verifiedAt: Date | null;
    description: string | null;
    fileName: string | null;
    filePath: string | null;
    settlementId: string;
    documentType: string;
    documentNumber: string | null;
    amount: number | null;
    isVerified: boolean;
}>;
export declare function verifyFinancialDocument(documentId: string, isVerified: boolean): Promise<{
    id: string;
    createdAt: Date;
    verifiedAt: Date | null;
    description: string | null;
    fileName: string | null;
    filePath: string | null;
    settlementId: string;
    documentType: string;
    documentNumber: string | null;
    amount: number | null;
    isVerified: boolean;
}>;
