const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/payment-methods`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getPaymentMethods = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch payment methods');
    return await res.json();
  } catch (err) {
    console.error('Error fetching payment methods:', err);
    throw err;
  }
};

const getPaymentMethodById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch payment method');
    return await res.json();
  } catch (err) {
    console.error('Error fetching payment method:', err);
    throw err;
  }
};

const createPaymentMethod = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create payment method');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating payment method:', err);
    throw err;
  }
};

const updatePaymentMethod = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update payment method');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating payment method:', err);
    throw err;
  }
};

const deletePaymentMethod = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete payment method');
    return await res.json();
  } catch (err) {
    console.error('Error deleting payment method:', err);
    throw err;
  }
};

export default {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
};
