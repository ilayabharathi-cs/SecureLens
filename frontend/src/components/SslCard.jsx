import React from "react";
import { Lock, Unlock, ShieldAlert, Calendar, Server } from "lucide-react";

export default function SslCard({ ssl }) {
  const isValid = ssl.valid;
  const daysLeft = ssl.days_left;

  let statusColor = "text-cyber-green";
  let borderColor = "border-cyber-green/20";
  let bgGradient = "from-cyber-green/5";
  let statusText = "SECURE / CERTIFICATE VALID";
  let Icon = Lock;

  if (!isValid) {
    statusColor = "text-cyber-purple";
    borderColor = "border-cyber-purple/35";
    bgGradient = "from-cyber-purple/10";
    statusText = "CRITICAL / UNTRUSTED OR EXPIRED";
    Icon = Unlock;
  } else if (daysLeft < 30) {
    statusColor = "text-cyber-orange";
    borderColor = "border-cyber-orange/30";
    bgGradient = "from-cyber-orange/5";
    statusText = "WARNING / EXPIRING SOON";
    Icon = Lock;
  }

  return (
    <div className={`cyber-card p-6 rounded-lg relative overflow-hidden bg-gradient-to-br ${bgGradient} to-transparent border ${borderColor} h-full`}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-mono text-slate-400 tracking-wider uppercase">
          SSL/TLS CERTIFICATE STATUS
        </h3>
        <Icon className={`w-5 h-5 ${statusColor}`} />
      </div>

      <div className="flex flex-col gap-4">
        {/* Main Status */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono font-bold tracking-wide ${statusColor}`}>
            {statusText}
          </span>
        </div>

        {/* Certificate metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4 text-xs font-mono">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase">SUBJECT (DOMAIN):</span>
            <span className="text-slate-200 truncate" title={ssl.subject}>
              {ssl.subject || "Unknown"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase">ISSUER:</span>
            <span className="text-slate-200 truncate" title={ssl.issuer}>
              {ssl.issuer || "Unknown"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase">PROTOCOL_VERSION:</span>
            <span className="text-cyber-cyan flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              {ssl.tls_version || "Unknown"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase">VALIDITY_REMAINING:</span>
            <span className={`${daysLeft < 30 ? 'text-cyber-orange font-bold' : 'text-slate-200'} flex items-center gap-1.5`}>
              <Calendar className="w-3.5 h-3.5" />
              {daysLeft > 0 ? `${daysLeft} days` : ssl.valid ? "0 days (Expires today)" : "Expired / N/A"}
            </span>
          </div>
        </div>

        {ssl.error && (
          <div className="border border-cyber-red/25 bg-cyber-red/5 p-3 rounded text-[11px] font-mono text-slate-300 leading-relaxed mt-2 flex gap-2">
            <ShieldAlert className="w-4 h-4 text-cyber-red shrink-0" />
            <span>
              <span className="text-cyber-red font-bold">SSL_ERROR:</span> {ssl.error}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
