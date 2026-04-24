const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/dat-phong`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getBookings = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
  } catch (err) {
    console.error('Error fetching bookings:', err);
    throw err;
  }
};

const getBookingById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch booking');
    return await res.json();
  } catch (err) {
    console.error('Error fetching booking:', err);
    throw err;
  }
};

const getBookingsByCustomerId = async (customerId) => {
  try {
    const res = await fetch(`${API_URL}/customer/${customerId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch customer bookings');
    return await res.json();
  } catch (err) {
    console.error('Error fetching customer bookings:', err);
    throw err;
  }
};

const createBooking = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create booking');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating booking:', err);
    throw err;
  }
};

const updateBooking = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update booking');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating booking:', err);
    throw err;
  }
};

const cancelBooking = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to cancel booking');
    return await res.json();
  } catch (err) {
    console.error('Error canceling booking:', err);
    throw err;
  }
};

const deleteBooking = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete booking');
    return await res.json();
  } catch (err) {
    console.error('Error deleting booking:', err);
    throw err;
  }
};

export default {
  getBookings,
  getBookingById,
  getBookingsByCustomerId,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking
};
