import React, { useState, useEffect } from "react";
import { Search, Shield, Terminal, CheckCircle2 } from "lucide-react";

const SCAN_STEPS = [
  { id: 1, label: "VALIDATING TARGET URL", detail: "Checking syntax and extracting host domain..." },
  { id: 2, label: "PERFORMING SSL/TLS HANDSHAKE", detail: "Querying cipher suites and certificate chain..." },
  { id: 3, label: "AUDITING HTTP SECURITY HEADERS", detail: "Analyzing CSP, HSTS, X-Frame-Options..." },
  { id: 4, label: "SCANNING EXPOSED INFRASTRUCTURE PORTS", detail: "Testing sockets on 80, 443, 22, 21, 25, 53..." },
  { id: 5, label: "FINGERPRINTING SERVICE SOFTWARE & METADATA", detail: "Parsing signatures in headers and HTML..." },
  { id: 6, label: "CALCULATING RISK & GENERATING FINDINGS", detail: "Aggregating metrics in Security Score Engine..." }
];

export default function ScannerInput({ onScan, isScanning }) {
  const [urlInput, setUrlInput] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Handle step-by-step simulation when scanning
  useEffect(() => {
    if (!isScanning) {
      setCurrentStepIndex(-1);
      setTerminalLogs([]);
      return;
    }

    // Reset logs
    setTerminalLogs([`[INFO] SECURELENS DAEMON STARTED.`]);
    setCurrentStepIndex(0);
  }, [isScanning]);

  useEffect(() => {
    if (currentStepIndex === -1 || !isScanning) return;

    if (currentStepIndex < SCAN_STEPS.length) {
      const step = SCAN_STEPS[currentStepIndex];
      const timer = setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
          `[✓] ${step.label} - OK`,
          `  └─ ${step.detail}`
        ]);
        setCurrentStepIndex(prev => prev + 1);
      }, 700);

      return () => clearTimeout(timer);
    } else {
      // Completed all step logs
      const timer = setTimeout(() => {
        setTerminalLogs(prev => [...prev, `[SUCCESS] SECURITY ASSESSMENT COMPLETE.`]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, isScanning]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim() === "") return;
    onScan(urlInput.trim());
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Scanner Input Card */}
      <div className="cyber-card p-6 rounded-lg relative overflow-hidden">
        {/* Glow overlay */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-cyber-cyan" />
            </span>
            <input
              type="text"
              placeholder="Enter target IP or Domain (e.g., example.com, https://github.com)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isScanning}
              className="w-full bg-black/40 border border-cyber-cyan/25 focus:border-cyber-cyan/80 rounded px-11 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyber-cyan/35 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning || !urlInput.trim()}
            className="relative font-mono px-8 py-3 rounded border border-cyber-cyan text-black bg-cyber-cyan font-bold hover:bg-transparent hover:text-cyber-cyan hover:shadow-cyan transition-all flex items-center justify-center gap-2 disabled:bg-cyber-cyan/20 disabled:text-cyber-cyan/50 disabled:border-cyber-cyan/20 disabled:shadow-none cursor-pointer"
          >
            {isScanning ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                SCANNING...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                INITIATE SCAN
              </>
            )}
          </button>
        </form>
      </div>

      {/* Real-time Terminal Log Timeline */}
      {isScanning && (
        <div className="cyber-card p-5 rounded-lg border-cyber-purple/30 bg-black/60 relative font-mono text-xs">
          <div className="flex justify-between items-center border-b border-cyber-purple/20 pb-2 mb-3">
            <div className="flex items-center gap-2 text-cyber-purple">
              <Terminal className="w-4 h-4" />
              <span>SCANNER TIMELINE LOGGER</span>
            </div>
            <span className="text-[10px] text-cyber-purple/60 animate-pulse">SYSTEM CORE CONNECTED</span>
          </div>

          <div className="h-44 overflow-y-auto flex flex-col gap-1.5 text-slate-300 pr-2">
            {terminalLogs.map((log, index) => {
              const isInfo = log.startsWith("[INFO]");
              const isSuccess = log.startsWith("[SUCCESS]");
              const isCheck = log.startsWith("[✓]");
              
              let textColor = "text-slate-300";
              if (isInfo) textColor = "text-cyber-blue font-bold";
              else if (isSuccess) textColor = "text-cyber-cyan font-bold";
              else if (isCheck) textColor = "text-cyber-green";
              else if (log.startsWith("  └─")) textColor = "text-slate-500";

              return (
                <div key={index} className={`${textColor} whitespace-pre-wrap leading-tight`}>
                  {log}
                </div>
              );
            })}
            {currentStepIndex < SCAN_STEPS.length && currentStepIndex >= 0 && (
              <div className="text-cyber-purple animate-pulse flex items-center gap-1.5 mt-1">
                <span>{"[>]"}</span>
                <span>AUDITING: {SCAN_STEPS[currentStepIndex].label}...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
