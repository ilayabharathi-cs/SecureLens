import React from "react";
import { Download, FileJson, Target, ShieldCheck, AlertTriangle } from "lucide-react";
import ScoreCircle from "./ScoreCircle";
import FindingsChart from "./FindingsChart";
import OpenPortsCard from "./OpenPortsCard";
import SslCard from "./SslCard";
import HeadersCard from "./HeadersCard";
import TechStackCard from "./TechStackCard";
import Recommendations from "./Recommendations";

export default function Dashboard({ scanData, onDownloadPdf, onExportJson }) {
  if (!scanData) return null;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in z-10 relative">
      {/* Top Banner / Toolbar */}
      <div className="cyber-card p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Scanned Target Info */}
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-cyber-cyan animate-pulse" />
          <div className="font-mono text-xs">
            <span className="text-slate-400">TARGET: </span>
            <span className="text-white font-bold break-all">{scanData.url}</span>
            <div className="text-[10px] text-slate-500 mt-0.5">
              SCAN_COMPLETED: {scanData.scan_date}
            </div>
          </div>
        </div>

        {/* Export options */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs w-full sm:w-auto">
          <button
            onClick={onExportJson}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-cyber-blue text-cyber-blue bg-cyber-blue/5 hover:bg-cyber-blue hover:text-black px-4 py-2 rounded transition-all cursor-pointer font-semibold shadow-none"
          >
            <FileJson className="w-4 h-4" />
            EXPORT JSON
          </button>
          
          <button
            onClick={onDownloadPdf}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-cyber-cyan text-black bg-cyber-cyan hover:bg-transparent hover:text-cyber-cyan hover:shadow-cyan px-4 py-2 rounded transition-all cursor-pointer font-bold"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Row 1 - Score & Severity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreCircle score={scanData.score} riskLevel={scanData.risk_level} />
        <FindingsChart findings={scanData.findings} />
      </div>

      {/* Row 2: SSL & Open Ports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SslCard ssl={scanData.ssl} />
        <OpenPortsCard ports={scanData.ports} />
      </div>

      {/* Row 3: Headers Audit & Tech Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeadersCard headers={scanData.headers} />
        <TechStackCard technologies={scanData.technologies} />
      </div>

      {/* Row 4: Recommendations */}
      <Recommendations findings={scanData.findings} />
    </div>
  );
}
