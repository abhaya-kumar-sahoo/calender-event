import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Calendar, Link as LinkIcon, Users, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { baseUrl, isTesting } from '../utility';

export default function DashboardLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Scheduling', path: '/dashboard', icon: LinkIcon, exact: true },
    { label: 'Meetings', path: '/dashboard/meetings', icon: Calendar },
    { label: 'Contacts', path: '/dashboard/contacts', icon: Users },
  ];

  return (
    <div className='h-screen bg-gray-50 flex overflow-hidden'>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 md:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='p-6 border-b border-gray-100 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-5 h-5'
              >
                <rect width='18' height='18' x='3' y='3' rx='2' />
                <path d='M7 7h10v10H7z' />
                <path d='M7 7 3 3' />
                <path d='M17 7 21 3' />
                <path d='M7 17 3 21' />
                <path d='M17 17 21 21' />
              </svg>
            </div>
            <span className='text-xl font-bold tracking-tight text-gray-800'>
              Tesseract
            </span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className='md:hidden text-gray-500 hover:text-gray-700'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <nav className='p-4 space-y-1 flex-1 overflow-y-auto'>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)} // Close sidebar on nav click (mobile)
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
                end={item.exact}
              >
                <item.icon
                  className={clsx(
                    'w-5 h-5',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className='p-4 mt-auto border-t border-gray-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold'>
                AS
              </div>
              <div className='text-sm'>
                <p className='font-medium text-gray-900'>Abhaya K. Sahoo</p>
                <p className='text-gray-500 text-xs'>Host</p>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = baseUrl + '/auth/logout')}
              className='text-gray-400 hover:text-red-600 transition-colors p-2'
              title='Logout'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'></path>
                <polyline points='16 17 21 12 16 7'></polyline>
                <line x1='21' y1='12' x2='9' y2='12'></line>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Mobile Header */}
        <div className='md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-5 h-5'
              >
                <rect width='18' height='18' x='3' y='3' rx='2' />
                <path d='M7 7h10v10H7z' />
                <path d='M7 7 3 3' />
                <path d='M17 7 21 3' />
                <path d='M7 17 3 21' />
                <path d='M17 17 21 21' />
              </svg>
            </div>
            <span className='font-bold text-gray-900'>Tesseract</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className='text-gray-600 hover:text-gray-900 p-1'
          >
            <Menu className='w-6 h-6' />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <main className='flex-1 overflow-y-auto'>
          <div className='max-w-5xl mx-auto p-4 md:p-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
