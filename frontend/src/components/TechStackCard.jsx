import React from "react";
import { Server, Cpu, Globe, Database } from "lucide-react";

export default function TechStackCard({ technologies }) {
  return (
    <div className="cyber-card p-6 rounded-lg relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
      
      <h3 className="text-xs font-mono text-slate-400 tracking-wider mb-5 uppercase">
        TECHNOLOGY FINGERPRINTING
      </h3>

      {technologies.length > 0 ? (
        <div className="flex flex-col gap-3 font-mono text-xs">
          {technologies.map((tech, idx) => {
            let catIcon = <Globe className="w-4 h-4 text-cyber-blue" />;
            if (tech.category === "Web Server") {
              catIcon = <Server className="w-4 h-4 text-cyber-cyan" />;
            } else if (tech.category === "CDN / WAF") {
              catIcon = <Cpu className="w-4 h-4 text-cyber-purple" />;
            } else if (tech.category === "Programming Language") {
              catIcon = <Database className="w-4 h-4 text-cyber-orange" />;
            }

            return (
              <div 
                key={idx}
                className="flex justify-between items-center border border-slate-800 bg-slate-900/15 rounded p-3"
              >
                <div className="flex items-center gap-2.5">
                  {catIcon}
                  <div>
                    <span className="font-bold text-slate-200 block">{tech.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{tech.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20 px-2 py-0.5 rounded">
                    CONFIDENCE: {tech.confidence}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-44 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-2">🕵️</span>
          <p className="text-xs font-mono text-slate-500">NO EXPOSED TECH HEADERS DETECTED</p>
          <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
            Target has hidden powered-by headers or runs custom static pages.
          </p>
        </div>
      )}
    </div>
  );
}
