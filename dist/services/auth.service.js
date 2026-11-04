"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.requestPasswordReset = requestPasswordReset;
exports.verifyResetOtp = verifyResetOtp;
exports.verifyResetToken = verifyResetToken;
exports.resetPassword = resetPassword;
exports.hashPassword = hashPassword;
exports.getUserById = getUserById;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const config_1 = require("../config");
const types_1 = require("../types");
const permissions_1 = require("../config/permissions");
const mail_service_1 = require("./mail.service");
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 phút
// This marker is created only for active legacy accounts eligible for email-verified activation.
const LEGACY_ACTIVATION_ENTITY = 'UserActivation';
/**
 * Đăng nhập với cơ chế bảo mật khóa tài khoản sau 5 lần nhập sai mật khẩu
 */
async function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await database_1.default.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
    }
    if (!user.isActive) {
        throw new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ Admin để được hỗ trợ.');
    }
    // 1. Kiểm tra tài khoản có đang trong thời gian bị hạn chế đăng nhập hay không
    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
        const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / (60 * 1000));
        throw new Error(`Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${remainingMinutes} phút hoặc sử dụng chức năng Quên mật khẩu để khôi phục.`);
    }
    // 2. Chặn người dùng không có vai trò hoặc vai trò không hợp lệ
    if (!user.role || !Object.values(types_1.UserRole).includes(user.role)) {
        throw new Error('Tài khoản chưa được phân quyền vai trò để truy cập hệ thống');
    }
    // 3. Xác thực mật khẩu
    const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValid) {
        const currentAttempts = (user.failedLoginAttempts || 0) + 1;
        const shouldLock = currentAttempts >= MAX_FAILED_ATTEMPTS;
        const lockedUntil = shouldLock ? new Date(now.getTime() + LOCKOUT_DURATION_MS) : null;
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: shouldLock ? 0 : currentAttempts,
                lockedUntil: lockedUntil,
            },
        });
        console.warn(`[SECURITY AUDIT] Đăng nhập thất bại đối với email ${normalizedEmail}. Số lần sai: ${currentAttempts}/${MAX_FAILED_ATTEMPTS}. Khóa tạm thời: ${shouldLock}`);
        if (shouldLock) {
            throw new Error('Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 15 phút hoặc sử dụng chức năng Quên mật khẩu để khôi phục ngay.');
        }
        else {
            const remaining = MAX_FAILED_ATTEMPTS - currentAttempts;
            throw new Error(`Email hoặc mật khẩu không đúng. Bạn còn ${remaining} lần thử trước khi tài khoản bị khóa tạm thời 15 phút.`);
        }
    }
    // 4. Đăng nhập thành công: Reset biến đếm và thời gian khóa về 0
    if ((user.failedLoginAttempts || 0) > 0 || user.lockedUntil) {
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        });
    }
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
    };
    const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            department: user.department,
            phone: user.phone,
            permissions: (0, permissions_1.getPermissionsForRole)(user.role),
        },
    };
}
/**
 * Đăng ký tài khoản mới:
 * - Chuẩn hóa định dạng email và số điện thoại
 * - Kiểm tra trùng lặp
 * - BẮT BUỘC gán vai trò cơ bản BTC (không cho phép người dùng tự cấp quyền phê duyệt/admin)
 */
async function register(data) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const trimmedName = data.fullName.trim();
    const trimmedPhone = data.phone ? data.phone.trim().replace(/\s+/g, '') : null;
    const trimmedDepartment = data.department ? data.department.trim() : 'CLB / Sinh viên DUE';
    // 1. Kiểm tra email đã tồn tại
    const existingEmail = await database_1.default.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) {
        throw new Error('Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc dùng chức năng Quên mật khẩu.');
    }
    // 2. Kiểm tra số điện thoại nếu có
    if (trimmedPhone) {
        const existingPhone = await database_1.default.user.findFirst({ where: { phone: trimmedPhone } });
        if (existingPhone) {
            throw new Error('Số điện thoại này đã được liên kết với một tài khoản khác trong hệ thống.');
        }
    }
    // 3. Hash mật khẩu
    const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
    // 4. Khởi tạo người dùng mới với vai trò BTC mặc định (Người tổ chức sự kiện)
    const newUser = await database_1.default.user.create({
        data: {
            email: normalizedEmail,
            fullName: trimmedName,
            passwordHash,
            phone: trimmedPhone,
            department: trimmedDepartment,
            role: types_1.UserRole.BTC, // BẮT BUỘC: Quyền cơ bản, không được tự cấp quyền phê duyệt
            isActive: true,
            failedLoginAttempts: 0,
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            department: true,
            role: true,
            createdAt: true,
        },
    });
    console.log(`[USER REGISTRATION] Người dùng mới đăng ký thành công: ${newUser.email} (${newUser.fullName}) - Quyền: ${newUser.role}`);
    return newUser;
}
/**
 * Yêu cầu khôi phục mật khẩu (Quên mật khẩu)
 * - Tạo mã OTP 6 số ngẫu nhiên an toàn
 * - Mã OTP hết hạn sau 5 phút
 * - Gửi email chứa OTP qua SMTP/Nodemailer
 * - Trả về thông báo trung tính chống lộ danh tính tài khoản
 */
