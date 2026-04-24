const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/staff`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getStaff = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch staff');
    return await res.json();
  } catch (err) {
    console.error('Error fetching staff:', err);
    throw err;
  }
};

const getStaffById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch staff');
    return await res.json();
  } catch (err) {
    console.error('Error fetching staff:', err);
    throw err;
  }
};

const createStaff = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create staff');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating staff:', err);
    throw err;
  }
};

const updateStaff = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update staff');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating staff:', err);
    throw err;
  }
};

const deleteStaff = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete staff');
    return await res.json();
  } catch (err) {
    console.error('Error deleting staff:', err);
    throw err;
  }
};

export default {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};
