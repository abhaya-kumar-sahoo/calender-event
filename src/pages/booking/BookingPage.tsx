import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { useGetPublicEventQuery } from '../../store/apiSlice';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Calendar as CalendarIcon,
  ArrowLeft,
  X,
  MapPin,
} from 'lucide-react';
import clsx from 'clsx';
import logo from '../../assets/logo.png';

type BookingStep = 'date-time' | 'form' | 'confirmation';

export default function BookingPage() {
  const { id } = useParams();
  const { addBooking } = useStore();
  const { data: event, isLoading } = useGetPublicEventQuery(id || '', {
    skip: !id,
  });

  const [step, setStep] = useState<BookingStep>('date-time');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    notes: '',
  });

  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestEmails, setGuestEmails] = useState<string[]>([]);
  const [currentGuestInput, setCurrentGuestInput] = useState('');

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Event Not Found
          </h1>
          <p className='text-gray-500 mb-6'>
            The event you are looking for does not exist.
          </p>
          <Link to='/dashboard' className='text-blue-600 hover:underline'>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Time Slots Generation (Mock)
  const generateTimeSlots = () => {
    const slots = [];
    let startHour = 10;
    const endHour = 19;

    for (let h = startHour; h < endHour; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }
    return slots; // simple mock strings for now
  };

  const timeSlots = generateTimeSlots();

  // Minimum booking date: 3rd January 2026
  const minDate = new Date(2026, 0, 3);

  const handleDateClick = (day: Date) => {
    if (isBefore(day, minDate)) return;
    setSelectedDate(day);
    setSelectedTime(null); // reset time when date changes
  };

  const handleTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep('form');
    }
  };

  const handleAddGuest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      const email = currentGuestInput.trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (!guestEmails.includes(email) && guestEmails.length < 10) {
          setGuestEmails([...guestEmails, email]);
          setCurrentGuestInput('');
        }
      }
    }
  };

  const removeGuest = (emailToRemove: string) => {
    setGuestEmails(guestEmails.filter((email) => email !== emailToRemove));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':');
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

    // Add any remaining input in guest field if valid
    let finalGuests = [...guestEmails];
    if (
      currentGuestInput &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentGuestInput) &&
      !finalGuests.includes(currentGuestInput)
    ) {
      finalGuests.push(currentGuestInput);
    }

    addBooking({
      eventId: event.id,
      guestName: formData.name,
      guestEmail: formData.email,
      guestMobile: formData.mobile,
      additionalGuests: finalGuests,
      startTime: bookingDateTime.toISOString(),
      notes: formData.notes,
    });

    setStep('confirmation');
  };

  // --- Views ---

  if (step === 'confirmation') {
    let endTimeFormatted = '';
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const tempDate = new Date();
      tempDate.setHours(hours, minutes);
      const endDate = new Date(tempDate.getTime() + event.duration * 60000);
      endTimeFormatted = format(endDate, 'H:mm');
    }

    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white max-w-lg w-full rounded-lg shadow-lg border border-gray-100 p-8 text-center'>
          <div className='bg-green-100 flex items-center justify-center mx-auto mb-6 text-green-600'>
            <div className='mb-6 flex justify-center md:justify-start'>
              <img
                src={logo}
                alt='Heritage Lane & Co'
                className='w-[280px] h-auto object-contain'
              />
            </div>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Confirmed</h2>
          <p className='text-gray-600 mb-6'>
            You are scheduled with Heritage Lane & Co Furniture.
          </p>

          <div className='bg-gray-50 rounded-lg p-4 text-left mb-8 border border-gray-100'>
            <div className='flex items-center gap-2 mb-2'>
              <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
              <span className='font-bold text-gray-800'>{event.title}</span>
            </div>
            <div className='flex items-center gap-2 text-gray-600 text-sm mb-1'>
              <CalendarIcon className='w-4 h-4' />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className='flex items-center gap-2 text-gray-600 text-sm'>
              <Clock className='w-4 h-4' />
              {selectedTime} - {endTimeFormatted} ({event.duration} min)
            </div>
            {guestEmails.length > 0 && (
              <div className='mt-3 text-sm text-gray-600 border-t border-gray-200 pt-2'>
                <span className='font-medium'>Guests:</span>{' '}
                {guestEmails.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8'>
      <div className='bg-white w-full max-w-5xl rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]'>
        {/* Left Panel: Event Info */}
        <div className='p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 md:w-1/3 bg-white'>
          {/* Logo */}
          <div className='mb-6 flex justify-center md:justify-start'>
            <img
              src={logo}
              alt='Heritage Lane & Co'
              className='w-[280px] h-auto object-contain'
            />
          </div>

          {step === 'form' && (
            <button
              onClick={() => setStep('date-time')}
              className='w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-gray-100 text-blue-600 mb-4 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
          )}

          <div className='text-gray-500 font-medium mb-1'>
            Heritage Lane and Co Furniture
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            {event.title}
          </h1>

          <div className='space-y-4 text-gray-600'>
            {/* Location */}
            <a
              href='https://www.google.com/maps/place/Heritage+Lane+%26+Co.+Furniture+Melbourne/@-37.8721929,144.7443595,57m/data=!3m1!1e3!4m6!3m5!1s0x6ad68952fb5e1a87:0x914594e155e5ae!8m2!3d-37.872261!4d144.744583!16s%2Fg%2F11yh3bl836?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-start gap-3 hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors group'
            >
              <MapPin className='w-5 h-5 text-gray-400 mt-0.5 group-hover:text-blue-600 transition-colors' />
              <div className='text-gray-600 group-hover:text-blue-600 transition-colors'>
                <p className='font-medium text-black group-hover:text-blue-700'>
                  1/22-30 Wallace Ave
                </p>
                <p>Point Cook VIC 3030</p>
              </div>
            </a>

            <div className='flex items-center gap-3'>
              <Globe className='w-5 h-5 text-gray-400' />
              <span>Australian Eastern Time (Melbourne)</span>
            </div>
          </div>

          <p className='mt-6 text-gray-600 text-sm leading-relaxed'>
            {event.description}
          </p>
        </div>

        {/* Right Panel: Interactive */}
        <div className='p-6 md:p-8 md:w-2/3 bg-white relative overflow-y-auto'>
          {step === 'date-time' && (
            <div className='flex flex-col md:flex-row h-full'>
              {/* Calendar Grid */}
              <div
                className={clsx(
                  'flex-1 transition-all',
                  selectedDate ? 'md:mr-8' : 'w-full mx-auto max-w-sm'
                )}
              >
                <h2 className='text-xl font-bold text-gray-900 mb-2 sticky top-0 bg-white'>
                  Select a Date & Time
                </h2>
                <p className='text-sm text-gray-500 mb-6'>
                  Dates available from 3rd January 2026
                </p>

                <div className='flex justify-between items-center mb-4'>
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className='p-1 hover:bg-gray-100 rounded-full'
                  >
                    <ChevronLeft className='w-5 h-5 text-blue-600' />
                  </button>
                  <span className='font-medium text-gray-800'>
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className='p-1 hover:bg-gray-100 rounded-full'
                  >
                    <ChevronRight className='w-5 h-5 text-blue-600' />
                  </button>
                </div>

                <div className='grid grid-cols-7 text-center text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide'>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (d) => (
                      <div key={d} className='py-2'>
                        {d}
                      </div>
                    )
                  )}
                </div>

                <div className='grid grid-cols-7 gap-1'>
                  {calendarDays.map((day) => {
                    const isSelected = selectedDate
                      ? isSameDay(day, selectedDate)
                      : false;
                    const isPast = isBefore(day, minDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast}
                        className={clsx(
                          'aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-colors relative',
                          !isCurrentMonth && 'invisible', // or text-gray-300
                          isPast &&
                            'text-gray-300 cursor-not-allowed line-through decoration-gray-300',
                          !isPast &&
                            isCurrentMonth &&
                            !isSelected &&
                            'text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold',
                          isSelected &&
                            'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform scale-105 z-10'
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots (Visible only when date selected) */}
              {selectedDate && (
                <div className='w-full md:w-64 border-l border-gray-100 pl-0 md:pl-8 mt-8 md:mt-0 animate-in fade-in slide-in-from-right-4 duration-300'>
                  <h3 className='text-gray-900 font-medium mb-4 sticky top-0 bg-white pb-2'>
                    {format(selectedDate, 'EEEE, MMM d')}
                  </h3>
                  <div className='space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
                    {timeSlots.map((time) => (
                      <div key={time} className='flex gap-2'>
                        <button
                          onClick={() => setSelectedTime(time)}
                          className={clsx(
                            'flex-1 py-3 rounded-lg border font-bold text-sm transition-all text-center',
                            selectedTime === time
                              ? 'bg-gray-600 text-white border-gray-600 w-1/2' // shrink to show confirm
                              : 'border-blue-200 text-blue-600 hover:border-blue-600 hover:border-2'
                          )}
                        >
                          {time}
                        </button>
                        {selectedTime === time && (
                          <button
                            onClick={handleTimeConfirm}
                            className='flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors'
                          >
                            Next
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'form' && (
            <div className='max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-300'>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>
                Enter Details
              </h2>

              <form onSubmit={handleFormSubmit} className='space-y-4'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Name *
                  </label>
                  <input
                    id='name'
                    required
                    className='w-full text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Email *
                  </label>
                  <input
                    id='email'
                    type='email'
                    required
                    className='w-full text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor='mobile'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Mobile No
                  </label>
                  <input
                    id='mobile'
                    type='tel'
                    className='w-full text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow'
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                  />
                </div>

                {!showGuestInput ? (
                  <button
                    type='button'
                    onClick={() => setShowGuestInput(true)}
                    className='flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-600 rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors'
                  >
                    Add Guests
                  </button>
                ) : (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Guest Email(s)
                    </label>
                    <div className='w-full px-3 py-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex flex-wrap gap-2 min-h-[46px]'>
                      {guestEmails.map((email) => (
                        <span
                          key={email}
                          className='inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-gray-100 text-gray-800'
                        >
                          {email}
                          <button
                            type='button'
                            onClick={() => removeGuest(email)}
                            className='ml-1.5 text-gray-400 hover:text-gray-600'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </span>
                      ))}
                      <input
                        type='text'
                        className='flex-1 text-gray-900 placeholder-gray-500 outline-none min-w-[120px] bg-transparent text-sm text-gray-900 placeholder-gray-500'
                        placeholder='Add guest email...'
                        value={currentGuestInput}
                        onChange={(e) => setCurrentGuestInput(e.target.value)}
                        onKeyDown={handleAddGuest}
                        onBlur={() => {
                          // Optional: add on blur if valid
                          const email = currentGuestInput.trim();
                          if (
                            email &&
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
                            !guestEmails.includes(email) &&
                            guestEmails.length < 10
                          ) {
                            setGuestEmails([...guestEmails, email]);
                            setCurrentGuestInput('');
                          }
                        }}
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      Notify up to 10 additional guests of the scheduled event.
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor='notes'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Product you are Interested in
                  </label>
                  <textarea
                    id='notes'
                    rows={4}
                    className='w-full text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none'
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <p className='text-xs text-gray-500 mt-4 leading-normal'>
                  By proceeding, you confirm that you have read and agree to
                  CalendlyClone's Terms of Use and Privacy Notice.
                </p>

                <button
                  type='submit'
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full mt-4 transition-transform active:scale-[0.98]'
                >
                  Schedule Event
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
