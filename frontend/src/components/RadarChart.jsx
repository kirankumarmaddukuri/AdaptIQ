import React from 'react';

export default function RadarChart({ scores = {}, size = 320 }) {
  const entries = Object.entries(scores);
  if (entries.length === 0) {
    return (
      <div style={{
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        Take assessment to generate competency radar.
      </div>
    );
  }

  const center = size / 2;
  const radius = (size / 2) - 45;
  const numPoints = entries.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Generate polygon points for value (0-100)
  const getCoordinates = (value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build grid rings (33% = Novice, 66% = Intermediate, 100% = Expert)
  const rings = [33, 66, 100];

  const polygonPoints = entries.map(([_, score], idx) => {
    const { x, y } = getCoordinates(Math.max(10, Math.min(100, score)), idx);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#896abd" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.08" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid Rings */}
        {rings.map((ringVal) => {
          const ringPoints = entries.map((_, idx) => {
            const { x, y } = getCoordinates(ringVal, idx);
            return `${x},${y}`;
          }).join(' ');

          return (
            <g key={ringVal}>
              <polygon
                points={ringPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray={ringVal < 100 ? "4,4" : "none"}
                strokeWidth={1}
              />
              <text
                x={center + 5}
                y={center - (ringVal / 100) * radius - 2}
                fill="rgba(255, 255, 255, 0.25)"
                fontSize="9"
                fontWeight="600"
              >
                {ringVal === 33 ? 'Novice' : ringVal === 66 ? 'Inter.' : 'Expert'}
              </text>
            </g>
          );
        })}

        {/* Spoke Lines */}
        {entries.map(([name], idx) => {
          const { x, y } = getCoordinates(100, idx);
          const angle = idx * angleStep - Math.PI / 2;
          const labelDist = radius + 24;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          // Shorten title for clean display
          const shortName = name.length > 20 ? name.split('&')[0].trim() : name;

          return (
            <g key={name}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth={1}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#cbd5e1"
                fontSize="10"
                fontWeight="600"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              >
                {shortName}
              </text>
            </g>
          );
        })}

        {/* User Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#radarFill)"
          stroke="#a855f7"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* Data points */}
        {entries.map(([_, score], idx) => {
          const { x, y } = getCoordinates(Math.max(10, Math.min(100, score)), idx);
          return (
            <g key={idx}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#ffffff"
                stroke="#896abd"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 8px #a855f7)' }}
              />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fill="#d8b4fe"
                fontSize="10"
                fontWeight="700"
              >
                {score}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
