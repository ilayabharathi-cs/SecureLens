import React from "react";

export default function ScoreCircle({ score, riskLevel }) {
  // Determine color theme based on score
  let strokeColor = "#10b981"; // green
  let glowClass = "shadow-green";
  let textColor = "text-cyber-green";

  if (score < 40) {
    strokeColor = "#a855f7"; // purple / critical risk
    glowClass = "shadow-purpleGlow";
    textColor = "text-cyber-purple";
  } else if (score < 70) {
    strokeColor = "#ef4444"; // red
    glowClass = "shadow-red";
    textColor = "text-cyber-red";
  } else if (score < 90) {
    strokeColor = "#f59e0b"; // orange/yellow
    glowClass = "shadow-cyan";
    textColor = "text-cyber-orange";
  } else {
    strokeColor = "#06b6d4"; // cyan
    glowClass = "shadow-cyanGlow";
    textColor = "text-cyber-cyan";
  }

  // SVG ring calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="cyber-card p-6 rounded-lg flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[300px]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
      
      <h3 className="text-xs font-mono text-slate-400 tracking-wider mb-6 uppercase">
        SECURITY RISK INDEX
      </h3>

      {/* SVG Ring Container */}
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Glow behind */}
        <div 
          className={`absolute w-36 h-36 rounded-full blur-xl opacity-20 pointer-events-none transition-all duration-500`}
          style={{ backgroundColor: strokeColor }}
        />

        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Glowing foreground circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Central Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-5xl font-mono font-bold tracking-tighter ${textColor} transition-all duration-500`}>
            {score}
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
            OUT_OF_100
          </span>
        </div>
      </div>

      {/* Risk Badge */}
      <div className="mt-6 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full border bg-black/45" style={{ borderColor: strokeColor + "40" }}>
          <span className="text-[10px] font-mono text-slate-500 uppercase mr-1.5">
            RISK_LEVEL:
          </span>
          <span className={`text-xs font-bold font-mono uppercase tracking-wider ${textColor}`}>
            {riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}
