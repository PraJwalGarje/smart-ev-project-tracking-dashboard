import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Projects from '../pages/Projects.jsx';
import Reports from '../pages/Reports.jsx';
import Teams from '../pages/Teams.jsx';
import Analytics from '../pages/Analytics.jsx';
import Login from '../pages/Login.jsx';
import { addProject } from '../api/api.js';

// Auth context + route guard
import { AuthProvider } from '../context/AuthContext.jsx';
import RequireAuth from './RequireAuth.jsx';

// Page transition wrapper
import PageTransition from './PageTransition.jsx';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Theme: 'light' | 'dark'
  const [theme, setTheme] = useState('light');

  const location = useLocation();

  // Auto-close drawer on desktop resize
  useEffect(() => {
    const desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleResize = () => setMobileOpen(false);

    desktopMediaQuery.addEventListener?.('change', handleResize);
    return () => desktopMediaQuery.removeEventListener?.('change', handleResize);
  }, []);

  // Close mobile drawer on route change 
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // On mount: read theme from localStorage or system preference
  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDark ? 'dark' : 'light';
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
      }
    } catch {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Apply theme + persist whenever it changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  function handleToggleTheme() {
    setTheme((previousTheme) => (previousTheme === 'dark' ? 'light' : 'dark'));
  }

  // Header action: quick add
  async function handleNewProject() {
    const name = prompt('Project name? (e.g., Smart Navigation UI)');
    if (!name) return;

    const teams = ['Powertrain', 'Software', 'UI/UX', 'ADAS', 'Telematics'];
    const randomTeam = teams[Math.floor(Math.random() * teams.length)];

    const savingToastId = toast.loading('Adding project…');
    try {
      await addProject({
        name: name.trim(),
        team: randomTeam,
        status: 'in_progress',
      });
      toast.success('Project added', { id: savingToastId });
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('Failed to add project', { id: savingToastId });
    }
  }

  return (
    <AuthProvider>
      <div className="app-shell">
        {/* Global toaster */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2500,
            style: { fontSize: '0.9rem' },
          }}
        />

        {/* Mobile drawer + desktop sidebar */}
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Main column */}
        <div className="app-main-column">
          <Header
            onToggleSidebar={() => setMobileOpen((isOpen) => !isOpen)}
            onNewProject={handleNewProject}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />

          <main className="app-main-content">
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                {/* Public route */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <Dashboard reloadKey={reloadKey} />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/projects"
                  element={
                    <RequireAuth allowedRoles={['manager', 'admin']}>
                      <Projects />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <RequireAuth>
                      <Reports />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/teams"
                  element={
                    <RequireAuth allowedRoles={['manager', 'admin']}>
                      <Teams />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/analytics"
                  element={
                    <RequireAuth>
                      <Analytics />
                    </RequireAuth>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}