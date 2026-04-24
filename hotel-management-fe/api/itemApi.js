const API_BASE_URL =  'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/items`;

const getToken = () => localStorage.getItem('token');

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (includeAuth) {
    headers.Authorization = `Bearer ${getToken()}`;
  }
  return headers;
};

const getItems = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch items');
    return await res.json();
  } catch (err) {
    console.error('Error fetching items:', err);
    throw err;
  }
};

const getItemById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch item');
    return await res.json();
  } catch (err) {
    console.error('Error fetching item:', err);
    throw err;
  }
};

const createItem = async (item) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create item');
    return await res.json();
  } catch (err) {
    console.error('Error creating item:', err);
    throw err;
  }
};

const updateItem = async (id, item) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return await res.json();
  } catch (err) {
    console.error('Error updating item:', err);
    throw err;
  }
};

const deleteItem = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return await res.json();
  } catch (err) {
    console.error('Error deleting item:', err);
    throw err;
  }
};

export default { getItems, getItemById, createItem, updateItem, deleteItem };
