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
import ForgotPassword from './pages/ForgotPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Home from './pages/Home';
import Profile from './pages/dashboard/Profile';
import LoadingScreen from './components/LoadingScreen';

// Protected Route Guard
function RequireAuth({ children }: { children: JSX.Element }) {
  const { data: user, isLoading } = useCheckAuthQuery();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
}

// Public Route Guard (redirects to dashboard if logged in)
function PublicRoute({ children }: { children: JSX.Element }) {
  const { data: user, isLoading } = useCheckAuthQuery();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
}

function AppContent() {
  const { isLoading } = useCheckAuthQuery();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path='/' element={<PublicRoute><Home /></PublicRoute>} />
      <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
      {/* <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} /> */}
      <Route path='/forgot-password' element={<PublicRoute><ForgotPassword /></PublicRoute>} />

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
        <Route path='profile' element={<Profile />} />
      </Route>

      {/* Public Booking Page */}
      <Route path='/book/:id' element={<BookingPage />} />
      <Route path='/privacy-policy' element={<PrivacyPolicy />} />
      <Route path='/terms-of-service' element={<TermsOfService />} />
    </Routes>
  );
}


function App() {
  return (
    <Provider store={store}>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </Provider>
  );
}

export default App;
