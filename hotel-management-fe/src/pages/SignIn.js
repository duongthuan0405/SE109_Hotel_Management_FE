import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api';
import { toast } from '@/hooks/use-toast';

function SignIn({ setAuth }) {
  const [TenDangNhap, setTenDangNhap] = useState('');
  const [MatKhau, setMatKhau] = useState('');
  const [HoTen, setHoTen] = useState('');
  const [Email, setEmail] = useState('');
  const [CMND, setCMND] = useState('');
  const [SDT, setSDT] = useState('');
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setErr('');

    if (!TenDangNhap.trim() || !MatKhau.trim()) {
      setErr('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.register(
        TenDangNhap,
        MatKhau,
        'Customer',
        HoTen || TenDangNhap,
        CMND || '',
        SDT || '',
        Email || ''
      );

      toast({
        title: 'Đăng ký thành công',
        description: 'Tài khoản của bạn đã được tạo thành công',
      });

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      setErr(error.message || 'Đăng ký thất bại');
      toast({
        title: 'Lỗi',
        description: error.message || 'Đăng ký thất bại',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={TenDangNhap}
            onChange={e => setTenDangNhap(e.target.value)}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Mật khẩu:</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={MatKhau}
            onChange={e => setMatKhau(e.target.value)}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Họ và tên:</label>
          <input
            type="text"
            placeholder="Nhập họ và tên"
            value={HoTen}
            onChange={e => setHoTen(e.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Nhập email"
            value={Email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>CMND/CCCD:</label>
          <input
            type="text"
            placeholder="Nhập số CMND/CCCD"
            value={CMND}
            onChange={e => setCMND(e.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Số điện thoại:</label>
          <input
            type="tel"
            placeholder="Nhập số điện thoại"
            value={SDT}
            onChange={e => setSDT(e.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            marginBottom: '15px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      {err && <div style={{ color: 'red', marginBottom: '15px' }}>{err}</div>}
      <div>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </div>
    </div>
  );
}

export default SignIn;
