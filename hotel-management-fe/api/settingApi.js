const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/settings`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getSettings = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (err) {
    console.error('Error fetching settings:', err);
    throw err;
  }
};

const updateSettings = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update settings');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating settings:', err);
    throw err;
  }
};

export default {
  getSettings,
  updateSettings
};
