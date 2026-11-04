"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const permissions_1 = require("../config/permissions");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Schema xác thực đăng nhập
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email không đúng định dạng'),
    password: zod_1.z.string().min(1, 'Vui lòng nhập mật khẩu'),
});
// Schema xác thực đăng ký tài khoản
const registerSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: zod_1.z.string().email('Email không đúng định dạng'),
    phone: zod_1.z
        .string()
        .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam 10 số)')
        .optional()
        .or(zod_1.z.literal('')),
    password: zod_1.z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: zod_1.z.string().min(6, 'Vui lòng xác nhận mật khẩu'),
    department: zod_1.z.string().optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập',
    path: ['confirmPassword'],
});
// Schema yêu cầu khôi phục mật khẩu
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Vui lòng nhập đúng định dạng email đã đăng ký'),
});
// Schema xác thực mã OTP 6 số
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email không đúng định dạng'),
    otp: zod_1.z.string().length(6, 'Mã xác minh phải bao gồm đúng 6 chữ số'),
});
// Schema đặt lại mật khẩu mới
const resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Mã xác minh không được để trống'),
    newPassword: zod_1.z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: zod_1.z.string().min(6, 'Vui lòng xác nhận mật khẩu mới'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
    path: ['confirmPassword'],
});
// 1. Đăng nhập
router.post('/login', (0, validate_1.validate)(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, auth_service_1.login)(email, password);
        res.json({ success: true, data: result });
    }
    catch (err) {
        const isPermanentLock = err.message.includes('Quản trị viên') || err.message.includes('quản trị viên');
        const isLocked = err.message.includes('khóa') || err.message.includes('khoá');
        const statusCode = isPermanentLock ? 403 : (isLocked ? 429 : 401);
        res.status(statusCode).json({ success: false, error: err.message, isLocked, isPermanentLock });
    }
});
// 2. Đăng ký tài khoản mới (Gán quyền cơ bản BTC)
router.post('/register', (0, validate_1.validate)(registerSchema), async (req, res) => {
    try {
        const { fullName, email, password, phone, department } = req.body;
        const user = await (0, auth_service_1.register)({
            fullName,
            email,
            password,
            phone: phone || undefined,
            department: department || undefined,
        });
        res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản thành công! Bạn có thể sử dụng email và mật khẩu để đăng nhập.',
            data: user,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// 3. Quên mật khẩu - Yêu cầu gửi mã khôi phục
router.post('/forgot-password', (0, validate_1.validate)(forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const result = await (0, auth_service_1.requestPasswordReset)(email);
        res.json({ success: true, message: result.message });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// 3.1. Xác thực mã OTP 6 số và nhận phiên đặt lại mật khẩu
router.post('/verify-otp', (0, validate_1.validate)(verifyOtpSchema), async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await (0, auth_service_1.verifyResetOtp)(email, otp);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// 4. Kiểm tra tính hợp lệ của token đặt lại mật khẩu
router.get('/verify-reset-token', async (req, res) => {
    try {
        const token = typeof req.query.token === 'string' ? req.query.token : '';
        if (!token) {
            res.status(400).json({ success: false, error: 'Thiếu mã khôi phục' });
            return;
        }
        const result = await (0, auth_service_1.verifyResetToken)(token);
        if (!result.valid) {
            res.status(400).json({ success: false, error: result.error });
            return;
        }
        res.json({ success: true, email: result.email });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// 5. Đặt lại mật khẩu mới
router.post('/reset-password', (0, validate_1.validate)(resetPasswordSchema), async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await (0, auth_service_1.resetPassword)(token, newPassword);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// 6. Đăng nhập / Đăng ký qua Google OAuth
router.post('/google', async (req, res) => {
    try {
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId) {
            res.status(400).json({
                success: false,
                error: 'Hệ thống chưa được cấu hình GOOGLE_CLIENT_ID phía máy chủ. Quản trị viên vui lòng tạo Google OAuth 2.0 Client ID trên Google Cloud Console và thêm vào tệp .env.',
            });
            return;
        }
        const { credential } = req.body;
        if (!credential) {
            res.status(400).json({ success: false, error: 'Thiếu thông tin chứng thực từ Google' });
            return;
        }
        // Khi Google Client ID được thiết lập, tiến hành xác thực token với Google OAuth API
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!response.ok) {
            res.status(401).json({ success: false, error: 'Token chứng thực Google không hợp lệ hoặc đã hết hạn' });
            return;
        }
        const payload = (await response.json());
        if (payload.aud !== googleClientId) {
            res.status(401).json({ success: false, error: 'Khóa Client ID Google không trùng khớp' });
            return;
        }
        // Kiểm tra trạng thái tài khoản: Chặn tài khoản bị khóa đăng nhập bằng Google
        const normalizedEmail = (payload.email || '').trim().toLowerCase();
        const existingUser = await database_1.default.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser && !existingUser.isActive) {
            res.status(403).json({
                success: false,
                error: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Đăng nhập Google bị từ chối.',
                isLocked: true,
            });
            return;
        }
        // Xử lý đăng nhập hoặc tự động tạo tài khoản với role BTC
        res.json({
            success: true,
            message: 'Xác thực Google thành công',
            data: { email: payload.email, fullName: payload.name },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Lỗi xác thực Google' });
    }
});
// 7. Yêu cầu mã OTP SMS (Đăng ký bằng SĐT)
router.post('/send-otp', async (req, res) => {
    res.status(400).json({
        success: false,
        error: 'Dịch vụ gửi SMS OTP chưa được kết nối với nhà mạng (eSMS / Twilio / VNPT SMS Gateway). Quản trị viên vui lòng cấu hình API Key SMS Gateway trong tham số hệ thống.',
    });
});
// 8. Lấy thông tin tài khoản hiện tại
router.get('/me', auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await (0, auth_service_1.getUserById)(req.user.userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
});
// 9. Lấy quyền hạn người dùng
router.get('/permissions', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            role: req.user.role,
            permissions: (0, permissions_1.getPermissionsForRole)(req.user.role),
            allRolePermissions: permissions_1.ROLE_PERMISSIONS,
        },
    });
});
// 10. Đăng xuất
router.post('/logout', (_req, res) => {
    res.json({ success: true, message: 'Đăng xuất thành công' });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map