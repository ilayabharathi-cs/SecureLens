import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, Cpu } from "lucide-react";

export default function Navbar({ isScanning }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative w-full border-b border-cyber-cyan/25 bg-black/40 backdrop-blur-md z-10 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded border border-cyber-cyan bg-cyber-cyan/10 glow-cyan">
          <Shield className="w-5 h-5 text-cyber-cyan" />
          <div className="absolute inset-0 rounded border border-cyan-500/30 scale-110 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple">
            SECURELENS // <span className="text-slate-300">V1.0</span>
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-cyber-cyan/70 uppercase">
            Web Security Assessment Platform
          </p>
        </div>
      </div>

      {/* Cyber Status Details */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs font-mono">
        {/* Connection status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-cyber-border bg-cyber-card">
          <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-cyber-purple animate-pulse' : 'bg-cyber-green cyber-pulse-anim'}`} />
          <span className="text-[10px] text-slate-400 uppercase">Status:</span>
          <span className={isScanning ? 'text-cyber-purple' : 'text-cyber-green font-bold'}>
            {isScanning ? "SCAN_ACTIVE" : "STANDBY"}
          </span>
        </div>

        {/* Engine status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-cyber-border bg-cyber-card text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-cyber-blue" />
          <span className="text-[10px] uppercase">Engine:</span>
          <span className="text-cyber-blue font-bold">SEC_CORE_v1.0</span>
        </div>

        {/* Time log */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-cyber-border bg-cyber-card text-slate-400">
          <span className="text-[10px] uppercase">SYS_TIME:</span>
          <span className="text-cyber-cyan font-semibold">{time}</span>
        </div>
      </div>
    </header>
  );
}
