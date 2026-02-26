import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { getProjects, getTeams, getMilestones } from '../api/api.js';
import StatCard from '../components/StatCard.jsx';
import TimelineGantt from '../components/TimelineGantt.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function buildRiskBuckets(projects) {
  let healthy = 0;
  let monitor = 0;
  let atRisk = 0;

  for (const project of projects) {
    if (project.status === 'completed') {
      healthy += 1;
    } else if (project.status === 'in_progress') {
      monitor += 1;
    } else if (project.status === 'on_hold') {
      atRisk += 1;
    } else {
      monitor += 1;
    }
  }

  const total = healthy + monitor + atRisk || 1;

  const buckets = [
    { name: 'Healthy systems', value: healthy, color: '#22c55e' },
    { name: 'Monitor closely', value: monitor, color: '#facc15' },
    { name: 'At risk', value: atRisk, color: '#f97316' },
  ];

  return buckets.map((bucket) => ({
    ...bucket,
    percent: Math.round((bucket.value / total) * 100),
  }));
}

export default function Dashboard({ reloadKey = 0 }) {
  const [stats, setStats] = useState({
    projects: 0,
    teams: 0,
    milestones: 0,
  });

  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadDashboardData(signal) {
    setLoading(true);
    setErrorMessage('');

    try {
      const [projectList, teamList, milestoneList] = await Promise.all([
        getProjects(),
        getTeams(),
        getMilestones(),
      ]);

      if (signal?.aborted) return;

      setStats({
        projects: projectList.length,
        teams: teamList.length,
        milestones: milestoneList.length,
      });

      setProjects(projectList);
      setMilestones(milestoneList);
    } catch (error) {
      setErrorMessage('Failed to load dashboard data.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  // Initial load
  useEffect(() => {
    const controller = new AbortController();
    loadDashboardData(controller.signal);
    return () => controller.abort();
  }, []);

  // Reload when quick add in header fires
  useEffect(() => {
    if (!reloadKey) return;
    const controller = new AbortController();
    loadDashboardData(controller.signal);
    return () => controller.abort();
  }, [reloadKey]);

  // ---------- Derived data: Maintenance risk & Gantt tasks ----------

  const riskBuckets = useMemo(() => buildRiskBuckets(projects), [projects]);

  const ganttTasks = useMemo(() => {
    const chooseColorForStatus = (status) => {
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

        // Safety: swap if dates are reversed
        if (end.isBefore(start)) {
          [start, end] = [end, start];
        }

        return {
          id: String(project.id ?? `${project.name}-${start.valueOf()}`),
          name: project.name || 'Project',
          start: start.toDate(),
          end: end.toDate(),
          color: chooseColorForStatus(project.status),
        };
      });
  }, [projects]);

  return (
    <div style={{ minWidth: 0 }}>
      <h1 className="page-title">Smart EV Project Tracking Dashboard</h1>

      <p className="page-subtitle">
        Welcome to your centralized workspace for managing Smart EV product
        development. Here you can quickly see how many projects, teams, and
        milestones are in the system, plus a quick view of project risk and the
        overall delivery timeline.
      </p>

      {/* Summary cards */}
      <div className="dashboard-stat-grid" style={{ minWidth: 0 }}>
        <StatCard label="Active Projects" value={stats.projects} tone="primary" />
        <StatCard label="Teams Involved" value={stats.teams} tone="success" />
        <StatCard
          label="Upcoming Milestones"
          value={stats.milestones}
          tone="warning"
        />
      </div>

      {/* Secondary row: Timeline + Maintenance risk */}
      <section className="dashboard-secondary-grid" style={{ minWidth: 0 }}>
        {/* Timeline (compact Gantt) */}
        <div className="card dashboard-timeline-card" style={{ minWidth: 0 }}>
          <header className="dashboard-section-header">
            <h2 className="dashboard-section-title">Current Project Timeline</h2>
            <p className="dashboard-section-subtitle">
              Production Timeline Gantt view for projects with start and end dates.
            </p>
          </header>

          {ganttTasks.length > 0 ? (
            <div
              className="dashboard-timeline-wrapper"
              style={{
                minWidth: 0,
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <TimelineGantt view="Week" tasks={ganttTasks} height={40} />
            </div>
          ) : (
            <p className="dashboard-empty-message">
              No projects with dates to visualize yet. Add <em>Start Date</em> and{' '}
              <em>End Date</em> on the Projects page to see the timeline here.
            </p>
          )}
        </div>

        {/* Maintenance risk donut */}
        <div className="card dashboard-maintenance-card" style={{ minWidth: 0 }}>
          <header className="dashboard-section-header">
            <h2 className="dashboard-section-title">Maintenance Risk Snapshot</h2>
            <p className="dashboard-section-subtitle">
              How your projects are distributed across risk categories.
            </p>
          </header>

          <div className="dashboard-maintenance-layout" style={{ minWidth: 0 }}>
            <div
              className="dashboard-maintenance-chart"
              style={{
                width: '100%',
                height: 240,
                minWidth: 0,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskBuckets}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={3}
                  >
                    {riskBuckets.map((bucket) => (
                      <Cell key={bucket.name} fill={bucket.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-maintenance-legend" style={{ minWidth: 0 }}>
              <h3 className="dashboard-maintenance-legend-title">
                Distribution based on project status
              </h3>

              {riskBuckets.map((bucket) => (
                <div
                  key={bucket.name}
                  className="dashboard-maintenance-legend-row"
                  style={{ minWidth: 0 }}
                >
                  <div
                    className="dashboard-maintenance-legend-label"
                    style={{ minWidth: 0 }}
                  >
                    <span
                      className="dashboard-maintenance-legend-dot"
                      style={{ backgroundColor: bucket.color }}
                    />
                    <span className="dashboard-maintenance-legend-name">
                      {bucket.name}
                    </span>
                  </div>

                  <div className="dashboard-maintenance-legend-meta">
                    {bucket.value} project{bucket.value !== 1 ? 's' : ''} (
                    {bucket.percent}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loading && <div className="dashboard-loading-message">Refreshing…</div>}

      {errorMessage && (
        <div className="dashboard-error-message">{errorMessage}</div>
      )}
    </div>
  );
}