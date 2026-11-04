"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("./index");
// A warm process reuses its pool. Never silently fall back to a local database in production.
if (process.env.NODE_ENV === 'production') {
    if (!/^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '')) {
        throw new Error('Production requires a PostgreSQL DATABASE_URL');
    }
    if (process.env.POSTGRES_CUTOVER_APPROVED !== 'true') {
        throw new Error('PostgreSQL cutover requires verified schema and data reconciliation');
    }
}
const globalDatabase = globalThis;
const PostgreSQLClient = /^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '')
    ? require('../../generated/postgresql').PrismaClient
    : client_1.PrismaClient;
const prisma = globalDatabase.myDuePrisma ?? new PostgreSQLClient();
globalDatabase.myDuePrisma = prisma;
exports.default = prisma;
//# sourceMappingURL=database.js.map