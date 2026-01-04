import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ROLE_OPTIONS = [
  { value: 'viewer',  label: 'Employee (read only)' },
  { value: 'manager', label: 'Manager (edit projects)' },
  { value: 'admin',   label: 'Admin (full control)' },
];

// Label to show when a user is already signed in
const ROLE_DISPLAY_LABEL = {
  viewer: 'Employee',
  manager: 'Manager',
  admin: 'Admin',
};

export default function Login() {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('viewer');

  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = displayName.trim() || 'Smart EV User';

    login({ name: trimmed, role });
    navigate(from, { replace: true });
  }

  // If already signed in, display a pop-up notice 
  if (user) {
    const roleLabel =
      ROLE_DISPLAY_LABEL[user.role] || ROLE_DISPLAY_LABEL.viewer;

    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            You are already signed in
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Signed in as <span className="font-medium">{user.name}</span>{' '}
            (<span className="uppercase text-xs tracking-wide">
              {roleLabel}
            </span>
            ).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="btn flex-1 justify-center"
              onClick={() => navigate('/', { replace: true })}
            >
              Continue to Dashboard
            </button>

            {/* 🔹 Now actually logs out so the form appears */}
            <button
              className="btn-secondary flex-1 justify-center"
              onClick={logout}
            >
              Not You?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal login form
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Sign in to Smart EV Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Choose a display name and role to continue. Roles will be used to
          control access to management actions in later iterations.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
              Display Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-300
                         bg-white text-slate-900"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="e.g., Project Lead"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
              Role
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-300
                         bg-white text-slate-900"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn w-full justify-center">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
