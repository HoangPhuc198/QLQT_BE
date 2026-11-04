"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const types_1 = require("../types");
const router = (0, express_1.Router)();
/**
 * 1. Danh sách người dùng (ADMIN ONLY):
 * Bao gồm cả người dùng Đang hoạt động (ACTIVE) và Đã khóa (LOCKED)
 * để Admin có thể quản trị, theo dõi và mở khóa.
 */
router.get('/', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.ADMIN), async (_req, res, next) => {
    try {
        const users = await database_1.default.user.findMany({
            where: {
                role: {
                    in: Object.values(types_1.UserRole),
                },
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                department: true,
                phone: true,
                isActive: true,
                failedLoginAttempts: true,
                lockedUntil: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: users });
    }
    catch (err) {
        next(err);
    }
});
/**
 * 2. Khóa tài khoản người dùng (ADMIN ONLY):
 * - Không xóa tài khoản (KHÔNG DELETE), dữ liệu và quan hệ được bảo toàn 100%.
 * - Vô hiệu hóa quyền đăng nhập và các phiên đăng nhập cũ.
 * - Chặn tự khóa tài khoản Admin đang sử dụng.
 * - Chặn khóa tài khoản Admin cuối cùng còn hoạt động.
 * - Ghi nhận nhật ký kiểm toán (AuditLog).
 */
