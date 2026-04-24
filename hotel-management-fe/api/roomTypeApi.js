const API_BASE_URL = "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/room-types`;

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const getRoomTypes = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch room types");

    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Error fetching room types:", err);
    throw err;
  }
};

const getRoomTypeById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch room type");
    return await res.json();
  } catch (err) {
    console.error("Error fetching room type:", err);
    throw err;
  }
};

const createRoomType = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create room type");
    }
    return await res.json();
  } catch (err) {
    console.error("Error creating room type:", err);
    throw err;
  }
};

const updateRoomType = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update room type");
    }
    return await res.json();
  } catch (err) {
    console.error("Error updating room type:", err);
    throw err;
  }
};

const deleteRoomType = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete room type");
    return await res.json();
  } catch (err) {
    console.error("Error deleting room type:", err);
    throw err;
  }
};

export default {
  getRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};
