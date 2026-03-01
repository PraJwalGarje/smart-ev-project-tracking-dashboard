import React, { useEffect, useMemo, useState } from 'react';
import { getProjects, getMilestones } from '../api/api.js';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

// Simple stat card just for this page
function StatCard({ label, value, suffix, tone = 'primary' }) {
  const toneClass =
    tone === 'success'
      ? 'text-green-600'
      : tone === 'warning'
      ? 'text-yellow-600'
      : 'text-blue-600';

  return (
    <div className="card flex flex-col justify-between">
      {/* Animate only inner content so card border/ring never clips */}
      <div className="stat-card-inner animate-pop-twice">
        <div className="text-sm text-gray-500">{label}</div>

        <div className={`mt-2 text-3xl font-bold tracking-tight ${toneClass}`}>
          {value}
          {suffix && <span className="text-lg ml-1 align-middle">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

// Map project status to a numeric health score
function statusToHealth(status) {
  switch (status) {
    case 'completed':
      return 100;
    case 'in_progress':
      return 80;
    case 'on_hold':
      return 40;
    default:
      return 60;
  }
}

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const [p, m] = await Promise.all([getProjects(), getMilestones()]);
        setProjects(p);
        setMilestones(m);
      } catch (e) {
        setErr('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const trackedProjects = projects.length;
  const totalMilestones = milestones.length;

  const avgHealth = useMemo(() => {
    if (!projects.length) return 75;
    const scores = projects.map((p) => statusToHealth(p.status));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg);
  }, [projects]);

  // -------- Project Health Trend (Derived from avgHealth) ----------
  const healthTrendData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov'];
    const amplitude = 6; // +/- 6%

    return months.map((month, i) => {
      const phase = (i / (months.length - 1)) * Math.PI; // 0..π
      const offset = Math.sin(phase) * amplitude - amplitude / 2;
      const value = Math.max(40, Math.min(100, avgHealth + offset));
      return {
        month,
        health: Math.round(value),
      };
    });
  }, [avgHealth]);

  // -------- Charging Activity (simulated) ----------
  const chargingData = [
    { day: 'Mon', sessions: 14 },
    { day: 'Tue', sessions: 16 },
    { day: 'Wed', sessions: 18 },
    { day: 'Thu', sessions: 20 },
    { day: 'Fri', sessions: 22 },
    { day: 'Sat', sessions: 26 },
    { day: 'Sun', sessions: 19 },
  ];

  // -------- Maintenance Risk donut (Derived from project status) -----------
  const riskBuckets = useMemo(() => {
    let healthy = 0;
    let monitor = 0;
    let risk = 0;

    for (const p of projects) {
      if (p.status === 'completed') healthy += 1;
      else if (p.status === 'in_progress') monitor += 1;
      else if (p.status === 'on_hold') risk += 1;
      else monitor += 1;
    }

    const total = healthy + monitor + risk || 1;
    return [
      { name: 'Healthy systems', value: healthy, color: '#22c55e' },
      { name: 'Monitor closely', value: monitor, color: '#facc15' },
      { name: 'At risk', value: risk, color: '#f97316' },
    ].map((d) => ({
      ...d,
      percent: Math.round((d.value / total) * 100),
    }));
  }, [projects]);

  const tooltipContentStyle = {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    boxShadow: '0 10px 15px -3px rgba(15,23,42,0.25)',
    color: '#111827',
  };

  const tooltipLabelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: '#111827',
    marginBottom: 4,
  };

  return (
    <>
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">
        Visual insights into Smart EV project health, charging activity, and maintenance risk.
      </p>

      {err && <div className="analytics-error-message">{err}</div>}

      {/* Top stats */}
      <div className="analytics-summary-grid">
        <StatCard label="Tracked Projects" value={trackedProjects} />
        <StatCard label="Total Milestones" value={totalMilestones} />
        <StatCard
          label="Avg. Project Health"
          value={avgHealth}
          suffix="%"
          tone="success"
        />
      </div>

      {/* Charts */}
      <div className="analytics-chart-grid">
        {/* Project Health Trend */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Project Health Trend</h3>
          <p className="analytics-chart-subtitle">
            Average health score based on active project status.
          </p>

          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrendData} margin={{ top: 10, left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  unit="%"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                  domain={[40, 100]}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Avg. health']}
                  labelFormatter={(label) => label}
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                />
                <Line
                  type="monotone"
                  dataKey="health"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1, fill: '#3b82f6' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charging Activity */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">Charging Activity</h3>
          <p className="analytics-chart-subtitle">
            Number of simulated charging sessions per day.
          </p>

          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chargingData} margin={{ top: 10, left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip
                  formatter={(value) => [value, 'Sessions']}
                  labelFormatter={(label) => label}
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                />
                <Bar dataKey="sessions" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Maintenance Risk */}
      <div className="analytics-risk-card">
        <div className="analytics-risk-layout">
          <div className="flex flex-col items-center">
            <h3 className="analytics-chart-title">Maintenance Risk</h3>
            <p className="analytics-chart-subtitle">
              How your projects are distributed across risk categories.
            </p>

            <PieChart width={260} height={260}>
              <Pie
                data={riskBuckets}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
              >
                {riskBuckets.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>

          <div className="analytics-risk-legend">
            <h4 className="analytics-risk-legend-heading">
              Distribution based on project status
            </h4>
            {riskBuckets.map((bucket) => (
              <div key={bucket.name} className="analytics-risk-legend-row">
                <div className="analytics-risk-legend-label">
                  <span
                    className="analytics-risk-legend-color-dot"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span className="analytics-risk-legend-text">{bucket.name}</span>
                </div>
                <div className="analytics-risk-legend-meta">
                  {bucket.value} project{bucket.value !== 1 ? 's' : ''} ({bucket.percent}
                  %)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="analytics-loading-message">Loading analytics…</div>}
    </>
  );
}