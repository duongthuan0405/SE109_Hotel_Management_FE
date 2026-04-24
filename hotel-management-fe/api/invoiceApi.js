const API_BASE_URL = "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/invoices`;

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const getInvoices = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch invoices");
    return await res.json();
  } catch (err) {
    console.error("Error fetching invoices:", err);
    throw err;
  }
};

const getInvoiceById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch invoice");
    return await res.json();
  } catch (err) {
    console.error("Error fetching invoice:", err);
    throw err;
  }
};

const createInvoice = async (invoiceData) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(invoiceData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create invoice");
    }
    return await res.json();
  } catch (err) {
    console.error("Error creating invoice:", err);
    throw err;
  }
};

const updateInvoice = async (id, invoiceData) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(invoiceData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update invoice");
    }
    return await res.json();
  } catch (err) {
    console.error("Error updating invoice:", err);
    throw err;
  }
};

const deleteInvoice = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to delete invoice");
    }
    return await res.json();
  } catch (err) {
    console.error("Error deleting invoice:", err);
    throw err;
  }
};

export default {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getPreview: async (phieuId) => {
    try {
      const res = await fetch(`${API_URL}/preview?phieuId=${phieuId}`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch invoice preview");
      }
      return await res.json();
    } catch (err) {
      console.error("Error fetching invoice preview:", err);
      throw err;
    }
  },
  createCheckoutInvoice: async (checkoutData) => {
    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(checkoutData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create checkout invoice");
      }
      return await res.json();
    } catch (err) {
      console.error("Error creating checkout invoice:", err);
      throw err;
    }
  },
};
