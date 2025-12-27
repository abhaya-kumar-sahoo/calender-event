import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useCheckAuthQuery } from './store/apiSlice';
import DashboardLayout from './components/DashboardLayout';
import Scheduling from './pages/dashboard/Scheduling';
import Meetings from './pages/dashboard/Meetings';
import Contacts from './pages/dashboard/Contacts';
import BookingPage from './pages/booking/BookingPage';
import Login from './pages/Login';

// Protected Route Guard
function RequireAuth({ children }: { children: JSX.Element }) {
  const { data: user, isLoading } = useCheckAuthQuery();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Provider store={store}>
      <StoreProvider>
        <Routes>
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='/login' element={<Login />} />

          {/* Host Dashboard Routes (Protected) */}
          <Route
            path='/dashboard'
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Scheduling />} />
            <Route path='meetings' element={<Meetings />} />
            <Route path='contacts' element={<Contacts />} />
          </Route>

          {/* Public Booking Page */}
          <Route path='/book/:eventSlug' element={<BookingPage />} />
        </Routes>
      </StoreProvider>
    </Provider>
  );
}

export default App;
