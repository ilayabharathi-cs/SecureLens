import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, ShieldCheck, HelpCircle } from "lucide-react";

const FIX_CODE_TEMPLATES = {
  "Content-Security-Policy": {
    nginx: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none';\";",
    apache: "Header set Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none';\""
  },
  "Strict-Transport-Security": {
    nginx: "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;",
    apache: "Header always set Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\""
  },
  "X-Frame-Options": {
    nginx: "add_header X-Frame-Options \"SAMEORIGIN\" always;",
    apache: "Header always set X-Frame-Options \"SAMEORIGIN\""
  },
  "X-Content-Type-Options": {
    nginx: "add_header X-Content-Type-Options \"nosniff\" always;",
    apache: "Header always set X-Content-Type-Options \"nosniff\""
  },
  "Referrer-Policy": {
    nginx: "add_header Referrer-Policy \"no-referrer-when-downgrade\" always;",
    apache: "Header always set Referrer-Policy \"no-referrer-when-downgrade\""
  }
};

export default function Recommendations({ findings }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("nginx"); // 'nginx' or 'apache'
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const toggleExpand = (idx) => {
    if (expandedIndex === idx) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(idx);
    }
  };

  return (
    <div className="cyber-card p-6 rounded-lg relative overflow-hidden w-full">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xs font-mono text-slate-400 tracking-wider uppercase">
            REMEDIATION SUGGESTIONS
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            EXECUTE THESE FIXES ON YOUR SERVER CONFIG
          </p>
        </div>

        {findings.length > 0 && (
          <div className="flex border border-slate-800 rounded p-0.5 bg-black/40 text-[10px] font-mono">
            <button
              onClick={() => setActiveTab("nginx")}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${activeTab === 'nginx' ? 'bg-cyber-cyan text-black font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              NGINX
            </button>
            <button
              onClick={() => setActiveTab("apache")}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${activeTab === 'apache' ? 'bg-cyber-cyan text-black font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              APACHE
            </button>
          </div>
        )}
      </div>

      {findings.length > 0 ? (
        <div className="flex flex-col gap-4 font-mono text-xs">
          {findings.map((f, idx) => {
            const isExpanded = expandedIndex === idx;
            const isHeader = f.category === "Security Headers";
            
            // Try to resolve exact header name from title
            let headerName = null;
            if (isHeader) {
              const match = f.title.match(/Missing (.+) Header/);
              if (match) headerName = match[1];
            }
            
            const codeSnippet = headerName && FIX_CODE_TEMPLATES[headerName] 
              ? FIX_CODE_TEMPLATES[headerName][activeTab] 
              : null;

            let severityColor = "text-cyber-blue";
            let borderColor = "border-cyber-blue/20";
            if (f.severity === "Critical") {
              severityColor = "text-cyber-purple";
              borderColor = "border-cyber-purple/20";
            } else if (f.severity === "High") {
              severityColor = "text-cyber-red";
              borderColor = "border-cyber-red/20";
            } else if (f.severity === "Medium") {
              severityColor = "text-cyber-orange";
              borderColor = "border-cyber-orange/20";
            }

            return (
              <div 
                key={idx}
                className={`border bg-slate-950/20 rounded ${borderColor} overflow-hidden transition-all duration-300`}
              >
                {/* Accordion header */}
                <div 
                  onClick={() => toggleExpand(idx)}
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/15 transition-all select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-current ${severityColor}`}>
                      {f.severity.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-200 text-xs truncate max-w-[200px] sm:max-w-md">
                      {f.title}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>

                {/* Accordion content */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-900/60 bg-black/40 text-[11px] leading-relaxed text-slate-300 flex flex-col gap-3">
                    <p>{f.description}</p>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-1">REMEDIATION ACTION:</span>
                      <p className="text-slate-200">{f.recommendation}</p>
                    </div>

                    {codeSnippet && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-mono">
                          <span>{activeTab.toUpperCase()} CONFIG RULE:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(codeSnippet, idx);
                            }}
                            className="flex items-center gap-1 text-cyber-cyan hover:text-white cursor-pointer"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3" />
                                COPIED!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                COPY CODE
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-black border border-slate-800 px-3 py-2 rounded text-slate-300 select-all font-mono leading-tight break-all">
                          {codeSnippet}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-44 flex flex-col items-center justify-center text-center">
          <ShieldCheck className="w-10 h-10 text-cyber-green mb-2" />
          <p className="text-xs font-mono text-slate-500">NO VULNERABILITIES TO REMEDIATE</p>
          <p className="text-[10px] text-cyber-cyan/60 mt-1">
            Excellent! The target site follows best practices.
          </p>
        </div>
      )}
    </div>
  );
}
