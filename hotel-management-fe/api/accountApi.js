const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/accounts`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getAccounts = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return await res.json();
  } catch (err) {
    console.error('Error fetching accounts:', err);
    throw err;
  }
};

const getAccountById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch account');
    return await res.json();
  } catch (err) {
    console.error('Error fetching account:', err);
    throw err;
  }
};

const createAccount = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create account');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating account:', err);
    throw err;
  }
};

const updateAccount = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update account');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating account:', err);
    throw err;
  }
};

const changePassword = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to change password');
    }
    return await res.json();
  } catch (err) {
    console.error('Error changing password:', err);
    throw err;
  }
};

const deleteAccount = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete account');
    return await res.json();
  } catch (err) {
    console.error('Error deleting account:', err);
    throw err;
  }
};

export default {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  changePassword,
  deleteAccount
};
