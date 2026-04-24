const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/positions`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getPositions = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch positions');
    return await res.json();
  } catch (err) {
    console.error('Error fetching positions:', err);
    throw err;
  }
};

const getPositionById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch position');
    return await res.json();
  } catch (err) {
    console.error('Error fetching position:', err);
    throw err;
  }
};

const createPosition = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create position');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating position:', err);
    throw err;
  }
};

const updatePosition = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update position');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating position:', err);
    throw err;
  }
};

const deletePosition = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete position');
    return await res.json();
  } catch (err) {
    console.error('Error deleting position:', err);
    throw err;
  }
};

export default {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
};
