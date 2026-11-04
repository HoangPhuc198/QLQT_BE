interface SendMailResult {
    sent: boolean;
    messageId?: string;
    reason?: string;
}
/**
 * Gửi email chứa mã OTP xác minh khôi phục mật khẩu
 */
export declare function sendPasswordResetOtpEmail(toEmail: string, otpCode: string, fullName?: string): Promise<SendMailResult>;
export {};
