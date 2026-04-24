const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/services`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getServices = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch services');
    return await res.json();
  } catch (err) {
    console.error('Error fetching services:', err);
    throw err;
  }
};

const getServiceById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch service');
    return await res.json();
  } catch (err) {
    console.error('Error fetching service:', err);
    throw err;
  }
};

const getServiceByMaDV = async (MaDV) => {
  try {
    const res = await fetch(`${API_URL}/code/${MaDV}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch service');
    return await res.json();
  } catch (err) {
    console.error('Error fetching service:', err);
    throw err;
  }
};

const createService = async (serviceData) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(serviceData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create service');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating service:', err);
    throw err;
  }
};

const updateService = async (id, serviceData) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(serviceData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update service');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating service:', err);
    throw err;
  }
};

const deleteService = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete service');
    }
    return await res.json();
  } catch (err) {
    console.error('Error deleting service:', err);
    throw err;
  }
};

export default {
  getServices,
  getServiceById,
  getServiceByMaDV,
  createService,
  updateService,
  deleteService
};
