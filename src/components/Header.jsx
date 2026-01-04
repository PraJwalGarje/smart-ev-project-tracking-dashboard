import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header({
  onToggleSidebar,
  onNewProject,
  theme,
  onToggleTheme,
}) {
  const isDarkMode = theme === 'dark';

  const { user, logout } = useAuth() || {};
  const isLoggedIn = Boolean(user);

  const userName = user?.name || 'Guest';
  const userRole = user?.role || 'viewer';

  // 🔹 Map internal role → friendly label
  const ROLE_LABELS = {
    viewer: 'Employee',
    manager: 'Manager',
    admin: 'Admin',
  };

  const roleLabel = ROLE_LABELS[userRole] || 'Employee';

  const canManageProjects =
    userRole === 'manager' || userRole === 'admin';

  return (
    <header className="header-bar sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-gray-100 dark:border-slate-700 px-6 py-3 flex items-center justify-between">

      {/* Left section */}
      <div className="header-left flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="sidebar-toggle-button lg:hidden text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <span className="text-2xl">☰</span>
        </button>

        <h1 className="header-title text-gray-900 dark:text-gray-100 font-semibold text-xl tracking-tight">
          Smart EV Dashboard
        </h1>
      </div>

      {/* Right section */}
      <div className="header-actions flex items-center gap-3">

        {/* User Badge */}
        <div className="flex items-center gap-2 pr-2 border-r border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
            {userName
              .split(' ')
              .filter(Boolean)
              .map(part => part[0]?.toUpperCase())
              .slice(0, 2)
              .join('') || 'U'}
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {userName}
            </span>

            <span className="text-xs text-gray-500 dark:text-gray-300 capitalize">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="theme-toggle-button btn-secondary flex items-center justify-center w-10 h-10"
        >
          {isDarkMode ? <span className="text-xl">☀️</span> : <span className="text-xl">🌙</span>}
        </button>

        {/* Refresh */}
        <button className="refresh-button btn-secondary" onClick={() => window.location.reload()}>
          Refresh
        </button>

        {/* New Project (only when logged in + manager/admin) */}
        {isLoggedIn && canManageProjects && (
          <button className="new-project-button btn" onClick={onNewProject}>
            New Project
          </button>
        )}

        {/* 🔹 Auth button */}
        {!isLoggedIn ? (
          <button
            className="btn-secondary"
            onClick={() => (window.location.href = '/login')}
          >
            Sign In
          </button>
        ) : (
          logout && (
            <button className="btn-secondary" onClick={logout}>
              Log out
            </button>
          )
        )}
      </div>
    </header>
  );
}
