"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const database_1 = __importDefault(require("../config/database"));
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Chưa đăng nhập hoặc token không hợp lệ' });
        return;
    }
    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
        res.status(401).json({ success: false, error: 'Chưa đăng nhập hoặc token không hợp lệ' });
        return;
    }
    let decoded;
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        if (typeof payload !== 'object' ||
            payload === null ||
            typeof payload.userId !== 'string' ||
            typeof payload.email !== 'string' ||
            typeof payload.fullName !== 'string') {
            res.status(401).json({ success: false, error: 'Token hết hạn hoặc không hợp lệ' });
            return;
        }
        decoded = payload;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ success: false, error: 'Token đã hết hạn, vui lòng đăng nhập lại' });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError || error instanceof jsonwebtoken_1.default.NotBeforeError) {
            res.status(401).json({ success: false, error: 'Token hết hạn hoặc không hợp lệ' });
            return;
        }
        next(error);
        return;
    }
    try {
        // Kiểm tra trạng thái tài khoản trong cơ sở dữ liệu để ngay lập tức vô hiệu hóa các phiên/token cũ của tài khoản bị khóa
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, isActive: true, role: true },
        });
        if (!user) {
            res.status(401).json({ success: false, error: 'Tài khoản không tồn tại trên hệ thống' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                error: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Phiên làm việc đã bị chấm dứt.',
                isLocked: true,
            });
            return;
        }
        req.user = { ...decoded, role: user.role };
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.js.map