const API_BASE_URL = "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/auth`;

const getHeaders = () => ({
  "Content-Type": "application/json",
});

const authApi = {
  register: async (
    TenDangNhap,
    MatKhau,
    VaiTro,
    HoTen,
    CMND,
    SDT,
    Email,
    DiaChi
  ) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        TenDangNhap,
        MatKhau,
        VaiTro,
        HoTen,
        CMND,
        SDT,
        Email,
        DiaChi,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Registration failed");
    }

    return await res.json();
  },

  login: async (TenDangNhap, MatKhau) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ TenDangNhap, MatKhau }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("vaiTro", data.VaiTro);
    }

    return data;
  },

  forgotPassword: async (Email) => {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ Email }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to send reset email");
    }

    return await res.json();
  },

  resetPasswordWithOTP: async (Email, OTP, MatKhau) => {
    const res = await fetch(`${API_URL}/reset-password-otp`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ Email, OTP, MatKhau }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to reset password");
    }

    return await res.json();
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vaiTro");
  },

  getToken: () => localStorage.getItem("token"),

  getRole: () => localStorage.getItem("vaiTro"),

  isLoggedIn: () => !!localStorage.getItem("token"),
};

export default authApi;