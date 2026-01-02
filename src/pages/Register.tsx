import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation, useSendOtpMutation } from '../store/apiSlice';
import logo from "../assets/logo_invite.png";
import { baseUrl } from '../utility';



export default function Register() {
    const [step, setStep] = useState(1); // 1: Form, 2: OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [register, { isLoading: isRegistering }] = useRegisterMutation();
    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        window.location.href = `${baseUrl}/auth/google`;
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await sendOtp({ email: formData.email, type: 'register' }).unwrap();
            setStep(2);
            setMessage('Verification code sent to your email.');
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to send verification code');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                otp
            }).unwrap();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className='min-h-screen bg-white flex text-black'>
            {/* Left side - Clean & Minimal */}
            <div className='flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white'>
                <div className='mx-auto w-full max-w-sm'>
                    <div className="mb-8">
                        <Link to="/">
                            <img src={logo} alt="Invite" className='h-8 w-auto mb-8' />
                        </Link>
                        <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
                            {step === 1 ? 'Create your account' : 'Verify Email'}
                        </h2>
                        <p className='mt-2 text-sm text-gray-600'>
                            {step === 1 ? (
                                <>
                                    Already have an account?{' '}
                                    <Link to='/login' className='font-medium text-blue-600 hover:text-blue-500'>
                                        Sign in here
                                    </Link>
                                </>
                            ) : (
                                "Enter the code sent to your email to complete registration."
                            )}
                        </p>
                    </div>

                    {step === 1 && (
                        <>
                            {/* Google Sign Up */}
                            <button
                                type='button'
                                onClick={handleGoogleLogin}
                                className='w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 rounded-xl px-4 py-3 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all focus:ring-4 focus:ring-gray-100'
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                                Sign up with Google
                            </button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-4 text-gray-500">Or sign up with email</span>
                                </div>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {message}
                        </div>
                    )}


                    {step === 1 ? (
                        /* Registration Form */
                        <form className='space-y-5' onSubmit={handleSendOtp}>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <User className='h-5 w-5 text-gray-400' />
                                    </div>
                                    <input
                                        type='text'
                                        required
                                        className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors'
                                        placeholder='John Doe'
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Email address</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <Mail className='h-5 w-5 text-gray-400' />
                                    </div>
                                    <input
                                        type='email'
                                        required
                                        className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors'
                                        placeholder='you@example.com'
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <Lock className='h-5 w-5 text-gray-400' />
                                    </div>
                                    <input
                                        type='password'
                                        required
                                        minLength={6}
                                        className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors'
                                        placeholder='••••••••'
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm Password</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <Lock className='h-5 w-5 text-gray-400' />
                                    </div>
                                    <input
                                        type='password'
                                        required
                                        className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors'
                                        placeholder='••••••••'
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type='submit'
                                disabled={isSendingOtp}
                                className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                            >
                                {isSendingOtp ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Verify Email
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <p className='text-xs text-center text-gray-500 mt-4'>
                                By signing up, you agree to our{' '}
                                <Link to="/terms-of-service" className="underline hover:text-gray-900">Terms</Link> and{' '}
                                <Link to="/privacy-policy" className="underline hover:text-gray-900">Privacy Policy</Link>.
                            </p>
                        </form>
                    ) : (
                        /* OTP Form */
                        <form className='space-y-6' onSubmit={handleRegister}>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Verification Code</label>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <KeyRound className='h-5 w-5 text-gray-400' />
                                    </div>
                                    <input
                                        type='text'
                                        required
                                        className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors tracking-widest text-lg'
                                        placeholder='123456'
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                >
                                    Edit Details
                                </button>

                                <button
                                    type='submit'
                                    disabled={isRegistering}
                                    className='flex justify-center items-center py-2.5 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                                >
                                    {isRegistering ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Complete Registration
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
            <div className='hidden lg:block relative w-0 flex-1 bg-gray-50'>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="space-y-8 max-w-lg text-center px-4">
                        <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center transform -rotate-6 shadow-2xl shadow-blue-200">
                            <Mail className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900">Join Invite Today.</h2>
                        <p className="text-xl text-gray-600">Start scheduling meetings efficiently and never miss a connection.</p>
                    </div>
                </div>
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-[-1]">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[100px] opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[100px] opacity-60" />
                </div>
            </div>
        </div>
    );
}
