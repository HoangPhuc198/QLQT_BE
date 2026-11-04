import { z } from 'zod';
export declare const bookingSchema: z.ZodObject<{
    facilityId: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    equipmentItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        equipmentId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        equipmentId: string;
        quantity: number;
    }, {
        equipmentId: string;
        quantity: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    facilityId: string;
    startTime: string;
    endTime: string;
    equipmentItems?: {
        equipmentId: string;
        quantity: number;
    }[] | undefined;
}, {
    facilityId: string;
    startTime: string;
    endTime: string;
    equipmentItems?: {
        equipmentId: string;
        quantity: number;
    }[] | undefined;
}>;
export declare const createEventSchema: z.ZodObject<{
    booking: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        facilityId: z.ZodString;
        startTime: z.ZodString;
        endTime: z.ZodString;
        equipmentItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
            equipmentId: z.ZodString;
            quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            equipmentId: string;
            quantity: number;
        }, {
            equipmentId: string;
            quantity: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        facilityId: string;
        startTime: string;
        endTime: string;
        equipmentItems?: {
            equipmentId: string;
            quantity: number;
        }[] | undefined;
    }, {
        facilityId: string;
        startTime: string;
        endTime: string;
        equipmentItems?: {
            equipmentId: string;
            quantity: number;
        }[] | undefined;
    }>>>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    objectives: z.ZodOptional<z.ZodString>;
    targetAudience: z.ZodOptional<z.ZodString>;
    expectedAttendees: z.ZodOptional<z.ZodNumber>;
    organizingUnit: z.ZodString;
    contactPerson: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
    contactPhone: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    setupTime: z.ZodOptional<z.ZodString>;
    teardownTime: z.ZodOptional<z.ZodString>;
    preferredVenue: z.ZodOptional<z.ZodString>;
    planContent: z.ZodOptional<z.ZodString>;
    safetyPlan: z.ZodOptional<z.ZodString>;
    communicationPlan: z.ZodOptional<z.ZodString>;
    budgetItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        category: z.ZodString;
        itemName: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        category: string;
        itemName: string;
        unitPrice: number;
        notes?: string | undefined;
    }, {
        quantity: number;
        category: string;
        itemName: string;
        unitPrice: number;
        notes?: string | undefined;
    }>, "many">>;
    scheduleItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        timeSlot: z.ZodString;
        activity: z.ZodString;
        responsible: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeSlot: string;
        activity: string;
        notes?: string | undefined;
        responsible?: string | undefined;
        sortOrder?: number | undefined;
    }, {
        timeSlot: string;
        activity: string;
        notes?: string | undefined;
        responsible?: string | undefined;
        sortOrder?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    organizingUnit: string;
    booking?: {
        facilityId: string;
        startTime: string;
        endTime: string;
        equipmentItems?: {
            equipmentId: string;
            quantity: number;
        }[] | undefined;
    } | null | undefined;
    description?: string | undefined;
    objectives?: string | undefined;
    targetAudience?: string | undefined;
    expectedAttendees?: number | undefined;
    contactPerson?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    setupTime?: string | undefined;
    teardownTime?: string | undefined;
    preferredVenue?: string | undefined;
    planContent?: string | undefined;
    safetyPlan?: string | undefined;
    communicationPlan?: string | undefined;
    budgetItems?: {
        quantity: number;
        category: string;
        itemName: string;
        unitPrice: number;
        notes?: string | undefined;
    }[] | undefined;
    scheduleItems?: {
        timeSlot: string;
        activity: string;
        notes?: string | undefined;
        responsible?: string | undefined;
        sortOrder?: number | undefined;
    }[] | undefined;
}, {
    title: string;
    organizingUnit: string;
    booking?: {
        facilityId: string;
        startTime: string;
        endTime: string;
        equipmentItems?: {
            equipmentId: string;
            quantity: number;
        }[] | undefined;
    } | null | undefined;
    description?: string | undefined;
    objectives?: string | undefined;
    targetAudience?: string | undefined;
    expectedAttendees?: number | undefined;
    contactPerson?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    setupTime?: string | undefined;
    teardownTime?: string | undefined;
    preferredVenue?: string | undefined;
    planContent?: string | undefined;
    safetyPlan?: string | undefined;
    communicationPlan?: string | undefined;
    budgetItems?: {
        quantity: number;
        category: string;
        itemName: string;
        unitPrice: number;
        notes?: string | undefined;
    }[] | undefined;
    scheduleItems?: {
        timeSlot: string;
        activity: string;
        notes?: string | undefined;
        responsible?: string | undefined;
        sortOrder?: number | undefined;
    }[] | undefined;
}>;
