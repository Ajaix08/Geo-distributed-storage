import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const link = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive ? 'text-ink bg-accent' : 'text-slate-300 hover:text-white hover:bg-panel2'
    }`;

  return (
    <nav className="border-b border-line bg-panel/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="font-display font-semibold text-lg tracking-tight">GeoVault</span>
        </div>
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
          <NavLink to="/upload" className={link}>Upload</NavLink>
          <NavLink to="/files" className={link}>My Files</NavLink>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">{user?.name}</span>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-sm px-3 py-1.5 rounded-md border border-line text-slate-300 hover:border-accent hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
