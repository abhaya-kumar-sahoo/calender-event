import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { Clock, Copy, Plus, ExternalLink, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export default function Scheduling() {
  const { events, addEvent, updateEvent, addBooking } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'event-type' | 'quick-booking'>(
    'event-type'
  );

  const [formData, setFormData] = useState({
    title: '',
    duration: 30,
    description: '',
    color: 'bg-purple-600',
  });

  const [quickBookingData, setQuickBookingData] = useState({
    eventId: '',
    guestName: '',
    guestEmail: '',
    date: '',
    time: '',
    notes: '',
    title: '',
    duration: 30,
  });

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/book/${id}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const openCreateModal = () => {
    setEditingEventId(null);
    setActiveTab('event-type');
    setFormData({
      title: '',
      duration: 30,
      description: '',
      color: 'bg-purple-600',
    });
    setQuickBookingData({
      eventId: events.length > 0 ? events[0].id : '',
      guestName: '',
      guestEmail: '',
      date: '',
      time: '',
      notes: '',
      title: '',
      duration: 30,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setEditingEventId(event.id);
    setActiveTab('event-type');
    setFormData({
      title: event.title,
      duration: event.duration,
      description: event.description,
      color: event.color,
    });
    setIsModalOpen(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'event-type') {
        if (!formData.title) return;
        if (editingEventId) {
          await updateEvent(editingEventId, {
            ...formData,
            slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          });
        } else {
          await addEvent({
            ...formData,
            slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          });
        }
      } else {
        // Quick Booking
        if (
          !quickBookingData.guestEmail ||
          !quickBookingData.date ||
          !quickBookingData.time
        ) {
          alert('Please fill in all required fields');
          setIsSubmitting(false);
          return;
        }

        // If eventId is selected, use it, otherwise use custom title/duration
        const bookingPayload: any = {
          guestName: quickBookingData.guestName,
          guestEmail: quickBookingData.guestEmail,
          startTime: new Date(
            `${quickBookingData.date}T${quickBookingData.time}`
          ).toISOString(),
          notes: quickBookingData.notes,
          additionalGuests: [],
        };

        if (quickBookingData.eventId) {
          bookingPayload.eventId = quickBookingData.eventId;
        } else {
          bookingPayload.title = quickBookingData.title || 'Quick Meeting';
          bookingPayload.duration = quickBookingData.duration || 30;
        }

        await addBooking(bookingPayload);
        alert('Meeting scheduled successfully!');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = [
    { label: 'Purple', value: 'bg-purple-600' },
    { label: 'Blue', value: 'bg-blue-600' },
    { label: 'Pink', value: 'bg-pink-600' },
    { label: 'Green', value: 'bg-green-600' },
    { label: 'Orange', value: 'bg-orange-600' },
    { label: 'Red', value: 'bg-red-600' },
  ];

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Scheduling</h1>
          <p className='text-gray-500'>
            Create events to share for people to book.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium transition-colors'
        >
          <Plus className='w-4 h-4' />
          Create
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {events.map((event) => {
          return (
            <div
              key={event.id}
              className='bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group'
            >
              <div className={`h-2 w-full ${event.color}`}></div>
              <div className='p-5'>
                <div className='flex justify-between items-start'>
                  <h3 className='text-lg font-bold text-gray-900 mb-1 pr-8'>
                    {event.title}
                  </h3>
                  <button
                    onClick={() => openEditModal(event)}
                    className='p-1 rounded-full transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    title='Edit Event Type'
                  >
                    <Settings className='w-4 h-4' />
                  </button>
                </div>

                <div className='flex items-center text-gray-500 text-sm mb-4'>
                  <Clock className='w-4 h-4 mr-1' />
                  {event.duration} mins
                </div>
                <p className='text-gray-600 text-sm mb-6 line-clamp-2'>
                  {event.description}
                </p>

                <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
                  <button
                    onClick={() => handleCopyLink(event.id)}
                    className='text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1'
                  >
                    <Copy className='w-4 h-4' />
                    Copy Link
                  </button>
                  <Link
                    to={`/book/${event.id}`}
                    target='_blank'
                    className='text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50'
                    title='View Booking Page'
                  >
                    <ExternalLink className='w-4 h-4' />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingEventId
            ? 'Edit Event Type'
            : activeTab === 'event-type'
            ? 'Create New Event Type'
            : 'Quick Meeting'
        }
      >
        {!editingEventId && (
          <div className='flex border-b border-gray-200 mb-4'>
            <button
              type='button'
              onClick={() => setActiveTab('event-type')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'event-type'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Event Type
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('quick-booking')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'quick-booking'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Quick Booking
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {activeTab === 'event-type' ? (
            <>
              <div>
                <label
                  htmlFor='title'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Event Title *
                </label>
                <input
                  id='title'
                  required
                  className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900'
                  placeholder='e.g. 15 Minute Discussion'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor='duration'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Duration (minutes)
                </label>
                <select
                  id='duration'
                  className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900'
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value),
                    })
                  }
                >
                  {[15, 30, 45, 60, 90, 120].map((m) => (
                    <option key={m} value={m}>
                      {m} min
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Description
                </label>
                <textarea
                  id='description'
                  rows={3}
                  className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900'
                  placeholder='Briefly describe what this event is about...'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Color
                </label>
                <div className='flex gap-2 flex-wrap'>
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type='button'
                      onClick={() =>
                        setFormData({ ...formData, color: c.value })
                      }
                      className={`w-8 h-8 rounded-full ${
                        c.value
                      } transition-transform ${
                        formData.color === c.value
                          ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                          : 'hover:scale-105'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Quick Booking Form
            <>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Meeting Title
                  </label>
                  <input
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900'
                    placeholder='Quick Chat'
                    value={quickBookingData.title || ''}
                    onChange={(e) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        title: e.target.value,
                        eventId: '',
                      })
                    }
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Leave blank to use an existing event type below (optional)
                  </p>
                </div>
                <div className='w-full md:w-1/3'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Duration (min)
                  </label>
                  <input
                    type='number'
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900'
                    value={quickBookingData.duration || 30}
                    onChange={(e) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        duration: parseInt(e.target.value),
                        eventId: '',
                      })
                    }
                  />
                </div>
              </div>

              <div className='relative'>
                <div
                  className='absolute inset-0 flex items-center'
                  aria-hidden='true'
                >
                  <div className='w-full border-t border-gray-300'></div>
                </div>
                <div className='relative flex justify-center'>
                  <span className='px-2 bg-white text-sm text-gray-500'>
                    OR Select Event Type
                  </span>
                </div>
              </div>

              <div>
                <select
                  className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900'
                  value={quickBookingData.eventId}
                  onChange={(e) =>
                    setQuickBookingData({
                      ...quickBookingData,
                      eventId: e.target.value,
                      title: '', // Clear title when picking event
                      duration: 30, // Reset duration when picking event
                    })
                  }
                >
                  <option value=''>Select an event type (Optional)</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({event.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Guest Name *
                  </label>
                  <input
                    required
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900'
                    placeholder='Jane Doe'
                    value={quickBookingData.guestName}
                    onChange={(e) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        guestName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Guest Email *
                  </label>
                  <input
                    required
                    type='email'
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900'
                    placeholder='jane@example.com'
                    value={quickBookingData.guestEmail}
                    onChange={(e) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        guestEmail: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Date *
                  </label>
                  <DatePicker
                    selected={
                      quickBookingData.date
                        ? new Date(quickBookingData.date)
                        : null
                    }
                    onChange={(date: any) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        date: date ? format(date, 'yyyy-MM-dd') : '',
                      })
                    }
                    dateFormat='MMM d, yyyy'
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900'
                    placeholderText='Select Date'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Time *
                  </label>
                  <DatePicker
                    selected={
                      quickBookingData.time
                        ? new Date(
                            `${
                              quickBookingData.date ||
                              format(new Date(), 'yyyy-MM-dd')
                            }T${quickBookingData.time}`
                          )
                        : null
                    }
                    onChange={(date: any) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        time: date ? format(date, 'HH:mm') : '',
                      })
                    }
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption='Time'
                    dateFormat='h:mm aa'
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900'
                    placeholderText='Select Time'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Notes
                </label>
                <textarea
                  rows={2}
                  className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900'
                  placeholder='Any additional notes...'
                  value={quickBookingData.notes}
                  onChange={(e) =>
                    setQuickBookingData({
                      ...quickBookingData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100'>
            <button
              type='button'
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className='px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              {isSubmitting
                ? 'Saving...'
                : activeTab === 'quick-booking'
                ? 'Schedule Meeting'
                : editingEventId
                ? 'Save Changes'
                : 'Create Event Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
