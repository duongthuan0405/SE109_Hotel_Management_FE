const API_BASE_URL =  'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/customers`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getCustomers = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return await res.json();
  } catch (err) {
    console.error('Error fetching customers:', err);
    throw err;
  }
};

const getCustomerById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch customer');
    return await res.json();
  } catch (err) {
    console.error('Error fetching customer:', err);
    throw err;
  }
};

const getCustomerByMaKH = async (MaKH) => {
  try {
    const res = await fetch(`${API_URL}/code/${MaKH}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch customer');
    return await res.json();
  } catch (err) {
    console.error('Error fetching customer:', err);
    throw err;
  }
};

const createCustomer = async (customerData) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(customerData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create customer');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating customer:', err);
    throw err;
  }
};

const updateCustomer = async (id, customerData) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(customerData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update customer');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating customer:', err);
    throw err;
  }
};

const deleteCustomer = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete customer');
    }
    return await res.json();
  } catch (err) {
    console.error('Error deleting customer:', err);
    throw err;
  }
};

export default {
  getCustomers,
  getCustomerById,
  getCustomerByMaKH,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
