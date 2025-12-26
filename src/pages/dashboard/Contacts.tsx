import { useStore } from '../../store/StoreContext';
import { format } from 'date-fns';

export default function Contacts() {
  const { bookings } = useStore();

  // Deduplicate guests
  const contactsMap = new Map();

  bookings.forEach((booking) => {
    if (!contactsMap.has(booking.guestEmail)) {
      contactsMap.set(booking.guestEmail, {
        name: booking.guestName,
        email: booking.guestEmail,
        lastMeeting: booking.startTime,
        totalMeetings: 1,
      });
    } else {
      const contact = contactsMap.get(booking.guestEmail);
      contact.totalMeetings += 1;
      if (new Date(booking.startTime) > new Date(contact.lastMeeting)) {
        contact.lastMeeting = booking.startTime;
      }
    }
  });

  const contacts = Array.from(contactsMap.values());

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>Contacts</h1>

      <div className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm text-gray-600'>
            <thead className='bg-gray-50 text-gray-900 font-semibold border-b border-gray-200'>
              <tr>
                <th className='px-6 py-4'>Name</th>
                <th className='px-6 py-4'>Email</th>
                <th className='px-6 py-4'>Last Meeting</th>
                <th className='px-6 py-4 text-center'>Total Bookings</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {contacts.map((contact) => (
                <tr
                  key={contact.email}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-6 py-4 font-medium text-gray-900'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs'>
                        {contact.name.charAt(0)}
                      </div>
                      {contact.name}
                    </div>
                  </td>
                  <td className='px-6 py-4'>{contact.email}</td>
                  <td className='px-6 py-4 text-gray-500'>
                    {format(new Date(contact.lastMeeting), 'PPP')}
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span className='inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                      {contact.totalMeetings}
                    </span>
                  </td>
                </tr>
              ))}

              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    No contacts found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
