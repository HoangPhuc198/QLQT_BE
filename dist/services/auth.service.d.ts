import { sendPasswordResetOtpEmail } from './mail.service';
/**
 * Đăng nhập với cơ chế bảo mật khóa tài khoản sau 5 lần nhập sai mật khẩu
 */
export declare function login(email: string, password: string): Promise<{
    token: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        department: string | null;
        phone: string | null;
        permissions: import("../config/permissions").Permission[];
    };
}>;
/**
 * Đăng ký tài khoản mới:
 * - Chuẩn hóa định dạng email và số điện thoại
 * - Kiểm tra trùng lặp
 * - BẮT BUỘC gán vai trò cơ bản BTC (không cho phép người dùng tự cấp quyền phê duyệt/admin)
 */
export declare function register(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
}): Promise<{
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    role: string;
    department: string | null;
    createdAt: Date;
}>;
/**
 * Yêu cầu khôi phục mật khẩu (Quên mật khẩu)
 * - Tạo mã OTP 6 số ngẫu nhiên an toàn
 * - Mã OTP hết hạn sau 5 phút
 * - Gửi email chứa OTP qua SMTP/Nodemailer
 * - Trả về thông báo trung tính chống lộ danh tính tài khoản
 */
export declare function requestPasswordReset(email: string, sendOtpEmail?: typeof sendPasswordResetOtpEmail): Promise<{
    message: string;
}>;
/**
 * Xác thực mã OTP 6 số
 * - Giới hạn 5 lần nhập sai
 * - Kiểm tra thời hạn 5 phút
 * - Cấp session token để đặt lại mật khẩu mới mà không bắt nhập lại token
 */
export declare function verifyResetOtp(email: string, otp: string): Promise<{
    success: boolean;
    resetSessionToken: string;
    email: string;
    message: string;
}>;
/**
 * Xác thực token đặt lại mật khẩu (dành cho kiểm tra liên kết trực tiếp)
 */
export declare function verifyResetToken(token: string): Promise<{
    valid: boolean;
    error: string;
    email?: undefined;
} | {
    valid: boolean;
    email: string;
    error?: undefined;
}>;
/**
 * Đặt lại mật khẩu mới
 * - Xác thực token / session token
 * - Băm bcrypt mật khẩu mới
 * - Mở khóa tài khoản nếu đang bị khóa đăng nhập tạm thời
 * - Đánh dấu token đã sử dụng (sử dụng 1 lần duy nhất)
 */
export declare function resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function hashPassword(password: string): Promise<string>;
export declare function getUserById(userId: string): Promise<{
    permissions: import("../config/permissions").Permission[];
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    role: string;
    department: string | null;
    isActive: boolean;
    createdAt: Date;
} | null>;
