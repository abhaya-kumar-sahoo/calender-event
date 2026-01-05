import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/apiSlice';
import logo from "../assets/logo_invite.png";
import { baseUrl } from '../utils';



export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${baseUrl}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.data?.message || 'Login failed');
    }
  };

  return (
    <div className='min-h-screen bg-white flex text-black'>
      {/* Left side - Login Form */}
      <div className='flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white'>
        <div className='mx-auto w-full max-w-sm'>
          <div className="mb-8">
            <Link to="/">
              <img src={logo} alt="Invite" className='h-8 w-auto mb-8' />
            </Link>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
              Welcome back
            </h2>

          </div>

          {/* Google Login */}
          <button
            type='button'
            onClick={handleGoogleLogin}
            className='w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 rounded-xl px-4 py-3 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all focus:ring-4 focus:ring-gray-100 mb-8'
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
            Sign in with Google
          </button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Or sign in with email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form className='space-y-6' onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

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
                  className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-colors'
                  placeholder='••••••••'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Abstract Visual */}
      <div className='hidden lg:block relative w-0 flex-1 bg-gray-50'>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-8 max-w-lg text-center px-4">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center transform 6 shadow-2xl shadow-blue-200">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Secure Access.</h2>
            <p className="text-xl text-gray-600">Login to manage your schedule and meetings with ease.</p>
          </div>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-[-1]">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[100px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[100px] opacity-60" />
        </div>
      </div>
    </div>
  );
}
