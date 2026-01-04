import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function SidebarContent({ onNav }) {
  const { user } = useAuth() || {};
  const userRole = user?.role || 'employee'; // default to lowest role

  const baseClasses = 'block rounded-md px-3 py-2 transition-colors';

  const inactiveClasses =
    'text-gray-700 hover:bg-blue-50 hover:text-blue-700 ' +
    'dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-300';

  const activeClasses =
    'bg-blue-50 text-blue-700 font-medium ' +
    'dark:bg-blue-900/40 dark:text-blue-200';

  function userCanAccess(requiredRoles) {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole);
  }

  function renderNavItem(label, to, { end = false, requiredRoles = [] } = {}) {
    const isAllowed = userCanAccess(requiredRoles);
    if (!isAllowed) return null; // 🔹 hide item completely

    return (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
        onClick={() => {
          if (onNav) onNav();
        }}
      >
        {label}
      </NavLink>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Menu
      </h2>

      {user && (
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-300">
          Signed in as <span className="font-medium">{user.name}</span>{' '}
          (<span className="capitalize">{userRole}</span>)
        </p>
      )}

      <nav className="flex flex-col gap-1.5">
        {renderNavItem('Dashboard', '/', { end: true })}

        {/* Manager / Admin only */}
        {renderNavItem('Projects', '/projects', {
          requiredRoles: ['manager', 'admin'],
        })}

        {/* Everyone can view Reports and Analytics */}
        {renderNavItem('Reports', '/reports')}
        {renderNavItem('Analytics', '/analytics')}

        {/* Manager / Admin only */}
        {renderNavItem('Teams', '/teams', {
          requiredRoles: ['manager', 'admin'],
        })}
      </nav>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={[
          'lg:hidden',
          'fixed inset-y-0 left-0 z-40 w-72',
          'bg-white dark:bg-[#0F1629]',
          'border-r border-gray-100 dark:border-gray-800',
          'shadow-lg dark:shadow-black/40',
          'transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent onNav={onClose} />
      </aside>

      {/* Backdrop */}
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={[
          'hidden lg:flex lg:flex-col',
          'lg:sticky lg:top-0 lg:h-screen',
          'lg:w-72 flex-shrink-0',
          'bg-white dark:bg-[#0F1629]',
          'border-r border-gray-100 dark:border-gray-800',
          'shadow-sm dark:shadow-black/40',
        ].join(' ')}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
