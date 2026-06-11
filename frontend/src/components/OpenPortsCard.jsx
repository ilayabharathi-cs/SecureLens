import React from "react";
import { Radio, ShieldAlert } from "lucide-react";

export default function OpenPortsCard({ ports }) {
  return (
    <div className="cyber-card p-6 rounded-lg relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
      
      <h3 className="text-xs font-mono text-slate-400 tracking-wider mb-5 uppercase">
        PORT SCANNER (SAFE AUDIT)
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ports.map((p, idx) => {
          const isOpen = p.status === "Open";
          const isWebPort = p.port === 80 || p.port === 443;
          const isWarning = isOpen && !isWebPort;

          let badgeBg = "bg-slate-950/40 border-slate-800 text-slate-500";
          let dotColor = "bg-slate-700";

          if (isOpen) {
            if (isWarning) {
              badgeBg = "bg-cyber-red/10 border-cyber-red/35 text-cyber-red glow-red";
              dotColor = "bg-cyber-red animate-ping";
            } else {
              badgeBg = "bg-cyber-green/10 border-cyber-green/35 text-cyber-green glow-green";
              dotColor = "bg-cyber-green";
            }
          }

          return (
            <div
              key={idx}
              className={`border rounded p-3 flex flex-col gap-1.5 transition-all ${badgeBg}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-slate-200">
                  PORT {p.port}
                </span>
                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
              </div>
              <div className="flex justify-between items-end mt-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {p.service}
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wide uppercase">
                  {p.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Warning banner if any unusual port is open */}
      {ports.some(p => p.status === "Open" && p.port !== 80 && p.port !== 443) && (
        <div className="mt-4 flex gap-2 items-start border border-cyber-red/30 bg-cyber-red/5 p-3 rounded text-[11px] font-mono leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
          <span className="text-slate-300">
            <span className="text-cyber-red font-bold">WARNING:</span> Non-standard web ports were detected open. Secure SSH (22), FTP (21) or database ports behind firewalls to prevent scanning.
          </span>
        </div>
      )}
    </div>
  );
}
