const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/stripe`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

/**
 * Create a Stripe checkout session for booking deposit
 * @param {Object} bookingData - Booking information
 * @returns {Promise<{sessionId: string, url: string, bookingId: string}>}
 */
const createCheckoutSession = async (bookingData) => {
  try {
    const res = await fetch(`${API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData)
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create checkout session');
    }
    
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Error creating checkout session:', err);
    throw err;
  }
};

/**
 * Verify payment after returning from Stripe
 * @param {string} sessionId - Stripe session ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} - Updated booking data
 */
const verifyPayment = async (sessionId, bookingId) => {
  try {
    const res = await fetch(
      `${API_URL}/verify-payment?session_id=${sessionId}&booking_id=${bookingId}`,
      {
        headers: getHeaders()
      }
    );
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to verify payment');
    }
    
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Error verifying payment:', err);
    throw err;
  }
};

/**
 * Cancel a pending booking when user cancels payment
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>}
 */
const cancelPendingBooking = async (bookingId) => {
  try {
    const res = await fetch(
      `${API_URL}/cancel-booking?booking_id=${bookingId}`,
      {
        headers: getHeaders()
      }
    );
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to cancel booking');
    }
    
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Error canceling booking:', err);
    throw err;
  }
};

export default {
  createCheckoutSession,
  verifyPayment,
  cancelPendingBooking
};