router.post('/:id/lock', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.ADMIN), async (req, res) => {
    try {
        const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const currentAdminId = req.user.userId;
        const { reason } = req.body;
        // Chặn tự khóa chính mình
        if (targetId === currentAdminId) {
            res.status(400).json({
                success: false,
                error: 'Bạn không thể tự khóa tài khoản Quản trị viên của chính mình.',
            });
            return;
        }
        const targetUser = await database_1.default.user.findUnique({ where: { id: targetId } });
        if (!targetUser) {
            res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản người dùng này.' });
            return;
        }
        if (!targetUser.isActive) {
            res.status(400).json({ success: false, error: 'Tài khoản này đã ở trạng thái bị khóa từ trước.' });
            return;
        }
        // Nếu khóa tài khoản có vai trò ADMIN, kiểm tra xem có còn Admin nào khác đang hoạt động không
        if (targetUser.role === types_1.UserRole.ADMIN) {
            const activeAdminCount = await database_1.default.user.count({
                where: { role: types_1.UserRole.ADMIN, isActive: true },
            });
            if (activeAdminCount <= 1) {
                res.status(400).json({
                    success: false,
                    error: 'Không thể khóa tài khoản Quản trị viên cuối cùng đang hoạt động của hệ thống.',
                });
                return;
            }
        }
        // Cập nhật trạng thái isActive = false (BẢO TOÀN MẬT KHẨU VÀ DỮ LIỆU)
        const updatedUser = await database_1.default.user.update({
            where: { id: targetId },
            data: { isActive: false },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                department: true,
                phone: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // Ghi nhật ký kiểm toán (AuditLog)
        try {
            await database_1.default.auditLog.create({
                data: {
                    userId: currentAdminId,
                    action: 'LOCK_USER',
                    entityType: 'USER',
                    entityId: targetUser.id,
                    oldValue: JSON.stringify({ isActive: true }),
                    newValue: JSON.stringify({
                        isActive: false,
                        reason: reason?.trim() || 'Khóa bởi Quản trị viên',
                        targetEmail: targetUser.email,
                    }),
                    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
        }
        catch (auditErr) {
            console.error('[AUDIT_LOG_ERROR] Lỗi ghi nhật ký khóa tài khoản:', auditErr);
        }
        console.log(`[USER_LOCKED] Admin ${currentAdminId} đã khóa tài khoản ${targetUser.email}. Lý do: ${reason || 'Không có'}`);
        res.json({
            success: true,
            message: `Đã khóa tài khoản ${targetUser.fullName} thành công. Người dùng sẽ không thể đăng nhập hoặc tiếp tục sử dụng hệ thống.`,
            data: updatedUser,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Lỗi khi khóa tài khoản.' });
    }
});
/**
 * 3. Mở khóa tài khoản người dùng (ADMIN ONLY):
 * - Khôi phục trạng thái hoạt động isActive = true.
 * - Reset các hạn chế đăng nhập tạm thời (failedLoginAttempts = 0, lockedUntil = null).
 * - Người dùng đăng nhập lại bình thường bằng thông tin xác thực cũ, không cần đổi email/mật khẩu.
 * - Ghi nhận nhật ký kiểm toán (AuditLog).
 */
router.post('/:id/unlock', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.ADMIN), async (req, res) => {
    try {
        const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const currentAdminId = req.user.userId;
        const targetUser = await database_1.default.user.findUnique({ where: { id: targetId } });
        if (!targetUser) {
            res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản người dùng này.' });
            return;
        }
        if (targetUser.isActive) {
            res.status(400).json({ success: false, error: 'Tài khoản này đang ở trạng thái hoạt động.' });
            return;
        }
        // Cập nhật trạng thái isActive = true, đồng thời giải phóng khóa tạm thời nếu có
        const updatedUser = await database_1.default.user.update({
            where: { id: targetId },
            data: {
                isActive: true,
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                department: true,
                phone: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // Ghi nhật ký kiểm toán (AuditLog)
        try {
            await database_1.default.auditLog.create({
                data: {
                    userId: currentAdminId,
                    action: 'UNLOCK_USER',
                    entityType: 'USER',
                    entityId: targetUser.id,
                    oldValue: JSON.stringify({ isActive: false }),
                    newValue: JSON.stringify({
                        isActive: true,
                        action: 'Mở khóa bởi Quản trị viên',
                        targetEmail: targetUser.email,
                    }),
                    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
                    userAgent: req.headers['user-agent'],
                },
            });
        }
        catch (auditErr) {
            console.error('[AUDIT_LOG_ERROR] Lỗi ghi nhật ký mở khóa tài khoản:', auditErr);
        }
        console.log(`[USER_UNLOCKED] Admin ${currentAdminId} đã mở khóa tài khoản ${targetUser.email}.`);
        res.json({
            success: true,
            message: `Đã mở khóa tài khoản ${targetUser.fullName} thành công. Người dùng có thể đăng nhập bình thường.`,
            data: updatedUser,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Lỗi khi mở khóa tài khoản.' });
    }
});
/**
 * 4. Tạo tài khoản mới (ADMIN ONLY)
 */
router.post('/', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.ADMIN), async (req, res, next) => {
    try {
        const { email, password, fullName, role, department, phone } = req.body;
        if (typeof password !== 'string' || password.trim().length < 6) {
            res.status(400).json({ success: false, error: 'Mật khẩu khởi tạo phải có ít nhất 6 ký tự.' });
            return;
        }
        const existing = await database_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ success: false, error: 'Email đã được sử dụng' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await database_1.default.user.create({
            data: {
                email,
                passwordHash,
                fullName,
                role,
                department,
                phone,
            },
            select: { id: true, email: true, fullName: true, role: true, department: true, isActive: true },
        });
        res.status(201).json({ success: true, data: user });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
/**
 * 5. Cập nhật thông tin tài khoản (ADMIN ONLY)
 */
router.put('/:id', auth_1.authenticate, (0, authorize_1.authorize)(types_1.UserRole.ADMIN), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const currentAdminId = req.user.userId;
        const { fullName, role, department, phone, isActive, password } = req.body;
        const targetUser = await database_1.default.user.findUnique({ where: { id } });
        if (!targetUser) {
            res.status(404).json({ success: false, error: 'Không tìm thấy người dùng này' });
            return;
        }
        // Bảo vệ an toàn: Nếu định khóa tài khoản qua PUT
        if (isActive === false && targetUser.isActive === true) {
            if (id === currentAdminId) {
                res.status(400).json({
                    success: false,
                    error: 'Bạn không thể tự khóa tài khoản Quản trị viên của chính mình.',
                });
                return;
            }
            if (targetUser.role === types_1.UserRole.ADMIN) {
                const activeAdminCount = await database_1.default.user.count({
                    where: { role: types_1.UserRole.ADMIN, isActive: true },
                });
                if (activeAdminCount <= 1) {
                    res.status(400).json({
                        success: false,
                        error: 'Không thể khóa tài khoản Quản trị viên cuối cùng đang hoạt động của hệ thống.',
                    });
                    return;
                }
            }
        }
        const data = { fullName, role, department, phone };
        if (typeof isActive === 'boolean') {
            data.isActive = isActive;
        }
        if (password && password.trim()) {
            data.passwordHash = await bcryptjs_1.default.hash(password.trim(), 10);
        }
        const updated = await database_1.default.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                department: true,
                phone: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // Ghi nhật ký kiểm toán nếu thay đổi trạng thái
        if (typeof isActive === 'boolean' && isActive !== targetUser.isActive) {
            try {
                await database_1.default.auditLog.create({
                    data: {
                        userId: currentAdminId,
                        action: isActive ? 'UNLOCK_USER' : 'LOCK_USER',
                        entityType: 'USER',
                        entityId: id,
                        oldValue: JSON.stringify({ isActive: targetUser.isActive }),
                        newValue: JSON.stringify({ isActive }),
                        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
                        userAgent: req.headers['user-agent'],
                    },
                });
            }
            catch (err) {
                console.error('[AUDIT_LOG_ERROR]', err);
            }
        }
        res.json({ success: true, data: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map