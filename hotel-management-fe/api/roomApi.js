const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/rooms`;

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const getRooms = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return await res.json();
  } catch (err) {
    console.error('Error fetching rooms:', err);
    throw err;
  }
};

const getRoomById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch room');
    return await res.json();
  } catch (err) {
    console.error('Error fetching room:', err);
    throw err;
  }
};

const getRoomByMaPhong = async (MaPhong) => {
  try {
    const res = await fetch(`${API_URL}/code/${MaPhong}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch room');
    return await res.json();
  } catch (err) {
    console.error('Error fetching room:', err);
    throw err;
  }
};

const createRoom = async (roomData) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(roomData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create room');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating room:', err);
    throw err;
  }
};

const updateRoom = async (id, roomData) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(roomData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update room');
    }
    return await res.json();
  } catch (err) {
    console.error('Error updating room:', err);
    throw err;
  }
};

const changeRoomStatus = async (id, TrangThai) => {
  try {
    const res = await fetch(`${API_URL}/${id}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ TrangThai })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to change room status');
    }
    return await res.json();
  } catch (err) {
    console.error('Error changing room status:', err);
    throw err;
  }
};

const deleteRoom = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete room');
    }
    return await res.json();
  } catch (err) {
    console.error('Error deleting room:', err);
    throw err;
  }
};

export default {
  getRooms,
  getRoomById,
  getRoomByMaPhong,
  createRoom,
  updateRoom,
  changeRoomStatus,
  deleteRoom
};