async function requestPasswordReset(email, sendOtpEmail = mail_service_1.sendPasswordResetOtpEmail) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await database_1.default.user.findUnique({ where: { email: normalizedEmail } });
    const pendingLegacyAccount = user &&
        !user.isActive &&
        (await database_1.default.legacyIdentityMap.findFirst({
            where: {
                entity: LEGACY_ACTIVATION_ENTITY,
                applicationId: user.id,
                verifiedAt: null,
            },
            select: { legacyId: true },
        }));
    if (user && (user.isActive || pendingLegacyAccount)) {
        // Vô hiệu hóa các OTP cũ chưa sử dụng của email này
        await database_1.default.passwordResetToken.updateMany({
            where: { email: normalizedEmail, used: false },
            data: { used: true },
        });
        // Tạo mã OTP 6 chữ số ngẫu nhiên (100000 - 999999)
        const otp = crypto_1.default.randomInt(100000, 1000000).toString();
        const otpHash = await bcryptjs_1.default.hash(otp, 10);
        // Tạo session token an toàn cho phiên đổi mật khẩu sau khi xác minh OTP
        const sessionTokenHash = crypto_1.default
            .createHash('sha256')
            .update(crypto_1.default.randomBytes(32))
            .digest('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút
        const resetRecord = await database_1.default.passwordResetToken.create({
            data: {
                email: normalizedEmail,
                token: sessionTokenHash,
                otpHash,
                attempts: 0,
                expiresAt,
                verified: false,
                used: false,
            },
        });
        const delivery = await sendOtpEmail(normalizedEmail, otp, user.fullName);
        if (!delivery.sent) {
            await database_1.default.passwordResetToken.update({
                where: { id: resetRecord.id },
                data: { used: true },
            });
            console.error(`[PASSWORD RESET EMAIL DELIVERY FAILURE] ${delivery.reason || 'UNKNOWN'}`);
        }
    }
    // Luôn trả về thông báo trung tính để không tiết lộ sự tồn tại của tài khoản
    return {
        message: 'Yêu cầu đã được tiếp nhận. Nếu email thuộc tài khoản đủ điều kiện và gửi thư thành công, bạn sẽ nhận được mã xác minh. Nếu không nhận được thư, vui lòng thử lại hoặc liên hệ quản trị viên.',
    };
}
/**
 * Xác thực mã OTP 6 số
 * - Giới hạn 5 lần nhập sai
 * - Kiểm tra thời hạn 5 phút
 * - Cấp session token để đặt lại mật khẩu mới mà không bắt nhập lại token
 */
