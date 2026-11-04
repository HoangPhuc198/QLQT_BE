import { Prisma } from '@prisma/client';
/** Retry only serialization conflicts; callbacks must contain database operations only. */
export declare function serializableTransaction<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
