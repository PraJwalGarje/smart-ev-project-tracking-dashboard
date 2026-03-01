<div className="gantt-container">
  <div className="gantt-header">
    <div className="gantt-header-row">
      <div className="gantt-name-header">Name</div>

      <div
        ref={headerScrollRef}
        onScroll={onHeaderScroll}
        className="gantt-scroll"
      >
        <div className="gantt-ticks" style={{ width: timelineWidth }}>
          {ticks.map((tick) => (
            <div key={tick.key} className="gantt-tick">
              {tick.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  <div className="gantt-body">
    <div className="gantt-name-column">
      {normalizedTasks.map((task, index) => (
        <div
          key={task.id ?? `${task.name}-${index}`}
          className="gantt-name-cell"
          style={{ height }}
        >
          {task.name}
        </div>
      ))}
    </div>

    <div
      ref={bodyScrollRef}
      onScroll={onBodyScroll}
      className="gantt-scroll"
    >
      <div className="gantt-canvas" style={{ width: timelineWidth }}>
        {normalizedTasks.map((task, index) => {
          const leftPercent = percentageFromRange(task._start);
          const endPercent = percentageFromRange(task._end);
          const widthPercent = Math.max(endPercent - leftPercent, 0.3);

          return (
            <div
              key={task.id ?? `${task.name}-${index}`}
              className="gantt-row"
              style={{ height }}
            >
              <div className="gantt-grid">
                {ticks.map((tick) => (
                  <div key={tick.key} className="gantt-grid-column" />
                ))}
              </div>

              <div
                className="gantt-bar"
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: task.color || "#c7d2fe",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  </div>
</div>