"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const json_1 = require("./utils/json");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const settlement_routes_1 = __importDefault(require("./routes/settlement.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const handover_routes_1 = __importDefault(require("./routes/handover.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
app.set('json replacer', json_1.databaseJsonReplacer);
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({ origin: config_1.config.corsOrigin.split(',').map(origin => origin.trim()), credentials: true }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static uploads directory
// Attachments are served exclusively through authenticated event routes.
// Healthcheck
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        name: 'EventFlow API Server - ĐH Kinh tế ĐHĐN',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/bookings', booking_routes_1.default);
app.use('/api/facilities', booking_routes_1.default);
app.use('/api/equipment', booking_routes_1.default);
app.use('/api/settlements', settlement_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/handover', handover_routes_1.default);
app.use('/api/users', user_routes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map