"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const PORT = config_1.config.port || 3001;
app_1.default.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  EventFlow Backend API Server is running!`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
});
//# sourceMappingURL=server.js.map