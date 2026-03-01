import React, { useMemo, useRef, useCallback } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

function toDayjs(value) {
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

export default function TimelineGantt({ tasks = [], view = "Week", height = 44 }) {
  const VIEW = (view || "Week").toLowerCase();

  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);

  /* ===============================
     Class Name Groups (Humanized)
  =============================== */

  const containerClasses =
    "w-full min-w-0 overflow-hidden rounded-md border " +
    "border-slate-200 bg-white " +
    "dark:border-slate-700 dark:bg-slate-900";

  const headerClasses =
    "border-b border-slate-200 bg-slate-50 " +
    "dark:border-slate-700 dark:bg-slate-800";

  const nameHeaderClasses =
    "flex-shrink-0 border-r px-3 py-2 text-sm font-medium " +
    "border-slate-200 text-slate-900 " +
    "dark:border-slate-700 dark:text-slate-100";

  const scrollAreaClasses =
    "hide-scrollbar min-w-0 flex-1 overflow-x-auto";

  const tickLabelClasses =
    "whitespace-nowrap border-l px-2 py-2 text-xs " +
    "border-slate-200/70 text-slate-700 " +
    "dark:border-slate-700/60 dark:text-slate-200";

  const nameCellClasses =
    "flex items-center px-3 text-sm " +
    "text-slate-800 border-slate-100 hover:bg-slate-50/80 " +
    "dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800/60";

  const rowBorderClasses =
    "border-slate-100 dark:border-slate-800";

  const gridLineClasses =
    "border-l border-slate-200/60 first:border-l-0 " +
    "dark:border-slate-700/40";

  const barClasses =
    "absolute top-1/2 -translate-y-1/2 z-10 h-3 rounded-md " +
    "shadow-sm ring-1 ring-black/5 dark:ring-white/10";

  /* ===============================
     Data Preparation
  =============================== */

  const normalizedTasks = useMemo(() => {
    return (tasks || [])
      .map((task) => {
        const start = toDayjs(task.start)?.startOf("day") ?? null;
        const rawEnd = toDayjs(task.end) ?? start;
        const end = rawEnd ? rawEnd.endOf("day") : null;
        if (!start || !end) return null;
        const safeEnd = end.isBefore(start) ? start.endOf("day") : end;
        return { ...task, _start: start, _end: safeEnd };
      })
      .filter(Boolean);
  }, [tasks]);

  const { min, max } = useMemo(() => {
    if (!normalizedTasks.length) {
      const today = dayjs().startOf("day");
      return { min: today, max: today.add(14, "day").endOf("day") };
    }
    const minTime = Math.min(...normalizedTasks.map((t) => +t._start));
    const maxTime = Math.max(...normalizedTasks.map((t) => +t._end));
    return {
      min: dayjs(minTime).subtract(2, "day").startOf("day"),
      max: dayjs(maxTime).add(2, "day").endOf("day"),
    };
  }, [normalizedTasks]);

  const totalMs = Math.max(1, max.diff(min, "millisecond"));

  const ticks = useMemo(() => {
    const list = [];
    let current;

    if (VIEW === "day") current = min.startOf("day");
    else if (VIEW === "week") current = min.startOf("isoWeek");
    else if (VIEW === "month") current = min.startOf("month");
    else current = min.startOf("year");

    while (current.isBefore(max)) {
      list.push({
        key: current.valueOf(),
        label:
          VIEW === "day"
            ? current.format("DD MMM")
            : VIEW === "week"
            ? `W${current.isoWeek()} ${current.format("DD MMM")}`
            : VIEW === "month"
            ? current.format("MMM YYYY")
            : current.format("YYYY"),
        date: current,
      });

      current =
        VIEW === "day"
          ? current.add(1, "day")
          : VIEW === "week"
          ? current.add(1, "week")
          : VIEW === "month"
          ? current.add(1, "month")
          : current.add(1, "year");
    }

    return list;
  }, [min, max, VIEW]);

  const percentageFromRange = (d) => {
    const clamped = Math.min(Math.max(0, d.diff(min, "millisecond")), totalMs);
    return (100 * clamped) / totalMs;
  };

  const nameColWidth = 240;
  const pxPerTick =
    VIEW === "day" ? 64 : VIEW === "week" ? 96 : VIEW === "month" ? 140 : 180;
  const timelineWidth = Math.max(720, ticks.length * pxPerTick);

  const syncScroll = useCallback((source, target) => {
    if (!source?.current || !target?.current) return;
    target.current.scrollLeft = source.current.scrollLeft;
  }, []);

  const onHeaderScroll = () => syncScroll(headerScrollRef, bodyScrollRef);
  const onBodyScroll = () => syncScroll(bodyScrollRef, headerScrollRef);

  /* ===============================
     Render
  =============================== */

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <div className="flex min-w-0">
          <div className={nameHeaderClasses} style={{ width: nameColWidth }}>
            Name
          </div>

          <div
            ref={headerScrollRef}
            onScroll={onHeaderScroll}
            className={scrollAreaClasses}
          >
            <div style={{ width: timelineWidth, minWidth: timelineWidth }} className="flex">
              {ticks.map((tick) => (
                <div key={tick.key} className={tickLabelClasses} style={{ flex: 1 }}>
                  {tick.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-w-0">
        <div
          className="flex-shrink-0 border-r border-slate-200 dark:border-slate-700"
          style={{ width: nameColWidth }}
        >
          {normalizedTasks.map((task, index) => (
            <div
              key={task.id ?? `${task.name}-${index}`}
              className={`${nameCellClasses} ${index ? "border-t " + rowBorderClasses : ""}`}
              style={{ height }}
              title={task.name}
            >
              <span className="truncate">{task.name}</span>
            </div>
          ))}
        </div>

        <div
          ref={bodyScrollRef}
          onScroll={onBodyScroll}
          className={scrollAreaClasses}
        >
          <div style={{ width: timelineWidth, minWidth: timelineWidth }}>
            {normalizedTasks.map((task, index) => {
              const leftPercent = percentageFromRange(task._start);
              const endPercent = percentageFromRange(task._end);
              const widthPercent = Math.max(endPercent - leftPercent, 0.3);

              return (
                <div
                  key={task.id ?? `${task.name}-${index}`}
                  className={`${index ? "border-t " + rowBorderClasses : ""}`}
                  style={{ height, position: "relative" }}
                >
                  <div className="absolute inset-0 pointer-events-none flex h-full">
                    {ticks.map((tick) => (
                      <div key={tick.key} className={gridLineClasses} style={{ flex: 1 }} />
                    ))}
                  </div>

                  <div
                    className={barClasses}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: task.color || "#c7d2fe",
                      opacity: 0.95,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}