const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/service-usage-history`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getServiceUsageHistory = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch service usage history');
    return await res.json();
  } catch (err) {
    console.error('Error fetching service usage history:', err);
    throw err;
  }
};

const getServiceUsageHistoryById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch service usage history record');
    return await res.json();
  } catch (err) {
    console.error('Error fetching service usage history record:', err);
    throw err;
  }
};

const getHistoryByServiceUsageId = async (serviceUsageId) => {
  try {
    const res = await fetch(`${API_URL}/usage/${serviceUsageId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch service usage history');
    return await res.json();
  } catch (err) {
    console.error('Error fetching service usage history:', err);
    throw err;
  }
};

const createServiceUsageHistory = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create service usage history');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating service usage history:', err);
    throw err;
  }
};

const updateServiceUsageHistory = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update service usage history');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating service usage history:', err);
    throw err;
  }
};

const deleteServiceUsageHistory = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete service usage history');
    return await res.json();
  } catch (err) {
    console.error('Error deleting service usage history:', err);
    throw err;
  }
};

export default {
  getServiceUsageHistory,
  getServiceUsageHistoryById,
  getHistoryByServiceUsageId,
  createServiceUsageHistory,
  updateServiceUsageHistory,
  deleteServiceUsageHistory
};
