import React, { useMemo } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

function toDayjs(value) {
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

export default function TimelineGantt({
  tasks = [],
  view = "Week",
  height = 36,
}) {
  const VIEW = (view || "Week").toLowerCase();

  // Normalize tasks safely (prevents NaN% bars + handles missing/invalid end dates)
  const normalizedTasks = useMemo(() => {
    return (tasks || [])
      .map((task) => {
        const start = toDayjs(task.start)?.startOf("day") ?? null;

        // If end missing, treat as 1-day task
        const rawEnd = toDayjs(task.end) ?? start;
        const end = rawEnd ? rawEnd.endOf("day") : null;

        if (!start || !end) return null;

        // Ensure end >= start
        const safeEnd = end.isBefore(start) ? start.endOf("day") : end;

        return {
          ...task,
          _start: start,
          _end: safeEnd,
        };
      })
      .filter(Boolean);
  }, [tasks]);

  // Build timeline range using Math.min / Math.max (plugin-free)
  const { min, max } = useMemo(() => {
    if (!normalizedTasks.length) {
      const today = dayjs().startOf("day");
      return {
        min: today,
        max: today.add(14, "day").endOf("day"),
      };
    }

    const minTime = Math.min(...normalizedTasks.map((t) => +t._start));
    const maxTime = Math.max(...normalizedTasks.map((t) => +t._end));

    return {
      min: dayjs(minTime).subtract(2, "day").startOf("day"),
      max: dayjs(maxTime).add(2, "day").endOf("day"),
    };
  }, [normalizedTasks]);

  const totalMs = useMemo(
    () => Math.max(1, max.diff(min, "millisecond")),
    [min, max]
  );

  // Build header ticks (UNIQUE keys guaranteed)
  const ticks = useMemo(() => {
    const tickList = [];

    if (VIEW === "day") {
      let current = min.startOf("day");
      while (current.isBefore(max)) {
        tickList.push({
          key: `day-${current.valueOf()}`,
          label: current.format("DD MMM"),
          date: current,
        });
        current = current.add(1, "day");
      }
    } else if (VIEW === "week") {
      let current = min.startOf("isoWeek");
      while (current.isBefore(max)) {
        tickList.push({
          key: `week-${current.valueOf()}`, // <-- fixes duplicate key issue
          label: `W${current.isoWeek()} ${current.format("DD MMM")}`,
          date: current,
        });
        current = current.add(1, "week");
      }
    } else if (VIEW === "month") {
      let current = min.startOf("month");
      while (current.isBefore(max)) {
        tickList.push({
          key: `month-${current.valueOf()}`,
          label: current.format("MMM YYYY"),
          date: current,
        });
        current = current.add(1, "month");
      }
    } else {
      // Year
      let current = min.startOf("year");
      while (current.isBefore(max)) {
        tickList.push({
          key: `year-${current.valueOf()}`,
          label: current.format("YYYY"),
          date: current,
        });
        current = current.add(1, "year");
      }
    }

    return tickList;
  }, [min, max, VIEW]);

  // Convert date -> 0..100% position in range
  const percentageFromRange = (d) => {
    const clamped = Math.min(Math.max(0, d.diff(min, "millisecond")), totalMs);
    return (100 * clamped) / totalMs;
  };

  // Responsive name column
  const columnTemplate = "minmax(140px, 220px) 1fr";

  // Timeline width scales with ticks, supports horizontal scroll
  const pxPerTick =
    VIEW === "day" ? 64 : VIEW === "week" ? 90 : VIEW === "month" ? 120 : 140;

  const timelineWidth = Math.max(520, ticks.length * pxPerTick);

  return (
    <div className="w-full rounded-md border border-gray-100 overflow-hidden min-w-0">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div
          className="grid min-w-0"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div className="px-3 py-2 text-sm text-slate-800">Name</div>

          {/* Scrollable timeline header */}
          <div className="relative min-w-0 overflow-x-auto">
            <div
              className="flex text-xs text-slate-800"
              style={{ width: timelineWidth, minWidth: timelineWidth }}
            >
              {ticks.map((tick) => (
                <div
                  key={tick.key}
                  className="px-2 py-2 border-l border-gray-200 first:border-l-0 whitespace-nowrap"
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
      <div className="relative min-w-0">
        {normalizedTasks.map((task, index) => {
          const leftPercent = percentageFromRange(task._start);
          const endPercent = percentageFromRange(task._end);

          // width based on (end - start), ensures stable rendering
          const widthPercent = Math.max(endPercent - leftPercent, 0.3);

          return (
            <div
              key={task.id ?? `${task.name}-${index}`}
              className={`grid items-center ${
                index ? "border-t" : ""
              } border-gray-100 min-w-0`}
              style={{ gridTemplateColumns: columnTemplate, height }}
            >
              <div className="px-3 text-sm text-gray-800 truncate min-w-0">
                {task.name}
              </div>

              {/* Scrollable timeline body cell */}
              <div className="relative min-w-0 overflow-x-auto">
                <div
                  className="relative"
                  style={{
                    width: timelineWidth,
                    minWidth: timelineWidth,
                    height: "100%",
                  }}
                >
                  {/* Grid overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="flex h-full">
                      {ticks.map((tick) => (
                        <div
                          key={tick.key}
                          style={{ flex: 1 }}
                          className="border-l border-gray-100 first:border-l-0"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Task bar */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3 rounded-md shadow-sm ring-1 ring-black/5"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: task.color || "#c7d2fe",
                    }}
                    title={`${task._start.format("DD MMM YYYY")} → ${task._end.format(
                      "DD MMM YYYY"
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