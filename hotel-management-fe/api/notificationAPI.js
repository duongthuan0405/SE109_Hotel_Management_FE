"use client";

const API_BASE_URL = "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/notifications`;


const getToken = () => localStorage.getItem("token");


const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});


const getNotificationsForGuest = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    const response = await res.json();
    return response.data || [];
  } catch (err) {
    console.error("Error fetching notifications:", err);
    throw err;
  }
};


const markNotificationAsRead = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}/read`, {
      method: "PUT",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to mark notification as read");
    const response = await res.json();
    return response.data;
  } catch (err) {
    console.error("Error marking notification as read:", err);
    throw err;
  }
};


export default {
  getNotificationsForGuest,
  markNotificationAsRead,
};

