const API_BASE_URL = "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/maintenance`;


const getToken = () => localStorage.getItem("token");


const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});


const getMaintenanceRecords = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch maintenance records");
    const response = await res.json();
    return response.data || [];
  } catch (err) {
    console.error("Error fetching maintenance records:", err);
    throw err;
  }
};


const getMaintenanceRecordById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch maintenance record");
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error("Error fetching maintenance record:", err);
    throw err;
  }
};


const createMaintenanceRecord = async (data) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create maintenance record");
    }
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error("Error creating maintenance record:", err);
    throw err;
  }
};


const updateMaintenanceRecord = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update maintenance record");
    }
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error("Error updating maintenance record:", err);
    throw err;
  }
};


const deleteMaintenanceRecord = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete maintenance record");
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error("Error deleting maintenance record:", err);
    throw err;
  }
};


const getNextMaPBTCode = async () => {
    try {
      const res = await fetch(`${API_URL}/next-code`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch next maintenance code");
      const response = await res.json();
      return response.nextCode;
    } catch (err) {
      console.error("Error fetching next maintenance code:", err);
      throw err;
    }
  };


// Guest functions
const getMaintenanceRequestsForGuest = async () => {
  try {
    const res = await fetch(`${API_URL}/guest/requests`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch maintenance requests");
    const response = await res.json();
    return response.data || [];
  } catch (err) {
    console.error("Error fetching maintenance requests:", err);
    throw err;
  }
};


const createMaintenanceRequest = async (data) => {
  try {
    const res = await fetch(`${API_URL}/guest/request`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create maintenance request");
    }
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error("Error creating maintenance request:", err);
    throw err;
  }
};
 
export default {
  getNextMaPBTCode,
  getMaintenanceRecords,
  getMaintenanceRecordById,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceRequestsForGuest,
  createMaintenanceRequest,
};



