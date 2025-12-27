import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { format } from 'date-fns';
import {
  User,
  Calendar as CalendarIcon,
  XCircle,
  Edit2,
  Filter,
  RefreshCcw,
} from 'lucide-react';
import clsx from 'clsx';
import Modal from '../../components/Modal';

export default function Meetings() {
  const { bookings, events, cancelBooking, updateBooking } = useStore();
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  console.log({ bookings });

  // Modal State
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [bookingToReschedule, setBookingToReschedule] = useState<{
    id: string;
    currentDate: Date;
  } | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredBookings = bookings
    .filter((booking) => {
      const bookingTime = new Date(booking.startTime).getTime();
      const now = Date.now();
      return filter === 'upcoming' ? bookingTime >= now : bookingTime < now;
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const performCancel = async () => {
    if (bookingToCancel) {
      setIsSubmitting(true);
      try {
        await cancelBooking(bookingToCancel);
        setBookingToCancel(null);
      } catch (error) {
        alert('Failed to cancel meeting.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const openRescheduleModal = (id: string, date: Date) => {
    setBookingToReschedule({ id, currentDate: date });
    setRescheduleData({
      date: format(date, 'yyyy-MM-dd'),
      time: format(date, 'HH:mm'),
    });
  };

  const performReschedule = async () => {
    if (bookingToReschedule && rescheduleData.date && rescheduleData.time) {
      const newDateTime = new Date(
        `${rescheduleData.date}T${rescheduleData.time}`
      );
      if (!isNaN(newDateTime.getTime())) {
        setIsSubmitting(true);
        try {
          await updateBooking(bookingToReschedule.id, {
            startTime: newDateTime.toISOString(),
            status: 'confirmed',
          });
          setBookingToReschedule(null);
        } catch (error) {
          alert('Failed to reschedule meeting.');
        } finally {
          setIsSubmitting(false);
        }
      } else {
        alert('Invalid date/time format');
      }
    }
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Meetings</h1>

        <div className='bg-gray-100 p-1 rounded-lg flex text-sm font-medium'>
          <button
            onClick={() => setFilter('upcoming')}
            className={clsx(
              'px-4 py-1.5 rounded-md transition-all',
              filter === 'upcoming'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={clsx(
              'px-4 py-1.5 rounded-md transition-all',
              filter === 'past'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Past
          </button>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden'>
        {filteredBookings.length === 0 ? (
          <div className='p-12 text-center text-gray-500'>
            No {filter} meetings found.
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {filteredBookings.map((booking) => {
              const eventType = events.find((e) => e.id === booking.eventId);
              const startDate = new Date(booking.startTime);
              const isExpanded = expandedId === booking.id;

              return (
                <div key={booking.id} className='group'>
                  <div
                    className={clsx(
                      'p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors',
                      isExpanded ? 'bg-gray-50' : 'bg-white'
                    )}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : booking.id)
                    }
                  >
                    <div className='flex items-start gap-4'>
                      <div className='flex flex-col items-center justify-center w-14 h-14 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex-shrink-0'>
                        <span className='text-xs font-bold uppercase'>
                          {format(startDate, 'MMM')}
                        </span>
                        <span className='text-xl font-bold'>
                          {format(startDate, 'd')}
                        </span>
                      </div>

                      <div>
                        <div className='font-semibold text-gray-900 flex items-center gap-2'>
                          {format(startDate, 'h:mm a')} -{' '}
                          {format(
                            new Date(
                              startDate.getTime() +
                                (eventType?.duration || 30) * 60000
                            ),
                            'h:mm a'
                          )}
                        </div>
                        <div className='text-sm font-medium text-gray-700 mt-0.5'>
                          {booking.title || eventType?.title || 'Unknown Event'}
                        </div>
                        <div className='text-sm text-gray-500 flex items-center gap-1.5 mt-1'>
                          <User className='w-3.5 h-3.5' />
                          {booking.guestName}{' '}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-4'>
                      <span
                        className={clsx(
                          'px-2.5 py-1 rounded-full text-xs font-medium border capitalize',
                          booking.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        )}
                      >
                        {booking.status}
                      </span>
                      <button className='text-gray-400 hover:text-gray-600 p-2 text-sm font-medium'>
                        {isExpanded ? 'Close' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className='p-6 border-t border-gray-100 bg-white grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-200'>
                      {/* Left: Actions */}
                      <div className='space-y-4'>
                        {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRescheduleModal(booking.id, startDate);
                          }}
                          className='w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-colors'
                        >
                          <CalendarIcon className='w-4 h-4' />
                          Reschedule
                        </button> */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingToCancel(booking.id);
                          }}
                          disabled={booking.status === 'cancelled'}
                          className='w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          <XCircle className='w-4 h-4' />
                          Cancel
                        </button>
                      </div>

                      {/* Right: Details */}
                      <div className='md:col-span-2 space-y-6'>
                        <div>
                          <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>
                            Invitee
                          </h3>
                          <div className='flex items-start gap-3'>
                            <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold'>
                              {booking.guestName.charAt(0)}
                            </div>
                            <div>
                              <p className='font-medium text-gray-900'>
                                {booking.guestName}
                              </p>
                              <p className='text-gray-500 text-sm'>
                                {booking.guestEmail}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>
                            Invitee Time Zone
                          </h3>
                          <p className='text-gray-900'>India Standard Time</p>
                        </div>

                        <div>
                          <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>
                            Meeting Host
                          </h3>
                          <p className='text-gray-900'>Abhaya Kumar Sahoo</p>
                        </div>

                        {booking.notes && (
                          <div>
                            <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>
                              Notes
                            </h3>
                            <p className='text-gray-700 bg-gray-50 p-3 rounded-lg text-sm'>
                              {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        title='Cancel Meeting'
      >
        <p className='text-gray-600 mb-6'>
          Are you sure you want to cancel this meeting? This action cannot be
          undone, and an email will be sent to the invitee.
        </p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={() => setBookingToCancel(null)}
            disabled={isSubmitting}
            className='px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
          >
            No, Keep it
          </button>
          <button
            onClick={performCancel}
            disabled={isSubmitting}
            className='px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
          >
            {isSubmitting ? 'Cancelling...' : 'Yes, Cancel Meeting'}
          </button>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!bookingToReschedule}
        onClose={() => setBookingToReschedule(null)}
        title='Reschedule Meeting'
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Select New Date
            </label>
            <input
              type='date'
              required
              className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              value={rescheduleData.date}
              onChange={(e) =>
                setRescheduleData({ ...rescheduleData, date: e.target.value })
              }
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Select New Time
            </label>
            <input
              type='time'
              required
              className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              value={rescheduleData.time}
              onChange={(e) =>
                setRescheduleData({ ...rescheduleData, time: e.target.value })
              }
            />
          </div>

          <div className='flex justify-end gap-3 mt-6'>
            <button
              onClick={() => setBookingToReschedule(null)}
              disabled={isSubmitting}
              className='px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              onClick={performReschedule}
              disabled={isSubmitting}
              className='px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