async function verifyResetOtp(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim().replace(/\s+/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
        throw new Error('Mã xác minh phải bao gồm đúng 6 chữ số.');
    }
    const pendingLegacyAccount = await database_1.default.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, isActive: true },
    });
    const canActivateLegacy = pendingLegacyAccount &&
        !pendingLegacyAccount.isActive &&
        (await database_1.default.legacyIdentityMap.findFirst({
            where: {
                entity: LEGACY_ACTIVATION_ENTITY,
                applicationId: pendingLegacyAccount.id,
                verifiedAt: null,
            },
            select: { legacyId: true },
        }));
    // Tìm bản ghi OTP mới nhất chưa sử dụng của email này
    const record = await database_1.default.passwordResetToken.findFirst({
        where: {
            email: normalizedEmail,
            used: false,
            verified: false,
        },
        orderBy: { createdAt: 'desc' },
    });
    if (!record || record.expiresAt < new Date()) {
        throw new Error('Mã xác minh không hợp lệ hoặc đã hết hạn (sau 5 phút). Vui lòng yêu cầu gửi lại mã mới.');
    }
    // Kiểm tra số lần nhập sai (tối đa 5 lần)
    if (record.attempts >= 5) {
        await database_1.default.passwordResetToken.update({
            where: { id: record.id },
            data: { used: true },
        });
        throw new Error('Bạn đã nhập sai mã xác minh quá 5 lần. Mã này đã bị vô hiệu hóa vì lý do an toàn. Vui lòng gửi lại yêu cầu.');
    }
    const user = await database_1.default.user.findUnique({
        where: { email: normalizedEmail },
        select: { isActive: true },
    });
    if ((!user || !user.isActive) && !canActivateLegacy) {
        throw new Error('Không tìm thấy tài khoản đủ điều kiện khôi phục.');
    }
    if (!record.otpHash || !(await bcryptjs_1.default.compare(cleanOtp, record.otpHash))) {
        const updatedAttempts = record.attempts + 1;
        await database_1.default.passwordResetToken.update({
            where: { id: record.id },
            data: { attempts: updatedAttempts },
        });
        const remaining = 5 - updatedAttempts;
        throw new Error(`Mã xác minh không chính xác. Bạn còn ${remaining} lần thử trước khi mã bị vô hiệu hóa.`);
    }
    const resetSessionToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetSessionTokenHash = crypto_1.default.createHash('sha256').update(resetSessionToken).digest('hex');
    const verified = await database_1.default.passwordResetToken.updateMany({
        where: {
            id: record.id,
            verified: false,
            used: false,
            attempts: { lt: 5 },
            expiresAt: { gt: new Date() },
        },
        data: { verified: true, token: resetSessionTokenHash },
    });
    if (verified.count !== 1) {
        throw new Error('Mã xác minh đã được sử dụng hoặc không còn hợp lệ.');
    }
    return {
        success: true,
        resetSessionToken,
        email: record.email,
        message: 'Xác minh mã thành công! Bạn có thể đặt mật khẩu mới ngay bây giờ.',
    };
}
/**
 * Xác thực token đặt lại mật khẩu (dành cho kiểm tra liên kết trực tiếp)
 */
async function verifyResetToken(token) {
    const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const resetRecord = await database_1.default.passwordResetToken.findUnique({
        where: { token: tokenHash },
    });
    if (!resetRecord || !resetRecord.verified || resetRecord.used || resetRecord.expiresAt < new Date()) {
        return { valid: false, error: 'Mã khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu.' };
    }
    return { valid: true, email: resetRecord.email };
}
/**
 * Đặt lại mật khẩu mới
 * - Xác thực token / session token
 * - Băm bcrypt mật khẩu mới
 * - Mở khóa tài khoản nếu đang bị khóa đăng nhập tạm thời
 * - Đánh dấu token đã sử dụng (sử dụng 1 lần duy nhất)
 */
async function resetPassword(token, newPassword) {
    if (newPassword.length < 6) {
        throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
    }
    const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const resetRecord = await database_1.default.passwordResetToken.findUnique({
        where: { token: tokenHash },
    });
    if (!resetRecord ||
        !resetRecord.verified ||
        resetRecord.used ||
        resetRecord.expiresAt < new Date()) {
        throw new Error('Phiên khôi phục mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu mới.');
    }
    const user = await database_1.default.user.findUnique({ where: { email: resetRecord.email } });
    if (!user) {
        throw new Error('Không tìm thấy tài khoản người dùng tương ứng.');
    }
    // Hash mật khẩu mới bằng bcrypt
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
    await database_1.default.$transaction(async (tx) => {
        if (!user.isActive) {
            const activation = await tx.legacyIdentityMap.updateMany({
                where: {
                    entity: LEGACY_ACTIVATION_ENTITY,
                    applicationId: user.id,
                    verifiedAt: null,
                },
                data: { verifiedAt: new Date() },
            });
            if (activation.count !== 1) {
                throw new Error('Tài khoản này chưa đủ điều kiện kích hoạt. Vui lòng liên hệ quản trị viên.');
            }
        }
        await tx.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                failedLoginAttempts: 0,
                lockedUntil: null,
                ...(!user.isActive ? { isActive: true } : {}),
            },
        });
        const consumed = await tx.passwordResetToken.updateMany({
            where: { id: resetRecord.id, verified: true, used: false },
            data: { used: true },
        });
        if (consumed.count !== 1) {
            throw new Error('Phiên khôi phục đã được sử dụng hoặc không còn hợp lệ.');
        }
    });
    console.log(`[PASSWORD RESET SUCCESS] Đặt lại mật khẩu thành công cho tài khoản ${user.email}.`);
    return { success: true, message: 'Đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.' };
}
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
async function getUserById(userId) {
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            department: true,
            phone: true,
            isActive: true,
            createdAt: true,
        },
    });
    if (!user)
        return null;
    return {
        ...user,
        permissions: (0, permissions_1.getPermissionsForRole)(user.role),
    };
}
//# sourceMappingURL=auth.service.js.map