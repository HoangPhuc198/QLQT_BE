"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseJsonReplacer = databaseJsonReplacer;
/** Preserve bigint identifiers exactly; Date and Decimal use their own JSON methods. */
function databaseJsonReplacer(_key, value) {
    return typeof value === 'bigint' ? value.toString() : value;
}
//# sourceMappingURL=json.js.map