export declare function validateAttachment(name: string, mime: string, bytes: Buffer): string;
export declare function saveAttachment(eventId: string, name: string, mime: string, bytes: Buffer): Promise<{
    fileName: string;
    filePath: string;
}>;
export declare function resolveAttachment(filePath: string): Promise<{
    url: string;
} | {
    localPath: string;
}>;
