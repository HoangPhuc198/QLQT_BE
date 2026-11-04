"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEventCode = generateEventCode;
const crypto_1 = require("crypto");
// Independent machines can create at the same time without sharing a local counter.
async function generateEventCode() {
    return `EV-${new Date().getFullYear()}-${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}
//# sourceMappingURL=generateCode.js.map