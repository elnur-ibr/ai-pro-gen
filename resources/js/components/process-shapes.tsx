import React from 'react';

interface ShapeProps {
  id: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  function?: string;
}

export const StartShape: React.FC<ShapeProps> = ({ 
  id, 
  text, 
  x, 
  y, 
  width = 120, 
  height = 60,
  function: functionName 
}) => (
  <g id={id}>
    <ellipse
      cx={x + width / 2}
      cy={y + height / 2}
      rx={width / 2}
      ry={height / 2}
      fill="white"
      stroke="#333"
      strokeWidth="2"
    />
    <text
      x={x + width / 2}
      y={y + height / 2 - 5}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      fontWeight="500"
    >
      {text}
    </text>
    {functionName && (
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="#666"
      >
        ({functionName})
      </text>
    )}
  </g>
);

export const ProcessShape: React.FC<ShapeProps> = ({ 
  id, 
  text, 
  x, 
  y, 
  width = 120, 
  height = 60,
  function: functionName 
}) => (
  <g id={id}>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="white"
      stroke="#333"
      strokeWidth="2"
      rx="4"
    />
    <text
      x={x + width / 2}
      y={y + height / 2 - 5}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      fontWeight="500"
    >
      {text}
    </text>
    {functionName && (
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="#666"
      >
        ({functionName})
      </text>
    )}
  </g>
);

export const DecisionShape: React.FC<ShapeProps> = ({ 
  id, 
  text, 
  x, 
  y, 
  width = 120, 
  height = 80,
  function: functionName 
}) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  return (
    <g id={id}>
      <polygon
        points={`${centerX},${y} ${x + width},${centerY} ${centerX},${y + height} ${x},${centerY}`}
        fill="white"
        stroke="#333"
        strokeWidth="2"
      />
      <text
        x={centerX}
        y={centerY - 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="500"
      >
        {text}
      </text>
      {functionName && (
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#666"
        >
          ({functionName})
        </text>
      )}
    </g>
  );
};

export const EndShape: React.FC<ShapeProps> = ({ 
  id, 
  text, 
  x, 
  y, 
  width = 120, 
  height = 60,
  function: functionName 
}) => (
  <g id={id}>
    <ellipse
      cx={x + width / 2}
      cy={y + height / 2}
      rx={width / 2}
      ry={height / 2}
      fill="white"
      stroke="#333"
      strokeWidth="3"
    />
    <ellipse
      cx={x + width / 2}
      cy={y + height / 2}
      rx={width / 2 - 5}
      ry={height / 2 - 5}
      fill="none"
      stroke="#333"
      strokeWidth="2"
    />
    <text
      x={x + width / 2}
      y={y + height / 2 - 5}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      fontWeight="500"
    >
      {text}
    </text>
    {functionName && (
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="#666"
      >
        ({functionName})
      </text>
    )}
  </g>
);

interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
}

export const Arrow: React.FC<ArrowProps> = ({ x1, y1, x2, y2, label }) => {
  const arrowHeadSize = 8;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  const arrowX = x2 - arrowHeadSize * Math.cos(angle);
  const arrowY = y2 - arrowHeadSize * Math.sin(angle);
  
  const arrowHead1X = arrowX - arrowHeadSize * Math.cos(angle - Math.PI / 6);
  const arrowHead1Y = arrowY - arrowHeadSize * Math.sin(angle - Math.PI / 6);
  
  const arrowHead2X = arrowX - arrowHeadSize * Math.cos(angle + Math.PI / 6);
  const arrowHead2Y = arrowY - arrowHeadSize * Math.sin(angle + Math.PI / 6);
  
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={arrowX}
        y2={arrowY}
        stroke="#333"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      <polygon
        points={`${x2},${y2} ${arrowHead1X},${arrowHead1Y} ${arrowHead2X},${arrowHead2Y}`}
        fill="#333"
      />
      {label && (
        <g>
          <rect
            x={midX - 15}
            y={midY - 8}
            width={30}
            height={16}
            fill="white"
            stroke="#333"
            strokeWidth="1"
            rx="2"
          />
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="500"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};