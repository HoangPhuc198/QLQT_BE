"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.CORS_ORIGIN)) {
    throw new Error('Production requires JWT_SECRET and CORS_ORIGIN');
}
if (process.env.VERCEL && process.env.STORAGE_DRIVER !== 'supabase') {
    throw new Error('Vercel requires private Supabase Storage');
}
exports.config = {
    port: parseInt(process.env.PORT || '3001', 10),
    jwtSecret: process.env.JWT_SECRET || 'eventflow-dev-secret',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: Math.min(parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), process.env.VERCEL ? 4000000 : 10485760),
    aiApiKey: process.env.AI_API_KEY || '',
    aiProvider: process.env.AI_PROVIDER || 'rule-based',
    jwtExpiresIn: '30d',
};
//# sourceMappingURL=index.js.map