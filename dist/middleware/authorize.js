"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.requirePermission = requirePermission;
const types_1 = require("../types");
const permissions_1 = require("../config/permissions");
/**
 * Authorize access based on Allowed User Roles
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' });
            return;
        }
        // Người không có vai trò hoặc vai trò không hợp lệ sẽ bị từ chối ngay lập tức
        if (!req.user.role || !Object.values(types_1.UserRole).includes(req.user.role)) {
            res.status(403).json({ success: false, error: 'Tài khoản chưa được phân quyền vai trò để truy cập hệ thống' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: `Tài khoản vai trò [${req.user.role}] không có quyền truy cập chức năng này`
            });
            return;
        }
        next();
    };
}
/**
 * Authorize access based on Specific Fine-Grained Permissions
 */
function requirePermission(...permissions) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' });
            return;
        }
        const hasAccess = (0, permissions_1.hasAnyPermission)(req.user.role, permissions);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                error: `Tài khoản không đủ quyền hạn thực hiện thao tác này. Cần quyền: [${permissions.join(', ')}]`,
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=authorize.js.map