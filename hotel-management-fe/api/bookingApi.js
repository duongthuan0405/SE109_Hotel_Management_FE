const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/bookings`;

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

const createBooking = async (bookingData) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData)
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

const updateBooking = async (id, bookingData) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(bookingData)
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
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to cancel booking');
    }
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
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete booking');
    }
    return await res.json();
  } catch (err) {
    console.error('Error deleting booking:', err);
    throw err;
  }
};



const createWalkInBooking = async (data) => {
  try {
    const res = await fetch(`${API_URL}/walk-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create walk-in booking');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating walk-in booking:', err);
    throw err;
  }
};

export default {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  createWalkInBooking
};
