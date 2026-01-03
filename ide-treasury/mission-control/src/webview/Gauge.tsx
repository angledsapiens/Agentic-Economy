import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  isLoading?: boolean;
}

export const Gauge: React.FC<GaugeProps> = ({ value, max, isLoading = false }) => {
  // Clamp percentage between 0 and 1
  const percentage = Math.min(Math.max(value / max, 0), 1);

  // SVG Geometry
  const radius = 40;
  const cx = 50;
  const cy = 50;
  const strokeWidth = 10;

  // Calculate arc length for dasharray (semi-circle = PI * r)
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength * (1 - percentage);

  // Color logic
  let color = '#4caf50'; // Green
  if (value < 1.0) color = '#ffeb3b'; // Yellow
  if (value < 0.2) color = '#f44336'; // Red

  // Loading State Overrides
  const displayValue = isLoading ? "..." : `${value.toFixed(2)} USDC`;
  const displayColor = isLoading ? 'var(--vscode-descriptionForeground)' : color;
  const displayOffset = isLoading ? arcLength : dashOffset; // Empty arc when loading

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <svg viewBox="0 0 100 60" style={{ width: '100%', height: 'auto' }}>
        {/* Background Track (Grey) */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="var(--vscode-widget-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value Arc (Colored) */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={displayColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${arcLength}`}
          strokeDashoffset={displayOffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out', opacity: isLoading ? 0.3 : 1 }}
        >
          {isLoading && (
            <animate
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Text Value */}
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fontSize={isLoading ? "14" : "14"}
          fontWeight="bold"
          fill="var(--vscode-foreground)"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {displayValue}
        </text>

        {isLoading && (
          <text x="50" y="58" textAnchor="middle" fontSize="6" fill="var(--vscode-descriptionForeground)">
            SCANNING LEDGER...
          </text>
        )}
      </svg>
    </div>
  );
};
