import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Calendar, Link as LinkIcon, Users } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    { label: 'Scheduling', path: '/dashboard', icon: LinkIcon, exact: true },
    { label: 'Meetings', path: '/dashboard/meetings', icon: Calendar },
    { label: 'Contacts', path: '/dashboard/contacts', icon: Users },
  ];

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900'>
      {/* Sidebar */}
      <aside className='w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0'>
        <div className='p-6 border-b border-gray-100 flex items-center gap-2'>
          <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold'>
            C
          </div>
          <span className='text-xl font-bold tracking-tight text-gray-800'>
            CalendlyClone
          </span>
        </div>

        <nav className='p-4 space-y-1'>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
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
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold'>
              AS
            </div>
            <div className='text-sm'>
              <p className='font-medium text-gray-900'>Abhaya K. Sahoo</p>
              <p className='text-gray-500 text-xs'>Host</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 overflow-auto'>
        <div className='max-w-5xl mx-auto p-4 md:p-8'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
