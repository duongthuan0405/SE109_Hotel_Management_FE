export const API_BASE_URL =  'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('token');

export const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (includeAuth) {
    headers.Authorization = `Bearer ${getToken()}`;
  }
  return headers;
};

export const handleApiError = async (response, errorMessage = 'An error occurred') => {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || error.error || errorMessage);
    } catch (e) {
      throw new Error(errorMessage);
    }
  }
  return response;
};

export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: getHeaders(options.auth !== false),
      ...options
    });
    
    await handleApiError(response, options.errorMessage || 'API call failed');
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};

export const isLoggedIn = () => !!getToken();

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('vaiTro');
};

export const getRole = () => localStorage.getItem('vaiTro');
