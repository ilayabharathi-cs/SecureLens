import React, { useState } from "react";
import Navbar from "./components/Navbar";
import MatrixBackground from "./components/MatrixBackground";
import ScannerInput from "./components/ScannerInput";
import Dashboard from "./components/Dashboard";
import { ShieldAlert, Info, ArrowUpRight } from "lucide-react";

export default function App() {
  const [scanData, setScanData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async (targetUrl) => {
    setIsScanning(true);
    setError(null);
    setScanData(null);

    const startTime = Date.now();

    try {
      const response = await fetch("http://localhost:8000/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Ensure the scanner timeline runs for at least 4.5s so recruiters can appreciate the logs
      const elapsed = Date.now() - startTime;
      const minDuration = 4600; // slightly longer than timeline total steps (4.2s)
      if (elapsed < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
      }

      setScanData(data);
    } catch (err) {
      // Ensure we clean scanning state
      setError(err.message || "Failed to establish socket connection with SecureLens daemon.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!scanData) return;

    try {
      const response = await fetch("http://localhost:8000/api/scan/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scanData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF report.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `securelens_${scanData.hostname}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error exporting PDF: ${err.message}`);
    }
  };

  const handleExportJson = () => {
    if (!scanData) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `securelens_${scanData.hostname}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="relative min-h-screen grid-bg overflow-x-hidden flex flex-col pb-12">
      {/* Neo-Cyber Code Canvas background */}
      <MatrixBackground />

      {/* Main Navbar */}
      <Navbar isScanning={isScanning} />

      {/* Main Wrapper */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 mt-8 flex flex-col gap-6 z-10">
        
        {/* Scanner controller */}
        <ScannerInput onScan={handleScan} isScanning={isScanning} />

        {/* Error Alert Box */}
        {error && (
          <div className="cyber-card border-cyber-red/35 bg-cyber-red/5 p-4 rounded-lg flex gap-3 font-mono text-xs items-start animate-pulse shadow-none">
            <ShieldAlert className="w-5 h-5 text-cyber-red shrink-0" />
            <div className="flex-1">
              <span className="text-cyber-red font-bold uppercase block mb-1">
                DAEMON_SCAN_ERROR:
              </span>
              <p className="text-slate-300 leading-relaxed">{error}</p>
              <div className="mt-2 text-[10px] text-slate-500">
                Please verify that the target domain is correct, has active DNS bindings, and permits connections.
              </div>
            </div>
          </div>
        )}

        {/* Standby Banner when no scan results */}
        {!scanData && !isScanning && !error && (
          <div className="cyber-card p-8 rounded-lg flex flex-col items-center justify-center text-center gap-6 mt-4 relative overflow-hidden py-16">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/35 to-transparent" />
            
            <div className="relative flex items-center justify-center w-16 h-16 rounded border border-cyber-cyan/30 bg-cyber-cyan/5">
              <Info className="w-8 h-8 text-cyber-cyan animate-pulse" />
            </div>

            <div className="max-w-md">
              <h2 className="text-base font-mono text-white tracking-wider uppercase">
                SECURELENS TERMINAL READY
              </h2>
              <p className="text-xs text-slate-400 font-mono leading-relaxed mt-2">
                Enter a target domain above to audit its public security posture. SecureLens audits critical HTTP headers, certificates, common ports, and fingerprinted technology stacks.
              </p>
            </div>

            <div className="border border-slate-800 bg-slate-900/10 px-4 py-2.5 rounded font-mono text-[10px] text-slate-500 max-w-lg leading-normal flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-cyber-cyan shrink-0" />
              <span>
                Note: Checks are completely passive. No exploit attempts or intrusive scanning operations are executed.
              </span>
            </div>
          </div>
        )}

        {/* Scan Results Dashboard */}
        {!isScanning && scanData && (
          <Dashboard
            scanData={scanData}
            onDownloadPdf={handleDownloadPdf}
            onExportJson={handleExportJson}
          />
        )}
      </main>
    </div>
  );
}
