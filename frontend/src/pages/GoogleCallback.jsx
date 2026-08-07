import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');

    if (token) {
      try {
        localStorage.setItem('geovault_token', token);
        localStorage.setItem('geovault_user', JSON.stringify({ name: decodeURIComponent(name || ''), email: decodeURIComponent(email || '') }));
      } catch (e) {
        // ignore
      }
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div className="min-h-screen flex items-center justify-center">Signing you in…</div>;
}
