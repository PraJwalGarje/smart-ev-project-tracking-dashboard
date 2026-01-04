// src/pages/Projects.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  getProjects,
  getTeams,
  addProject,
  deleteProject,
  updateProject,
} from '../api/api.js';
import Modal from '../components/Modal.jsx';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_OPTS = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

function StatusBadge({ status }) {
  const map = {
    in_progress: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    on_hold: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <span
      className={`projects-status-badge ${
        map[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {STATUS_OPTS.find((s) => s.value === status)?.label || 'Unknown'}
    </span>
  );
}

export default function Projects() {
  const [rows, setRows] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Filters/sorting
  const [statusFilter, setStatusFilter] = useState('all');
  const [nameSort, setNameSort] = useState('asc');

  // Modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    team: '',
    status: 'in_progress',
    startDate: '',
    endDate: '',
  });
  const isEdit = form.id !== null;

  // Role info from auth
  const { user } = useAuth() || {};
  const userRole = user?.role || 'viewer';
  const canManageProjects =
    userRole === 'manager' || userRole === 'admin';

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const [projectResponse, teamsResponse] = await Promise.all([
        getProjects(),
        getTeams(),
      ]);
      setRows(projectResponse);
      setTeams(teamsResponse.map((team) => team.name));
    } catch (e) {
      setErr('Failed to load projects.');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    if (!canManageProjects) {
      toast('You do not have permission to create projects.', { icon: '⚠️' });
      return;
    }
    setForm({
      id: null,
      name: '',
      team: teams[0] || '',
      status: 'in_progress',
      startDate: '',
      endDate: '',
    });
    setOpen(true);
  }

  function openEdit(row) {
    if (!canManageProjects) {
      toast('You do not have permission to edit projects.', { icon: '⚠️' });
      return;
    }
    setForm({
      id: row.id,
      name: row.name,
      team: row.team,
      status: row.status,
      startDate: row.startDate || '',
      endDate: row.endDate || '',
    });
    setOpen(true);
  }

  async function onSubmit(e) {
    e?.preventDefault?.();

    if (!canManageProjects) {
      toast('You do not have permission to modify projects.', { icon: '⚠️' });
      return;
    }

    if (!form.name.trim()) {
      return toast('Please enter a project name.', { icon: '⚠️' });
    }
    if (!form.team) {
      return toast('Please select a team.', { icon: '⚠️' });
    }
    if (!form.startDate || !form.endDate) {
      return toast('Please select both start and end date.', { icon: '⚠️' });
    }

    try {
      const payload = {
        name: form.name.trim(),
        team: form.team,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      if (isEdit) {
        await updateProject(form.id, payload);
        toast.success('Project updated');
      } else {
        await addProject(payload);
        toast.success('Project added');
      }

      setOpen(false);
      await load();
    } catch {
      toast.error('Save failed');
    }
  }

  async function onDelete(id) {
    if (!canManageProjects) {
      toast('You do not have permission to delete projects.', { icon: '⚠️' });
      return;
    }

    if (!confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      await load();
    } catch {
      toast.error('Delete failed');
    }
  }

  const visibleRows = useMemo(() => {
    const filteredRows =
      statusFilter === 'all'
        ? rows
        : rows.filter((row) => row.status === statusFilter);

    const direction = nameSort === 'asc' ? 1 : -1;
    return [...filteredRows].sort(
      (a, b) => a.name.localeCompare(b.name) * direction
    );
  }, [rows, statusFilter, nameSort]);

  return (
    <>
      {/* Page heading and subtitle */}
      <div className="projects-page-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">
          Manage and track Smart EV projects from a single view.
        </p>

        {!canManageProjects && (
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            You are currently in read-only mode. Only managers and admins can create or update projects.
          </p>
        )}

        {/* Controls row */}
        <div className="projects-controls-row">
          {/* Filters */}
          <div className="projects-filters-row">
            <div className="projects-filter-control">
              <label className="projects-filter-label">Show status:</label>
              <select
                className="projects-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                {STATUS_OPTS.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="projects-filter-control">
              <label className="projects-filter-label">Sort by name:</label>
              <select
                className="projects-filter-select"
                value={nameSort}
                onChange={(e) => setNameSort(e.target.value)}
              >
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="projects-actions-row">
            <button className="btn-secondary" onClick={load}>
              Refresh
            </button>
            {canManageProjects && (
              <button className="btn" onClick={openAdd}>
                New Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects table */}
      <div className="projects-table-card card">
        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr className="projects-table-header-row">
                <th className="projects-table-header-cell">Name</th>
                <th className="projects-table-header-cell">Team</th>
                <th className="projects-table-header-cell">Status</th>
                <th className="projects-table-header-cell">Start Date</th>
                <th className="projects-table-header-cell">End Date</th>
                <th className="projects-table-header-cell projects-table-actions-column">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="projects-table-row">
                  <td className="projects-table-cell">{row.name}</td>
                  <td className="projects-table-cell">{row.team}</td>
                  <td className="projects-table-cell">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="projects-table-cell">
                    {row.startDate
                      ? new Date(row.startDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="projects-table-cell">
                    {row.endDate
                      ? new Date(row.endDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="projects-table-cell">
                    <div className="projects-actions-inline">
                      <button
                        className="btn-secondary"
                        onClick={() => openEdit(row)}
                        disabled={!canManageProjects}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        onClick={() => onDelete(row.id)}
                        disabled={!canManageProjects}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && visibleRows.length === 0 && (
                <tr>
                  <td
                    className="projects-empty-state-cell"
                    colSpan={6}
                  >
                    {statusFilter === 'all'
                      ? 'No projects yet. Click “New Project”.'
                      : `No ${
                          STATUS_OPTS.find(
                            (statusOption) =>
                              statusOption.value === statusFilter
                          )?.label || ''
                        } projects.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="projects-loading-message">Loading…</div>
        )}

        {err && (
          <div className="projects-error-message">{err}</div>
        )}
      </div>

      {/* Modal for Add / Edit */}
      <Modal
        open={open}
        title={isEdit ? 'Edit Project' : 'New Project'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={onSubmit}
              disabled={!canManageProjects}
            >
              Save
            </button>
          </>
        }
      >
        <form
          className="projects-modal-form"
          onSubmit={onSubmit}
        >
          <div className="projects-modal-field">
            <label className="projects-modal-label">
              Project Name
            </label>
            <input
              type="text"
              className="projects-modal-input"
              value={form.name}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  name: e.target.value,
                }))
              }
              placeholder="e.g., Smart Navigation UI"
            />
          </div>

          <div className="projects-modal-field">
            <label className="projects-modal-label">
              Team
            </label>
            <select
              className="projects-modal-input"
              value={form.team}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  team: e.target.value,
                }))
              }
            >
              {teams.map((teamName) => (
                <option key={teamName} value={teamName}>
                  {teamName}
                </option>
              ))}
            </select>
          </div>

          <div className="projects-modal-field">
            <label className="projects-modal-label">
              Status
            </label>
            <select
              className="projects-modal-input"
              value={form.status}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  status: e.target.value,
                }))
              }
            >
              {STATUS_OPTS.map((statusOption) => (
                <option
                  key={statusOption.value}
                  value={statusOption.value}
                >
                  {statusOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="projects-modal-field">
            <label className="projects-modal-label">
              Start Date
            </label>
            <input
              type="date"
              className="projects-modal-input"
              value={form.startDate}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  startDate: e.target.value,
                }))
              }
            />
          </div>

          <div className="projects-modal-field">
            <label className="projects-modal-label">
              End Date
            </label>
            <input
              type="date"
              className="projects-modal-input"
              value={form.endDate}
              onChange={(e) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  endDate: e.target.value,
                }))
              }
            />
          </div>

          {/* Keep submit button hidden so Enter works */}
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </>
  );
}
