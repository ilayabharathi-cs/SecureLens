import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function FindingsChart({ findings }) {
  // Severity order and default counts
  const severityMap = {
    Critical: { count: 0, color: "#a855f7" }, // Purple
    High: { count: 0, color: "#ef4444" },     // Red
    Medium: { count: 0, color: "#f59e0b" },   // Orange
    Low: { count: 0, color: "#3b82f6" }       // Blue
  };

  // Populate counts
  findings.forEach(f => {
    const sev = f.severity;
    if (severityMap[sev]) {
      severityMap[sev].count += 1;
    }
  });

  const data = Object.keys(severityMap).map(key => ({
    name: key.toUpperCase(),
    count: severityMap[key].count,
    color: severityMap[key].color
  }));

  const totalFindings = findings.length;

  return (
    <div className="cyber-card p-6 rounded-lg flex flex-col h-full min-h-[300px]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-mono text-slate-400 tracking-wider uppercase">
          FINDINGS BY SEVERITY
        </h3>
        <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20 px-2 py-0.5 rounded">
          TOTAL: {totalFindings}
        </span>
      </div>

      <div className="flex-1 w-full min-h-[180px]">
        {totalFindings > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                stroke="#475569" 
                fontSize={9} 
                fontFamily="Space Mono" 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={9} 
                fontFamily="Space Mono"
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  backgroundColor: "#0d111d",
                  borderColor: "rgba(6, 182, 212, 0.3)",
                  borderRadius: "4px",
                  color: "#f8fafc",
                  fontFamily: "Space Mono",
                  fontSize: "11px"
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-2">🛡️</span>
            <p className="text-xs font-mono text-slate-500">NO VULNERABILITIES DETECTED</p>
            <p className="text-[10px] text-cyber-cyan/60 mt-1">ALL AUDITS PASSING</p>
          </div>
        )}
      </div>
    </div>
  );
}
