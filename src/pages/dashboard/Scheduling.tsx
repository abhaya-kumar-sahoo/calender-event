import { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { Clock, Copy, Plus, ExternalLink, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';

export default function Scheduling() {
  const { events, addEvent, bookings, updateEvent } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    duration: 30,
    description: '',
    color: 'bg-purple-600',
  });

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const hasBookings = (eventId: string) => {
    return bookings.some(
      (b) => b.eventId === eventId && b.status !== 'cancelled'
    );
  };

  const openCreateModal = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      duration: 30,
      description: '',
      color: 'bg-purple-600',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: any) => {
    if (hasBookings(event.id)) {
      alert(
        'This event type cannot be edited because it has active bookings associated with it.'
      );
      return;
    }
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      duration: event.duration,
      description: event.description,
      color: event.color,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingEventId) {
      updateEvent(editingEventId, {
        ...formData,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      });
    } else {
      addEvent({
        ...formData,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      });
    }

    setIsModalOpen(false);
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
          New Event
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {events.map((event) => {
          const locked = hasBookings(event.id);
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
                    className={`p-1 rounded-full transition-colors ${
                      locked
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                    title={
                      locked
                        ? 'Cannot edit: Has active bookings'
                        : 'Edit Event Type'
                    }
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
                    onClick={() => handleCopyLink(event.slug)}
                    className='text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1'
                  >
                    <Copy className='w-4 h-4' />
                    Copy Link
                  </button>
                  <Link
                    to={`/book/${event.slug}`}
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
        title={editingEventId ? 'Edit Event Type' : 'Create New Event Type'}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
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
              className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
              className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white'
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
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
              className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none'
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
                  onClick={() => setFormData({ ...formData, color: c.value })}
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

          <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100'>
            <button
              type='button'
              onClick={() => setIsModalOpen(false)}
              className='px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors'
            >
              {editingEventId ? 'Save Changes' : 'Create Event Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
