import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ItemList from './pages/ItemList';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { AuthProvider } from './store';

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? children : <Navigate to="/signin" />;
}

function App() {
  // Optional: trigger re-render on login/logout
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handler = () => setAuth(!!localStorage.getItem('token'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <h1>Items from MongoDB</h1>
        <Routes>
          <Route path="/signin" element={<SignIn setAuth={setAuth} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ItemList />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
