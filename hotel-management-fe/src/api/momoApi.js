const API_BASE_URL = 'http://localhost:4000/api';
const API_URL = `${API_BASE_URL}/momo`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

/**
 * Create a MoMo payment session for booking deposit
 * @param {Object} bookingData - Booking information (same as CreateBookingRequestDTO)
 * @returns {Promise<{payUrl: string, orderId: string, bookingId: string}>}
 */
const createPayment = async (bookingData) => {
  try {
    const res = await fetch(`${API_URL}/create-payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData)
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Không thể khởi tạo thanh toán MoMo');
    }
    
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Error creating MoMo payment:', err);
    throw err;
  }
};

/**
 * Verify MoMo payment after redirect
 * @param {Object} queryParams - Query parameters from MoMo redirect URL
 * @returns {Promise<Object>} - Updated booking data
 */
const verifyRedirect = async (queryParams) => {
  try {
    const searchParams = new URLSearchParams(queryParams).toString();
    const res = await fetch(`${API_URL}/verify-redirect?${searchParams}`, {
      headers: getHeaders()
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Xác thực thanh toán thất bại');
    }
    
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Error verifying MoMo payment:', err);
    throw err;
  }
};

export default {
  createPayment,
  verifyRedirect
};
