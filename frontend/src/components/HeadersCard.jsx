import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function HeadersCard({ headers }) {
  const [expandedHeader, setExpandedHeader] = useState(null);

  const toggleExpand = (headerName) => {
    if (expandedHeader === headerName) {
      setExpandedHeader(null);
    } else {
      setExpandedHeader(headerName);
    }
  };

  return (
    <div className="cyber-card p-6 rounded-lg relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
      
      <h3 className="text-xs font-mono text-slate-400 tracking-wider mb-5 uppercase">
        SECURITY HEADERS AUDIT
      </h3>

      <div className="flex flex-col gap-3 font-mono text-xs">
        {Object.entries(headers).map(([name, audit]) => {
          const isPresent = audit.status === "Present";
          const isExpanded = expandedHeader === name;
          
          let statusColor = "text-cyber-green border-cyber-green/20 bg-cyber-green/5";
          let StatusIcon = CheckCircle2;
          
          if (!isPresent) {
            statusColor = audit.risk === "High" 
              ? "text-cyber-red border-cyber-red/20 bg-cyber-red/5" 
              : (audit.risk === "Medium" ? "text-cyber-orange border-cyber-orange/20 bg-cyber-orange/5" : "text-cyber-blue border-cyber-blue/20 bg-cyber-blue/5");
            StatusIcon = AlertCircle;
          }

          return (
            <div 
              key={name} 
              className="border border-slate-800/80 rounded bg-slate-900/25 overflow-hidden transition-all duration-300"
            >
              {/* Header Header */}
              <div 
                onClick={() => toggleExpand(name)}
                className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-slate-800/35 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-4 h-4 shrink-0 ${isPresent ? 'text-cyber-green' : (audit.risk === 'High' ? 'text-cyber-red' : 'text-cyber-orange')}`} />
                  <span className="font-bold text-slate-200 truncate pr-2" title={name}>
                    {name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                    {isPresent ? "PRESENT" : `MISSING [${audit.risk}]`}
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                </div>
              </div>

              {/* Expandable details */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800/80 bg-black/40 text-[11px] leading-relaxed text-slate-300 flex flex-col gap-2.5">
                  <p>{audit.description}</p>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">
                      CURRENT_VALUE:
                    </span>
                    {isPresent ? (
                      <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded text-slate-200 break-all select-all font-mono leading-tight max-h-24 overflow-y-auto">
                        {audit.value}
                      </div>
                    ) : (
                      <div className="text-cyber-red font-bold uppercase">
                        NOT_DETECTED (Missing from response headers)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
