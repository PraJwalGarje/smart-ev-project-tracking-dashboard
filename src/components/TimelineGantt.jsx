import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

export default function TimelineGantt({ tasks = [], view = 'Week', height = 36 }) {
  const VIEW = (view || 'Week').toLowerCase();

  // Build range
  const { min, max } = useMemo(() => {
    if (!tasks.length) {
      const today = dayjs().startOf('day');
      return { min: today, max: today.add(14, 'day') };
    }
    const startBoundary = dayjs(
      Math.min(...tasks.map((task) => +dayjs(task.start).startOf('day')))
    );
    const endBoundary = dayjs(
      Math.max(...tasks.map((task) => +dayjs(task.end).endOf('day')))
    );
    return { min: startBoundary.subtract(2, 'day'), max: endBoundary.add(2, 'day') };
  }, [tasks]);

  const totalMs = useMemo(() => Math.max(1, max.diff(min, 'millisecond')), [min, max]);

  // Build header ticks
  const ticks = useMemo(() => {
    const tickList = [];

    if (VIEW === 'day') {
      let current = min.startOf('day');
      while (current.isBefore(max)) {
        tickList.push({
          key: current.format('YYYY-MM-DD'),
          label: current.format('DD MMM'),
          date: current,
        });
        current = current.add(1, 'day');
      }
    } else if (VIEW === 'week') {
      let current = min.startOf('isoWeek');
      while (current.isBefore(max)) {
        const weekNumber = current.isoWeek();
        tickList.push({
          key: current.format('GGGG-[W]WW'),
          label: `W${weekNumber} ${current.format('DD MMM')}`,
          date: current,
        });
        current = current.add(1, 'week');
      }
    } else if (VIEW === 'month') {
      let current = min.startOf('month');
      while (current.isBefore(max)) {
        tickList.push({
          key: current.format('YYYY-MM'),
          label: current.format('MMM YYYY'),
          date: current,
        });
        current = current.add(1, 'month');
      }
    } else {
      // Year view
      let current = min.startOf('year');
      while (current.isBefore(max)) {
        tickList.push({
          key: current.format('YYYY'),
          label: current.format('YYYY'),
          date: current,
        });
        current = current.add(1, 'year');
      }
    }

    return tickList;
  }, [min, max, VIEW]);

  // Helper for bar placement (relative to min/max dates)
  const percentageFromRange = (date) =>
    (100 *
      Math.min(Math.max(0, dayjs(date).diff(min, 'millisecond')), totalMs)) /
    totalMs;

  // Responsive name column
  const columnTemplate = 'minmax(140px, 220px) 1fr';

  // Timeline width: scale with ticks, but allow horizontal scroll on small screens
  const pxPerTick = VIEW === 'day' ? 64 : VIEW === 'week' ? 90 : VIEW === 'month' ? 120 : 140;
  const timelineWidth = Math.max(520, ticks.length * pxPerTick);

  return (
    <div className="timeline-container w-full rounded-md border border-gray-100 overflow-hidden min-w-0">
      {/* Header */}
      <div className="timeline-header bg-gray-50 border-b border-gray-100">
        <div className="timeline-header-grid grid min-w-0" style={{ gridTemplateColumns: columnTemplate }}>
          <div className="timeline-header-label px-3 py-2 text-sm text-slate-800">
            Name
          </div>

          {/* Scrollable timeline header */}
          <div className="timeline-header-ticks-container relative min-w-0 overflow-x-auto">
            <div
              className="timeline-header-ticks flex text-xs text-slate-800"
              style={{ width: timelineWidth, minWidth: timelineWidth }}
            >
              {ticks.map((tick) => (
                <div
                  key={tick.key}
                  className="timeline-header-tick px-2 py-2 border-l border-gray-200 first:border-l-0 whitespace-nowrap"
                  style={{ flex: 1 }}
                >
                  {tick.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="timeline-body relative min-w-0">
        {tasks.map((task, index) => {
          const leftPercent = percentageFromRange(task.start);
          const rightPercent = 100 - percentageFromRange(task.end);
          const barWidthPercent = Math.max(0, 100 - leftPercent - rightPercent);

          return (
            <div
              key={task.id}
              className={`timeline-row grid items-center ${index ? 'border-t' : ''} border-gray-100 min-w-0`}
              style={{ gridTemplateColumns: columnTemplate, height }}
            >
              <div className="timeline-row-label px-3 text-sm text-gray-800 truncate min-w-0">
                {task.name}
              </div>

              {/* Scrollable timeline body cell */}
              <div className="timeline-row-timeline relative min-w-0 overflow-x-auto">
                <div
                  className="relative"
                  style={{ width: timelineWidth, minWidth: timelineWidth, height: '100%' }}
                >
                  <div
                    className="timeline-grid-overlay absolute inset-0 pointer-events-none"
                  >
                    <div className="timeline-grid-overlay-inner flex h-full">
                      {ticks.map((tick) => (
                        <div
                          key={tick.key}
                          style={{ flex: 1 }}
                          className="timeline-grid-column border-l border-gray-100 first:border-l-0"
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="timeline-bar absolute top-1/2 -translate-y-1/2 h-3 rounded-md shadow-sm ring-1 ring-black/5"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidthPercent}%`,
                      backgroundColor: task.color || '#c7d2fe',
                      minWidth: '2px',
                    }}
                    title={`${dayjs(task.start).format('DD MMM YYYY')} → ${dayjs(task.end).format(
                      'DD MMM YYYY'
                    )}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}