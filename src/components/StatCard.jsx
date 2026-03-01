import React, { useEffect, useRef, useState } from "react";

export default function StatCard({ label, value, tone = "primary" }) {
  const [bump, setBump] = useState(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setBump(true);
    const t = setTimeout(() => setBump(false), 250);
    return () => clearTimeout(t);
  }, [value]);

  const toneClass =
    tone === "success"
      ? "text-green-600"
      : tone === "warning"
      ? "text-yellow-600"
      : "text-blue-600";

  return (
    <div className="stat-card">
      {/* Animate only the inner content */}
      <div
        className={`transform transition-transform duration-300 ease-out will-change-transform
        ${bump ? "scale-[1.03]" : "scale-100"}`}
      >
        <div className="stat-card-label">{label}</div>
        <div className={`stat-card-value transition-colors duration-300 ${toneClass}`}>
          {value}
        </div>
      </div>
    </div>
  );
}