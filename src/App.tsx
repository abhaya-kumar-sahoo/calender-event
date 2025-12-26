import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import DashboardLayout from './components/DashboardLayout';
import Scheduling from './pages/dashboard/Scheduling';
import Meetings from './pages/dashboard/Meetings';
import Contacts from './pages/dashboard/Contacts';
import BookingPage from './pages/booking/BookingPage';

function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path='/' element={<Navigate to='/dashboard' replace />} />

        {/* Host Dashboard Routes */}
        <Route path='/dashboard' element={<DashboardLayout />}>
          <Route index element={<Scheduling />} />
          <Route path='meetings' element={<Meetings />} />
          <Route path='contacts' element={<Contacts />} />
        </Route>

        {/* Public Booking Page */}
        <Route path='/book/:eventSlug' element={<BookingPage />} />
      </Routes>
    </StoreProvider>
  );
}

export default App;
