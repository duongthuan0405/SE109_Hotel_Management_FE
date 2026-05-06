import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Đăng ký thất bại');
      setSuccess(true);
      setTimeout(() => navigate('/signin'), 1000);
    } catch (error) {
      setErr('Đăng ký thất bại');
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Đăng ký</button>
      </form>
      {err && <div style={{ color: 'red' }}>{err}</div>}
      {success && <div style={{ color: 'green' }}>Đăng ký thành công!</div>}
      <div>
        Đã có tài khoản? <Link to="/signin">Đăng nhập</Link>
      </div>
    </div>
  );
}

export default SignUp;
