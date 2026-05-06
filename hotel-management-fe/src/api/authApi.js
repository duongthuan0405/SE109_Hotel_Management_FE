const API_BASE_URL = "http://localhost:4000/api";
const API_URL = `${API_BASE_URL}/auth`;

const getHeaders = () => ({
  "Content-Type": "application/json",
});

const register = async (
  TenDangNhap,
  MatKhau,
  VaiTro,
  HoTen,
  CMND,
  SDT,
  Email,
  DiaChi
) => {
  try {
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
  } catch (err) {
    console.error("Error registering:", err);
    throw err;
  }
};

const login = async (TenDangNhap, MatKhau) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        TenDangNhap,
        MatKhau,
      }),
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
    return data.data;
  } catch (err) {
    console.error("Error logging in:", err);
    throw err;
  }
};

const forgotPassword = async (Email) => {
  try {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ Email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || "Failed to send reset email");
    }
    return await res.json();
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    throw err;
  }
};

const resetPasswordWithOTP = async (Email, OTP, MatKhau) => {
  try {
    const res = await fetch(`${API_URL}/reset-password-otp`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ Email, OTP, MatKhau }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || "Failed to reset password");
    }
    return await res.json();
  } catch (err) {
    console.error("Error in resetPasswordWithOTP:", err);
    throw err;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("vaiTro");
};

const getToken = () => localStorage.getItem("token");

const getRole = () => localStorage.getItem("vaiTro");

const isLoggedIn = () => !!getToken();

export default {
  register,
  login,
  forgotPassword,
  resetPasswordWithOTP,
  logout,
  getToken,
  getRole,
  isLoggedIn,
};
