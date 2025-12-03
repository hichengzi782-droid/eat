import React, { useMemo } from 'react';
import { WheelItem } from '../types';

interface WheelProps {
  items: WheelItem[];
  rotation: number;
  isSpinning: boolean;
  onSpinEnd: () => void;
}

const Wheel: React.FC<WheelProps> = ({ items, rotation, isSpinning, onSpinEnd }) => {
  const radius = 100;
  // circumference = 2 * Math.PI * radius;

  // Helper to calculate coordinates for SVG paths
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
  };

  const slices = useMemo(() => {
    let cumulativePercent = 0;
    const count = items.length;
    const percentPerSlice = 1 / count;

    return items.map((item, index) => {
      const startPercent = cumulativePercent;
      const endPercent = cumulativePercent + percentPerSlice;
      
      const [startX, startY] = getCoordinatesForPercent(startPercent);
      const [endX, endY] = getCoordinatesForPercent(endPercent);

      // Determine if the slice is more than 50% of the circle (large arc flag)
      const largeArcFlag = percentPerSlice > 0.5 ? 1 : 0;

      // Create the path data
      const pathData = `M 0 0 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

      // Calculate text position (midpoint angle)
      const textAngle = startPercent + percentPerSlice / 2;
      const textRadius = radius * 0.65; // Position text 65% out from center
      const textX = Math.cos(2 * Math.PI * textAngle) * textRadius;
      const textY = Math.sin(2 * Math.PI * textAngle) * textRadius;
      
      // Calculate rotation for text to be readable
      const rotationDeg = (textAngle * 360); 

      cumulativePercent += percentPerSlice;

      return {
        ...item,
        pathData,
        textX,
        textY,
        rotationDeg
      };
    });
  }, [items, radius]);

  return (
    <div className="relative w-full max-w-[350px] aspect-square mx-auto my-4">
      {/* The Pointer/Ticker */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-5 z-20 w-10 h-12 filter drop-shadow-md">
        <svg viewBox="0 0 30 40">
          <path d="M 15 40 L 0 0 L 30 0 Z" fill="#FF6B6B" stroke="#fff" strokeWidth="3" strokeLinejoin="round"/>
          <circle cx="15" cy="5" r="2" fill="white" />
        </svg>
      </div>

      {/* The Wheel Container */}
      <div 
        className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white bg-white relative"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
        }}
        onTransitionEnd={onSpinEnd}
      >
        <svg 
          viewBox="-100 -100 200 200" 
          className="w-full h-full transform -rotate-90" // Rotate -90 so 0 start is at top (12 o'clock)
        >
          {slices.map((slice) => (
            <g key={slice.id}>
              <path d={slice.pathData} fill={slice.color} stroke="white" strokeWidth="2" />
              <text
                x={slice.textX}
                y={slice.textY}
                fill="white"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${slice.rotationDeg}, ${slice.textX}, ${slice.textY})`}
                style={{
                  fontFamily: '"Nunito", "Microsoft YaHei", "PingFang SC", sans-serif',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                {slice.text.length > 8 ? slice.text.substring(0, 7) + '..' : slice.text}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Center Cap */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center z-10 border-[5px] border-brand-yellow">
        <span className="text-brand-dark text-xs font-black">START</span>
      </div>
    </div>
  );
};

export default Wheel;