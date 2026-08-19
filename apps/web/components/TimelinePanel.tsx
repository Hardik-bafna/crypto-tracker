"use client";

import React, { useState } from "react";
import { TimelineEvent, GraphNode, GraphEdge } from "@crypto-tracer/types";
import {
  Clock,
  ArrowRight,
  Zap,
  Shield,
  GitFork,
  GitMerge,
  Landmark,
  Layers,
  TrendingUp,
  Link2,
  Copy,
  Check,
  AlertTriangle,
  ArrowDownRight,
  CircleDot,
} from "lucide-react";

interface Props {
  events: TimelineEvent[];
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
}

const EVENT_CONFIG: Record<
  string,
  { icon: typeof Clock; color: string; dotColor: string; label: string }
> = {
  INITIAL_FUNDS: {
    icon: CircleDot,
    color: "text-amber-400",
    dotColor: "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.7)]",
    label: "Origin",
  },
  LARGE_TRANSFER: {
    icon: TrendingUp,
    color: "text-blue-400",
    dotColor: "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.7)]",
    label: "Large Transfer",
  },
  FAN_OUT: {
    icon: GitFork,
    color: "text-orange-400",
    dotColor: "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.7)]",
    label: "Funds Split",
  },
  FAN_IN: {
    icon: GitMerge,
    color: "text-orange-400",
    dotColor: "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.7)]",
    label: "Funds Collected",
  },
  MIXER_INTERACTION: {
    icon: Shield,
    color: "text-rose-400",
    dotColor: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]",
    label: "Mixer",
  },
  BRIDGE_INTERACTION: {
    icon: Link2,
    color: "text-cyan-400",
    dotColor: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]",
    label: "Bridge",
  },
  RAPID_ACTIVITY: {
    icon: Zap,
    color: "text-yellow-400",
    dotColor: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]",
    label: "Rapid Activity",
  },
  HIGH_HOP_LAYERING: {
    icon: Layers,
    color: "text-purple-400",
    dotColor: "bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.7)]",
    label: "Layering",
  },
  EXCHANGE_INTERACTION: {
    icon: Landmark,
    color: "text-emerald-400",
    dotColor: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]",
    label: "Exchange",
  },
  PEEL_CHAIN: {
    icon: ArrowDownRight,
    color: "text-orange-400",
    dotColor: "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.7)]",
    label: "Peel Chain",
  },
};

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-rose-950/70 text-rose-300 border-rose-800/60",
  HIGH: "bg-orange-950/70 text-orange-300 border-orange-800/60",
  MEDIUM: "bg-amber-950/70 text-amber-300 border-amber-800/60",
  LOW: "bg-gray-800 text-gray-300 border-gray-700",
};

export const TimelinePanel: React.FC<Props> = ({
  events,
  onSelectNode,
  onSelectEdge,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleEventClick = (event: TimelineEvent) => {
    // Highlight the first related node in the graph
    if (event.relatedNodeIds.length > 0 && onSelectNode) {
      onSelectNode(event.relatedNodeIds[0]);
    }
    // Also signal the edge if available
    if (event.relatedEdgeIds.length > 0 && onSelectEdge) {
      onSelectEdge(event.relatedEdgeIds[0]);
    }
  };

  const shortAddr = (addr: string): string => {
    if (!addr || addr.length <= 12) return addr || "";
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  const formatTime = (ts: Date) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts: Date) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!events || events.length === 0) {
    return (
      <div className="bg-surface/90 border border-gray-800 rounded-2xl p-8 shadow-xl text-center">
        <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-400">
          No significant events to display for this investigation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <Clock className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-gray-200">
              Investigation Timeline
            </h2>
            <p className="text-[11px] text-gray-500">
              Key events in chronological order · {events.length} events
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3">
          {[
            { color: "bg-rose-500", label: "Critical" },
            { color: "bg-orange-400", label: "High" },
            { color: "bg-amber-400", label: "Medium" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[10px] text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 space-y-4 before:absolute before:left-[13px] before:top-3 before:bottom-3 before:w-px before:bg-gradient-to-b before:from-brand-500/40 before:via-gray-700/60 before:to-gray-800/40">
        {events.map((event, index) => {
          const config = EVENT_CONFIG[event.eventType] || EVENT_CONFIG.LARGE_TRANSFER;
          const Icon = config.icon;
          const isFirst = index === 0;
          const isLast = index === events.length - 1;

          return (
            <div
              key={event.id}
              className="relative group cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-8 top-3 w-[11px] h-[11px] rounded-full border-2 border-background transition-all duration-200 group-hover:scale-150 ${config.dotColor}`}
              />

              {/* Event Card */}
              <div className="rounded-xl bg-gray-900/70 border border-gray-800/80 hover:border-gray-600/80 transition-all duration-200 hover:bg-gray-900/90 overflow-hidden">
                {/* Top bar with time and severity */}
                <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-gray-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono text-gray-500">
                      {formatTime(event.timestamp)}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY_STYLES[event.severity]}`}
                    >
                      {event.severity}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-800/80 border border-gray-700/80 ${config.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 py-3">
                  <h3 className="text-[13px] font-semibold text-gray-100 mb-1.5">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">
                    {event.description}
                  </p>

                  {/* Transfer details */}
                  {(event.sourceAddress || event.destinationAddress) && (
                    <div className="flex items-center gap-2 text-xs font-mono mb-2">
                      {event.sourceAddress && (
                        <span
                          className="px-2 py-1 rounded bg-gray-800/80 text-gray-300 border border-gray-700/80 hover:border-gray-600 transition truncate max-w-[180px]"
                          title={event.sourceAddress}
                        >
                          {event.sourceEntity || shortAddr(event.sourceAddress)}
                        </span>
                      )}
                      {event.sourceAddress && event.destinationAddress && (
                        <ArrowRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                      )}
                      {event.destinationAddress && (
                        <span
                          className="px-2 py-1 rounded bg-gray-800/80 text-gray-300 border border-gray-700/80 hover:border-gray-600 transition truncate max-w-[180px]"
                          title={event.destinationAddress}
                        >
                          {event.destinationEntity ||
                            shortAddr(event.destinationAddress)}
                        </span>
                      )}
                      {event.amount && (
                        <span className="ml-auto text-[11px] font-bold text-white bg-black/40 px-2.5 py-1 rounded border border-gray-800">
                          {event.amount} {event.asset || ""}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tx Hash */}
                  {event.txHash && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                        Tx:
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 truncate max-w-[220px]">
                        {event.txHash}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyHash(event.txHash!);
                        }}
                        className="p-0.5 rounded hover:bg-gray-700 transition"
                        title="Copy transaction hash"
                      >
                        {copiedHash === event.txHash ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-600 hover:text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-gray-800/60 flex items-center justify-between">
        <p className="text-[10px] text-gray-600">
          Click any event to highlight the related wallet in the Graph Visualizer.
        </p>
        <p className="text-[10px] text-gray-600">
          All events derived from actual investigation data.
        </p>
      </div>
    </div>
  );
};
