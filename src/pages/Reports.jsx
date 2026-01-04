import React, { useEffect, useMemo, useState } from 'react';
import { getProjects, getMilestones } from '../api/api.js';
import StatCard from '../components/StatCard.jsx';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import TimelineGantt from '../components/TimelineGantt.jsx';

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Day | Week | Month | Year (UI value)
  const [viewKey, setViewKey] = useState('Week');

  // Always keep a safe normalized key
  const normalizedView = useMemo(() => {
    const lowerCaseView = (viewKey || '').toLowerCase();
    if (
      lowerCaseView === 'day' ||
      lowerCaseView === 'week' ||
      lowerCaseView === 'month' ||
      lowerCaseView === 'year'
    ) {
      return viewKey;
    }
    return 'Week';
  }, [viewKey]);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const [projectResponse, milestoneResponse] = await Promise.all([
        getProjects(),
        getMilestones(),
      ]);
      setProjects(projectResponse);
      setMilestones(milestoneResponse);
    } catch (e) {
      setErr('Failed to load reports.');
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statusCounts = useMemo(() => {
    const counters = { in_progress: 0, completed: 0, on_hold: 0 };
    for (const project of projects) {
      if (project.status in counters) {
        counters[project.status] += 1;
      }
    }
    return counters;
  }, [projects]);

  const upcomingMilestones = useMemo(() => {
    const parseDate = (dateValue) => (dateValue ? new Date(dateValue) : null);

    return (Array.isArray(milestones) ? milestones : [])
      .filter((milestone) => milestone.status === 'upcoming')
      .sort((a, b) => parseDate(a.dueDate) - parseDate(b.dueDate))
      .slice(0, 10);
  }, [milestones]);

  const ganttTasks = useMemo(() => {
    const colorByStatus = (status) => {
      switch (status) {
        case 'completed':
          return '#dcfce7';
        case 'on_hold':
          return '#fef9c3';
        default:
          return '#c7d2fe';
      }
    };

    return (Array.isArray(projects) ? projects : [])
      .filter((project) => project.startDate && project.endDate)
      .map((project) => {
        let start = dayjs(project.startDate);
        let end = dayjs(project.endDate);

        // Swap if dates are reversed
        if (end.isBefore(start)) {
          [start, end] = [end, start];
        }

        return {
          id: String(project.id ?? `${project.name}-${start.valueOf()}`),
          name: project.name || 'Project',
          start: start.toDate(),
          end: end.toDate(),
          color: colorByStatus(project.status),
        };
      });
  }, [projects]);

  function exportProjectsCSV() {
    if (!projects.length) {
      toast('No projects to export.', { icon: 'ℹ️' });
      return;
    }

    const headers = ['id', 'name', 'team', 'status', 'startDate', 'endDate'];
    const rows = projects.map((project) => [
      project.id,
      project.name,
      project.team,
      project.status,
      project.startDate || '',
      project.endDate || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell ?? '').replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'projects_report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Exported projects_report.csv');
  }

  return (
    <>
      {/* Page heading */}
      <div className="reports-page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">
          Overview of project status, visual timeline, and upcoming milestones.
        </p>

        <div className="reports-toolbar">
          <button className="btn-secondary" onClick={load}>
            Refresh
          </button>
          <button className="btn" onClick={exportProjectsCSV}>
            Export Projects CSV
          </button>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="stat-grid reports-status-grid">
        <StatCard
          label="In Progress"
          value={statusCounts.in_progress}
          tone="primary"
        />
        <StatCard
          label="Completed"
          value={statusCounts.completed}
          tone="success"
        />
        <StatCard
          label="On Hold"
          value={statusCounts.on_hold}
          tone="warning"
        />
      </div>

      {/* Timeline (Gantt) section */}
      <div className="reports-gantt-card card">
        <div className="reports-gantt-header">
          <h3 className="reports-gantt-title">
            Production Timeline
          </h3>
          <div className="reports-gantt-view">
            <label className="reports-gantt-view-label">
              View:
            </label>
            <select
              className="reports-gantt-view-select"
              value={normalizedView}
              onChange={(event) => setViewKey(event.target.value)}
            >
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </select>
          </div>
        </div>

        {ganttTasks.length ? (
          <div className="reports-gantt-timeline-wrapper">
            <TimelineGantt
              key={`gantt-${normalizedView}-${ganttTasks.length}`}
              view={normalizedView}
              tasks={ganttTasks}
              height={40}
            />
          </div>
        ) : (
          <div className="reports-gantt-empty-message">
            No projects with dates to visualize. Add{' '}
            <em>Start Date</em> and <em>End Date</em> in Projects.
          </div>
        )}
      </div>

      {/* Upcoming milestones table */}
      <div className="reports-milestones-card card">
        <h3 className="reports-milestones-title">
          Upcoming Milestones
        </h3>

        <div className="reports-milestones-table-wrapper">
          <table className="reports-milestones-table">
            <thead>
              <tr className="reports-milestones-header-row">
                <th className="reports-milestones-header-cell">Title</th>
                <th className="reports-milestones-header-cell">Due Date</th>
                <th className="reports-milestones-header-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingMilestones.map((milestone) => (
                <tr
                  key={milestone.id}
                  className="reports-milestones-row"
                >
                  <td className="reports-milestones-cell">
                    {milestone.title}
                  </td>
                  <td className="reports-milestones-cell">
                    {milestone.dueDate
                      ? new Date(milestone.dueDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="reports-milestones-cell">
                    <span className="reports-milestones-status-pill">
                      {milestone.status?.replace('_', ' ') || 'upcoming'}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && !upcomingMilestones.length && (
                <tr>
                  <td
                    className="reports-milestones-empty-cell"
                    colSpan={3}
                  >
                    No upcoming milestones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="reports-loading-message">
            Loading…
          </div>
        )}

        {err && (
          <div className="reports-error-message">
            {err}
          </div>
        )}
      </div>
    </>
  );
}
