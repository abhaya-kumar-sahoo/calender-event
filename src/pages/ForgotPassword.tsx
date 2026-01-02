import { useState } from "react";
import {
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    KeyRound,
    CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
    useSendOtpMutation,
    useResetPasswordMutation,
} from "../store/apiSlice";
import logo from "../assets/logo_invite.png";

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const [resetPassword, { isLoading: isResetting }] =
        useResetPasswordMutation();
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            await sendOtp({ email, type: "reset" }).unwrap();
            setStep(2);
            setMessage("Verification code sent to your email.");
        } catch (err: any) {
            setError(err?.data?.message || "Failed to send verification code");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            await resetPassword({ email, otp, newPassword }).unwrap();
            // Show success and redirect
            setMessage("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err: any) {
            setError(err?.data?.message || "Failed to reset password");
        }
    };

    return (
        <div className="min-h-screen bg-white flex text-black">
            {/* Left side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-8">
                        <Link to="/">
                            <img src={logo} alt="Invite" className="h-8 w-auto mb-8" />
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            {step === 1 ? "Reset Password" : "Set New Password"}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {step === 1
                                ? "Enter your email and we'll send you a code to reset your password."
                                : "Enter the code sent to your email and your new password."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center gap-2 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            {message}
                        </div>
                    )}

                    {step === 1 ? (
                        // Step 1: Email Form
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                >
                                    Back to Login
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSendingOtp}
                                    className="flex justify-center items-center py-2.5 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isSendingOtp ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Send Code
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Step 2: OTP & Password Form
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors tracking-widest text-lg"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                >
                                    Change Email
                                </button>

                                <button
                                    type="submit"
                                    disabled={isResetting}
                                    className="flex justify-center items-center py-2.5 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isResetting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Reset Password
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right side - Abstract Visual */}
            <div className="hidden lg:block relative w-0 flex-1 bg-gray-50">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="space-y-8 max-w-lg text-center px-4">
                        <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center transform -rotate-3 shadow-2xl shadow-blue-200">
                            <KeyRound className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900">
                            Account Recovery.
                        </h2>
                        <p className="text-xl text-gray-600">
                            Securely reset your password and get back to your schedule.
                        </p>
                    </div>
                </div>
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-[-1]">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[100px] opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[100px] opacity-60" />
                </div>
            </div>
        </div>
    );
}
