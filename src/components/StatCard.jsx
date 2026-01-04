// src/components/StatCard.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function StatCard({ label, value, tone = 'primary' }) {
  const [bump, setBump] = useState(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    // Skip animation on the very first render
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    // Trigger a quick "bump" animation when value changes after mount
    setBump(true);
    const t = setTimeout(() => setBump(false), 250);
    return () => clearTimeout(t);
  }, [value]);

  const toneClass =
    tone === 'success'
      ? 'text-green-600'
      : tone === 'warning'
      ? 'text-yellow-600'
      : 'text-blue-600';

  return (
    <div
      className={`stat-card transform transition-all duration-300 ease-out
                  ${bump ? 'scale-105 shadow-md' : 'scale-100'}`}
    >
      <div className="stat-card-label">{label}</div>
      <div className={`stat-card-value transition-colors duration-300 ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}
