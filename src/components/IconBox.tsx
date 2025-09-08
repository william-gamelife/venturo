'use client'

import React from 'react'

interface IconBoxProps {
  children: React.ReactNode
  size?: number
}

export function IconBox({ children, size = 36 }: IconBoxProps) {
  return (
    <div className="icon-box">
      <div className="icon-content">
        {children}
      </div>
      
      <style jsx>{`
        .icon-box {
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, #c9a961, #e4d4a8);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 700;
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .icon-box::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%
          );
          opacity: 0;
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        .icon-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .icon-content :global(svg) {
          color: white;
          stroke: white;
          fill: none;
        }
        
        .icon-content :global(svg path),
        .icon-content :global(svg circle),
        .icon-content :global(svg rect),
        .icon-content :global(svg line),
        .icon-content :global(svg polyline),
        .icon-content :global(svg polygon) {
          stroke: white;
          fill: none;
        }
      `}</style>
    </div>
  )
}