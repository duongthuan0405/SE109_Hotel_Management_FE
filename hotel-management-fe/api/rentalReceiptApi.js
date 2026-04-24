const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/rental-receipts`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getRentalReceipts = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch rental receipts');
    return await res.json();
  } catch (err) {
    console.error('Error fetching rental receipts:', err);
    throw err;
  }
};

const getRentalReceiptById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch rental receipt');
    return await res.json();
  } catch (err) {
    console.error('Error fetching rental receipt:', err);
    throw err;
  }
};

const createRentalReceipt = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create rental receipt');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating rental receipt:', err);
    throw err;
  }
};

const updateRentalReceipt = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update rental receipt');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating rental receipt:', err);
    throw err;
  }
};

const checkOut = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}/checkout`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to checkout');
    return await res.json();
  } catch (err) {
    console.error('Error checking out:', err);
    throw err;
  }
};

const deleteRentalReceipt = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete rental receipt');
    return await res.json();
  } catch (err) {
    console.error('Error deleting rental receipt:', err);
    throw err;
  }
};

export default {
  getRentalReceipts,
  getRentalReceiptById,
  createRentalReceipt,
  updateRentalReceipt,
  checkOut,
  deleteRentalReceipt
};
