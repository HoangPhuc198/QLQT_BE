import { Prisma } from '@prisma/client';
export declare function checkAvailability(facilityId: string, startTime: Date, endTime: Date, excludeBookingId?: string, db?: Prisma.TransactionClient): Promise<({
    event: {
        id: string;
        title: string;
        eventCode: string;
    };
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
})[]>;
export declare function checkEquipmentAvailability(equipmentId: string, quantity: number, startTime: Date, endTime: Date, excludeBookingId?: string, db?: Prisma.TransactionClient): Promise<{
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
    totalQuantity: number;
    booked: number;
    available: number;
    isAvailable: boolean;
}>;
export declare function createBooking(data: {
    eventId: string;
    facilityId: string;
    startTime: string;
    endTime: string;
    setupTime?: string;
    teardownTime?: string;
    expectedAttendees?: number;
    purpose?: string;
    specialRequests?: string;
    alternativeOption?: string;
    equipmentItems?: Array<{
        equipmentId: string;
        quantity: number;
    }>;
}): Promise<{
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
}>;
export declare function confirmBooking(bookingId: string, userId: string): Promise<{
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
}>;
export declare function rejectBooking(bookingId: string, userId: string): Promise<{
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
}>;
export declare function getBookingsForFacility(facilityId: string, startDate: Date, endDate: Date): Promise<({
    event: {
        id: string;
        title: string;
        organizingUnit: string;
        eventCode: string;
    };
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
})[]>;
export declare function getAllBookings(filters?: {
    status?: string;
    eventId?: string;
}): Promise<({
    event: {
        id: string;
        title: string;
        eventCode: string;
    };
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
})[]>;
