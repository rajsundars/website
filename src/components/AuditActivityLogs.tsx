"use client";

import React from "react";

interface AuditLog {
  id: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

interface AuditActivityLogsProps {
  activityLogs: AuditLog[];
}

export default function AuditActivityLogs({ activityLogs }: AuditActivityLogsProps) {
  return (
    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
      {activityLogs.length > 0 ? (
        activityLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-4 p-3 bg-luxury-black/35 border border-luxury-border/30 rounded-xl text-xs hover:border-gold-500/20 transition-all">
            <span className="p-2 rounded-lg bg-wine-950/30 border border-luxury-border/40 text-gold-500 font-bold shrink-0 text-[10px] font-mono leading-none">
              {log.action.replace(/_/g, " ")}
            </span>
            <div className="flex-1 space-y-1">
              <p className="text-zinc-300 font-medium leading-relaxed font-sans">{log.details}</p>
              <div className="flex justify-between items-center text-[9px] font-semibold text-zinc-500">
                <span>Initiated by: {log.userName}</span>
                <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-zinc-500 text-xs font-medium">
          No audit activities recorded.
        </div>
      )}
    </div>
  );
}
