const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/booking-history`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getBookingHistory = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch booking history');
    return await res.json();
  } catch (err) {
    console.error('Error fetching booking history:', err);
    throw err;
  }
};

const getBookingHistoryById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch booking history record');
    return await res.json();
  } catch (err) {
    console.error('Error fetching booking history record:', err);
    throw err;
  }
};

const getHistoryByBookingId = async (bookingId) => {
  try {
    const res = await fetch(`${API_URL}/booking/${bookingId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch booking history');
    return await res.json();
  } catch (err) {
    console.error('Error fetching booking history:', err);
    throw err;
  }
};

const createBookingHistory = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create booking history');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating booking history:', err);
    throw err;
  }
};

const deleteBookingHistory = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete booking history');
    return await res.json();
  } catch (err) {
    console.error('Error deleting booking history:', err);
    throw err;
  }
};

export default {
  getBookingHistory,
  getBookingHistoryById,
  getHistoryByBookingId,
  createBookingHistory,
  deleteBookingHistory
};
