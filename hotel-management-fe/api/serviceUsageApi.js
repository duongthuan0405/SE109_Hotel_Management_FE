const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/service-usages`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getServiceUsages = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch service usages');
    return await res.json();
  } catch (err) {
    console.error('Error fetching service usages:', err);
    throw err;
  }
};

const getServiceUsagesByCustomerId = async (customerId) => {
  try {
    const res = await fetch(`${API_URL}/customer/${customerId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch customer service usages');
    return await res.json();
  } catch (err) {
    console.error('Error fetching customer service usages:', err);
    throw err;
  }
};

const getServiceUsageById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch service usage');
    return await res.json();
  } catch (err) {
    console.error('Error fetching service usage:', err);
    throw err;
  }
};

const createServiceUsage = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create service usage');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating service usage:', err);
    throw err;
  }
};

const updateServiceUsage = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update service usage');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating service usage:', err);
    throw err;
  }
};

const deleteServiceUsage = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete service usage');
    return await res.json();
  } catch (err) {
    console.error('Error deleting service usage:', err);
    throw err;
  }
};

export default {
  getServiceUsages,
  getServiceUsagesByCustomerId,
  getServiceUsageById,
  createServiceUsage,
  updateServiceUsage,
  deleteServiceUsage
};
