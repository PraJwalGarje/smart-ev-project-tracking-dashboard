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

  const ROLE_LABELS = {
    viewer: 'Employee',
    manager: 'Manager',
    admin: 'Admin',
  };

  const roleLabel = ROLE_LABELS[userRole] || 'Employee';

  return (
    <header className="header-bar min-w-0">
      {/* Left section */}
      <div className="header-left min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="sidebar-toggle-button"
          type="button"
        >
          <span className="text-2xl">☰</span>
        </button>

        <h1 className="header-title truncate">
          Smart EV Dashboard
        </h1>
      </div>

      {/* Right section */}
      <div className="header-actions flex flex-wrap items-center justify-end gap-2 sm:gap-3 min-w-0">
        {/* User Badge */}
        <div className="flex items-center gap-2 pr-2 border-r border-gray-200 dark:border-slate-700 min-w-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex-shrink-0">
            {userName
              .split(' ')
              .filter(Boolean)
              .map((part) => part[0]?.toUpperCase())
              .slice(0, 2)
              .join('') || 'U'}
          </div>

          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[10rem] sm:max-w-[14rem]">
              {userName}
            </span>

            <span className="text-xs text-gray-500 dark:text-gray-300 capitalize truncate">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="theme-toggle-button"
          type="button"
        >
          {isDarkMode ? (
            <span className="text-xl">☀️</span>
          ) : (
            <span className="text-xl">🌙</span>
          )}
        </button>

        {/* Refresh: icon only on mobile */}
        <button
          className="refresh-button btn-secondary"
          onClick={() => window.location.reload()}
          type="button"
          aria-label="Refresh"
        >
          <span className="sm:hidden">⟳</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Auth button */}
        {!isLoggedIn ? (
          <button
            className="btn-secondary"
            onClick={() => (window.location.href = '/login')}
            type="button"
          >
            Sign In
          </button>
        ) : (
          logout && (
            <button className="btn-secondary" onClick={logout} type="button">
              Log out
            </button>
          )
        )}
      </div>
    </header>
  );
}