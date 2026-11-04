export declare const eventInclude: {
    createdBy: {
        select: {
            id: true;
            fullName: true;
            email: true;
            role: true;
            department: true;
        };
    };
    budgetItems: {
        orderBy: {
            createdAt: "asc";
        };
    };
    scheduleItems: {
        orderBy: {
            sortOrder: "asc";
        };
    };
    approvalDecisions: {
        include: {
            decidedBy: {
                select: {
                    id: true;
                    fullName: true;
                    role: true;
                };
            };
        };
        orderBy: {
            createdAt: "desc";
        };
    };
    workflowHistory: {
        orderBy: {
            createdAt: "desc";
        };
    };
    attachments: {
        include: {
            uploadedBy: {
                select: {
                    id: true;
                    fullName: true;
                };
            };
        };
        orderBy: {
            createdAt: "desc";
        };
    };
    resourceBookings: {
        include: {
            facility: true;
            bookingItems: {
                include: {
                    equipment: true;
                };
            };
        };
    };
    handoverRecords: {
        include: {
            handoverBy: {
                select: {
                    id: true;
                    fullName: true;
                };
            };
            receivedBy: {
                select: {
                    id: true;
                    fullName: true;
                };
            };
        };
    };
    returnInspections: {
        include: {
            inspectedBy: {
                select: {
                    id: true;
                    fullName: true;
                };
            };
        };
    };
    incidentReports: {
        include: {
            reportedBy: {
                select: {
                    id: true;
                    fullName: true;
                };
            };
        };
    };
    settlements: {
        include: {
            items: true;
            documents: true;
            submittedBy: {
                select: {
                    id: true;
                    fullName: true;
                };
            };
            reviewedBy: {
                select: {
                    id: true;
                    fullName: true;
                };
            };
        };
    };
    eventReport: true;
    versions: {
        orderBy: {
            version: "desc";
        };
    };
};
export declare class EventCreateIdempotencyConflictError extends Error {
    constructor();
}
type EventBookingInput = {
    facilityId: string;
    startTime: string;
    endTime: string;
    equipmentItems?: Array<{
        equipmentId: string;
        quantity: number;
    }>;
};
export declare function createEvent(data: {
    title: string;
    description?: string;
    objectives?: string;
    targetAudience?: string;
    expectedAttendees?: number;
    organizingUnit: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    startDate?: string;
    endDate?: string;
    setupTime?: string;
    teardownTime?: string;
    preferredVenue?: string;
    planContent?: string;
    safetyPlan?: string;
    communicationPlan?: string;
    budgetItems?: Array<{
        category: string;
        itemName: string;
        quantity: number;
        unitPrice: number;
        notes?: string;
    }>;
    scheduleItems?: Array<{
        timeSlot: string;
        activity: string;
        responsible?: string;
        notes?: string;
        sortOrder?: number;
    }>;
    booking?: EventBookingInput | null;
}, userId: string, legacy?: {
    key: string;
    snapshot: string;
}, requestId?: string): Promise<({
    workflowHistory: {
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
    }[];
    eventReport: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        actualAttendees: number | null;
        summary: string | null;
        achievements: string | null;
        challenges: string | null;
        lessonsLearned: string | null;
        recommendations: string | null;
        submittedAt: Date | null;
        acceptedAt: Date | null;
        acceptedBy: string | null;
    } | null;
    approvalDecisions: ({
        decidedBy: {
            id: string;
            fullName: string;
            role: string;
        };
    } & {
        version: number;
        reason: string | null;
        id: string;
        createdAt: Date;
        eventId: string;
        comments: string | null;
        stage: string;
        decision: string;
        decidedById: string;
    })[];
    attachments: ({
        uploadedBy: {
            id: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        category: string | null;
        eventId: string;
        fileName: string;
        originalName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        uploadedById: string;
    })[];
    returnInspections: ({
        inspectedBy: {
            id: string;
            fullName: string;
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
    })[];
    incidentReports: ({
        reportedBy: {
            id: string;
            fullName: string;
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
    })[];
    budgetItems: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        category: string;
        itemName: string;
        unitPrice: number;
        notes: string | null;
        eventId: string;
        totalPrice: number;
        actualQuantity: number | null;
        actualPrice: number | null;
        actualTotal: number | null;
    }[];
    scheduleItems: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        timeSlot: string;
        activity: string;
        responsible: string | null;
        sortOrder: number;
        eventId: string;
    }[];
    createdBy: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        department: string | null;
    };
    versions: {
        version: number;
        id: string;
        isActive: boolean;
        createdAt: Date;
        title: string;
        description: string | null;
        objectives: string | null;
        planContent: string | null;
        eventId: string;
        budgetData: string | null;
        changeNote: string | null;
        changedBy: string | null;
    }[];
    resourceBookings: ({
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
        bookingItems: ({
            equipment: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                type: string;
                description: string | null;
                totalQuantity: number;
                condition: string;
            };
        } & {
            id: string;
            createdAt: Date;
            equipmentId: string;
            quantity: number;
            bookingId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        facilityId: string;
        startTime: Date;
        endTime: Date;
        expectedAttendees: number | null;
        setupTime: Date | null;
        teardownTime: Date | null;
        eventId: string;
        purpose: string | null;
        specialRequests: string | null;
        alternativeOption: string | null;
        confirmedById: string | null;
        confirmedAt: Date | null;
    })[];
    handoverRecords: ({
        handoverBy: {
            id: string;
            fullName: string;
        };
        receivedBy: {
            id: string;
            fullName: string;
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
    })[];
    settlements: ({
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
        submittedBy: {
            id: string;
            fullName: string;
        } | null;
        reviewedBy: {
            id: string;
            fullName: string;
        } | null;
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
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    title: string;
    description: string | null;
    objectives: string | null;
    targetAudience: string | null;
    expectedAttendees: number | null;
    organizingUnit: string;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    startDate: Date | null;
    endDate: Date | null;
    setupTime: Date | null;
    teardownTime: Date | null;
    preferredVenue: string | null;
    planContent: string | null;
    safetyPlan: string | null;
    communicationPlan: string | null;
    eventCode: string;
    permitStatus: string;
    facilityStatus: string;
    inspectionStatus: string;
    settlementStatus: string;
    reportStatus: string;
    currentVersion: number;
    createdById: string;
    deletedAt: Date | null;
}) | null>;
export declare function getEvents(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}, userId: string, role: string): Promise<{
    events: ({
        workflowHistory: {
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
        }[];
        eventReport: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            eventId: string;
            actualAttendees: number | null;
            summary: string | null;
            achievements: string | null;
            challenges: string | null;
            lessonsLearned: string | null;
            recommendations: string | null;
            submittedAt: Date | null;
            acceptedAt: Date | null;
            acceptedBy: string | null;
        } | null;
        approvalDecisions: ({
            decidedBy: {
                id: string;
                fullName: string;
                role: string;
            };
        } & {
            version: number;
            reason: string | null;
            id: string;
            createdAt: Date;
            eventId: string;
            comments: string | null;
            stage: string;
            decision: string;
            decidedById: string;
        })[];
        attachments: ({
            uploadedBy: {
                id: string;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            category: string | null;
            eventId: string;
            fileName: string;
            originalName: string;
            fileType: string;
            fileSize: number;
            filePath: string;
            uploadedById: string;
        })[];
        returnInspections: ({
            inspectedBy: {
                id: string;
                fullName: string;
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
        })[];
        incidentReports: ({
            reportedBy: {
                id: string;
                fullName: string;
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
        })[];
        budgetItems: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            category: string;
            itemName: string;
            unitPrice: number;
            notes: string | null;
            eventId: string;
            totalPrice: number;
            actualQuantity: number | null;
            actualPrice: number | null;
            actualTotal: number | null;
        }[];
        scheduleItems: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            timeSlot: string;
            activity: string;
            responsible: string | null;
            sortOrder: number;
            eventId: string;
        }[];
        createdBy: {
            id: string;
            email: string;
            fullName: string;
            role: string;
            department: string | null;
        };
        versions: {
            version: number;
            id: string;
            isActive: boolean;
            createdAt: Date;
            title: string;
            description: string | null;
            objectives: string | null;
            planContent: string | null;
            eventId: string;
            budgetData: string | null;
            changeNote: string | null;
            changedBy: string | null;
        }[];
        resourceBookings: ({
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
            bookingItems: ({
                equipment: {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string;
                    type: string;
                    description: string | null;
                    totalQuantity: number;
                    condition: string;
                };
            } & {
                id: string;
                createdAt: Date;
                equipmentId: string;
                quantity: number;
                bookingId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            facilityId: string;
            startTime: Date;
            endTime: Date;
            expectedAttendees: number | null;
            setupTime: Date | null;
            teardownTime: Date | null;
            eventId: string;
            purpose: string | null;
            specialRequests: string | null;
            alternativeOption: string | null;
            confirmedById: string | null;
            confirmedAt: Date | null;
        })[];
        handoverRecords: ({
            handoverBy: {
                id: string;
                fullName: string;
            };
            receivedBy: {
                id: string;
                fullName: string;
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
        })[];
        settlements: ({
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
            submittedBy: {
                id: string;
                fullName: string;
            } | null;
            reviewedBy: {
                id: string;
                fullName: string;
            } | null;
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
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        objectives: string | null;
        targetAudience: string | null;
        expectedAttendees: number | null;
        organizingUnit: string;
        contactPerson: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        startDate: Date | null;
        endDate: Date | null;
        setupTime: Date | null;
        teardownTime: Date | null;
        preferredVenue: string | null;
        planContent: string | null;
        safetyPlan: string | null;
        communicationPlan: string | null;
        eventCode: string;
        permitStatus: string;
        facilityStatus: string;
        inspectionStatus: string;
        settlementStatus: string;
        reportStatus: string;
        currentVersion: number;
        createdById: string;
        deletedAt: Date | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getEventById(id: string): Promise<({
    workflowHistory: {
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
    }[];
    eventReport: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        actualAttendees: number | null;
        summary: string | null;
        achievements: string | null;
        challenges: string | null;
        lessonsLearned: string | null;
        recommendations: string | null;
        submittedAt: Date | null;
        acceptedAt: Date | null;
        acceptedBy: string | null;
    } | null;
    approvalDecisions: ({
        decidedBy: {
            id: string;
            fullName: string;
            role: string;
        };
    } & {
        version: number;
        reason: string | null;
        id: string;
        createdAt: Date;
        eventId: string;
        comments: string | null;
        stage: string;
        decision: string;
        decidedById: string;
    })[];
    attachments: ({
        uploadedBy: {
            id: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        category: string | null;
        eventId: string;
        fileName: string;
        originalName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        uploadedById: string;
    })[];
    returnInspections: ({
        inspectedBy: {
            id: string;
            fullName: string;
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
    })[];
    incidentReports: ({
        reportedBy: {
            id: string;
            fullName: string;
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
    })[];
    budgetItems: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        category: string;
        itemName: string;
        unitPrice: number;
        notes: string | null;
        eventId: string;
        totalPrice: number;
        actualQuantity: number | null;
        actualPrice: number | null;
        actualTotal: number | null;
    }[];
    scheduleItems: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        timeSlot: string;
        activity: string;
        responsible: string | null;
        sortOrder: number;
        eventId: string;
    }[];
    createdBy: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        department: string | null;
    };
    versions: {
        version: number;
        id: string;
        isActive: boolean;
        createdAt: Date;
        title: string;
        description: string | null;
        objectives: string | null;
        planContent: string | null;
        eventId: string;
        budgetData: string | null;
        changeNote: string | null;
        changedBy: string | null;
    }[];
    resourceBookings: ({
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
        bookingItems: ({
            equipment: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                type: string;
                description: string | null;
                totalQuantity: number;
                condition: string;
            };
        } & {
            id: string;
            createdAt: Date;
            equipmentId: string;
            quantity: number;
            bookingId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        facilityId: string;
        startTime: Date;
        endTime: Date;
        expectedAttendees: number | null;
        setupTime: Date | null;
        teardownTime: Date | null;
        eventId: string;
        purpose: string | null;
        specialRequests: string | null;
        alternativeOption: string | null;
        confirmedById: string | null;
        confirmedAt: Date | null;
    })[];
    handoverRecords: ({
        handoverBy: {
            id: string;
            fullName: string;
        };
        receivedBy: {
            id: string;
            fullName: string;
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
    })[];
    settlements: ({
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
        submittedBy: {
            id: string;
            fullName: string;
        } | null;
        reviewedBy: {
            id: string;
            fullName: string;
        } | null;
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
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    title: string;
    description: string | null;
    objectives: string | null;
    targetAudience: string | null;
    expectedAttendees: number | null;
    organizingUnit: string;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    startDate: Date | null;
    endDate: Date | null;
    setupTime: Date | null;
    teardownTime: Date | null;
    preferredVenue: string | null;
    planContent: string | null;
    safetyPlan: string | null;
    communicationPlan: string | null;
    eventCode: string;
    permitStatus: string;
    facilityStatus: string;
    inspectionStatus: string;
    settlementStatus: string;
    reportStatus: string;
    currentVersion: number;
    createdById: string;
    deletedAt: Date | null;
}) | null>;
export declare function updateEvent(id: string, data: Record<string, unknown>, userId: string, userRole?: string): Promise<({
    workflowHistory: {
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
    }[];
    eventReport: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        actualAttendees: number | null;
        summary: string | null;
        achievements: string | null;
        challenges: string | null;
        lessonsLearned: string | null;
        recommendations: string | null;
        submittedAt: Date | null;
        acceptedAt: Date | null;
        acceptedBy: string | null;
    } | null;
    approvalDecisions: ({
        decidedBy: {
            id: string;
            fullName: string;
            role: string;
        };
    } & {
        version: number;
        reason: string | null;
        id: string;
        createdAt: Date;
        eventId: string;
        comments: string | null;
        stage: string;
        decision: string;
        decidedById: string;
    })[];
    attachments: ({
        uploadedBy: {
            id: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        category: string | null;
        eventId: string;
        fileName: string;
        originalName: string;
        fileType: string;
        fileSize: number;
        filePath: string;
        uploadedById: string;
    })[];
    returnInspections: ({
        inspectedBy: {
            id: string;
            fullName: string;
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
    })[];
    incidentReports: ({
        reportedBy: {
            id: string;
            fullName: string;
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
    })[];
    budgetItems: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        category: string;
        itemName: string;
        unitPrice: number;
        notes: string | null;
        eventId: string;
        totalPrice: number;
        actualQuantity: number | null;
        actualPrice: number | null;
        actualTotal: number | null;
    }[];
    scheduleItems: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        timeSlot: string;
        activity: string;
        responsible: string | null;
        sortOrder: number;
        eventId: string;
    }[];
    createdBy: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        department: string | null;
    };
    versions: {
        version: number;
        id: string;
        isActive: boolean;
        createdAt: Date;
        title: string;
        description: string | null;
        objectives: string | null;
        planContent: string | null;
        eventId: string;
        budgetData: string | null;
        changeNote: string | null;
        changedBy: string | null;
    }[];
    resourceBookings: ({
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
        bookingItems: ({
            equipment: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                type: string;
                description: string | null;
                totalQuantity: number;
                condition: string;
            };
        } & {
            id: string;
            createdAt: Date;
            equipmentId: string;
            quantity: number;
            bookingId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        facilityId: string;
        startTime: Date;
        endTime: Date;
        expectedAttendees: number | null;
        setupTime: Date | null;
        teardownTime: Date | null;
        eventId: string;
        purpose: string | null;
        specialRequests: string | null;
        alternativeOption: string | null;
        confirmedById: string | null;
        confirmedAt: Date | null;
    })[];
    handoverRecords: ({
        handoverBy: {
            id: string;
            fullName: string;
        };
        receivedBy: {
            id: string;
            fullName: string;
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
    })[];
    settlements: ({
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
        submittedBy: {
            id: string;
            fullName: string;
        } | null;
        reviewedBy: {
            id: string;
            fullName: string;
        } | null;
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
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    title: string;
    description: string | null;
    objectives: string | null;
    targetAudience: string | null;
    expectedAttendees: number | null;
    organizingUnit: string;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    startDate: Date | null;
    endDate: Date | null;
    setupTime: Date | null;
    teardownTime: Date | null;
    preferredVenue: string | null;
    planContent: string | null;
    safetyPlan: string | null;
    communicationPlan: string | null;
    eventCode: string;
    permitStatus: string;
    facilityStatus: string;
    inspectionStatus: string;
    settlementStatus: string;
    reportStatus: string;
    currentVersion: number;
    createdById: string;
    deletedAt: Date | null;
}) | null>;
export declare function submitEvent(id: string, userId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    title: string;
    description: string | null;
    objectives: string | null;
    targetAudience: string | null;
    expectedAttendees: number | null;
    organizingUnit: string;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    startDate: Date | null;
    endDate: Date | null;
    setupTime: Date | null;
    teardownTime: Date | null;
    preferredVenue: string | null;
    planContent: string | null;
    safetyPlan: string | null;
    communicationPlan: string | null;
    eventCode: string;
    permitStatus: string;
    facilityStatus: string;
    inspectionStatus: string;
    settlementStatus: string;
    reportStatus: string;
    currentVersion: number;
    createdById: string;
    deletedAt: Date | null;
} | null>;
export declare function getEventHistory(id: string): Promise<{
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
}[]>;
export {};
