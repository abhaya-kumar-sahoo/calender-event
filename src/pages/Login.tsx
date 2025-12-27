import { Calendar } from 'lucide-react';
import { isTesting } from '../utility';

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = isTesting
      ? 'http://localhost:5001/auth/google'
      : 'https://calender-event-6p9k.onrender.com/auth/google';
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='bg-white w-full max-w-md rounded-2xl shadow-xl p-8 text-center'>
        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <Calendar className='w-8 h-8 text-blue-600' />
        </div>

        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
        <p className='text-gray-500 mb-8'>
          Sign in to manage your calendar and meetings.
        </p>

        <button
          onClick={handleGoogleLogin}
          className='w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all hover:shadow-md'
        >
          <img
            src='https://www.svgrepo.com/show/475656/google-color.svg'
            alt='Google'
            className='w-6 h-6'
          />
          Continue with Google
        </button>

        <p className='mt-8 text-xs text-gray-400'>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
