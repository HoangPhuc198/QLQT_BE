"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializableTransaction = serializableTransaction;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
/** Retry only serialization conflicts; callbacks must contain database operations only. */
async function serializableTransaction(operation) {
    for (let attempt = 0;; attempt++) {
        try {
            return await database_1.default.$transaction(operation, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        }
        catch (error) {
            if (error.code !== 'P2034' || attempt >= 2)
                throw error;
        }
    }
}
//# sourceMappingURL=transaction.js.map