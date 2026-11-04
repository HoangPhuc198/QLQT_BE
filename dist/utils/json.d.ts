/** Preserve bigint identifiers exactly; Date and Decimal use their own JSON methods. */
export declare function databaseJsonReplacer(_key: string, value: unknown): unknown;
