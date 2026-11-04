export declare function createNotification(data: {
    userId: string;
    eventId?: string;
    title: string;
    content: string;
    type: string;
    category?: string;
    linkUrl?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    type: string;
    title: string;
    category: string | null;
    content: string;
    isRead: boolean;
    readAt: Date | null;
    linkUrl: string | null;
    eventId: string | null;
}>;
export declare function getNotifications(userId: string, filters?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
}): Promise<{
    notifications: ({
        event: {
            id: string;
            title: string;
            eventCode: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        title: string;
        category: string | null;
        content: string;
        isRead: boolean;
        readAt: Date | null;
        linkUrl: string | null;
        eventId: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function markAsRead(notificationId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
export declare function markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
export declare function getUnreadCount(userId: string): Promise<number>;
export declare function notifyEventStatusChange(event: {
    id: string;
    title: string;
    eventCode: string;
    createdById: string;
}, fromStatus: string, toStatus: string, actorName: string, comments?: string): Promise<void>;
