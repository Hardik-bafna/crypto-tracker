"use client";

import React, { useState, useEffect } from "react";
import {
  Investigation,
  GraphNode,
  GraphEdge,
} from "@crypto-tracer/types";
import { SyntheticDemoCase, SYNTHETIC_DEMO_CASES } from "@crypto-tracer/blockchain";
import { createInvestigation, fetchDemoCases } from "../lib/api";
import { InvestigationHeader } from "../components/InvestigationHeader";
import { Omnibar } from "../components/Omnibar";
import { GraphCanvas } from "../components/GraphCanvas";
import { InspectorDrawer } from "../components/InspectorDrawer";
import { RiskMeter } from "../components/RiskMeter";
import { EvidencePanel } from "../components/EvidencePanel";
import { AlternativeExplanationsPanel } from "../components/AlternativeExplanationsPanel";
import { TimelinePanel } from "../components/TimelinePanel";
import { ClustersPanel } from "../components/ClustersPanel";
import { AICopilotDrawer } from "../components/AICopilotDrawer";
import { ReportModal } from "../components/ReportModal";
import {
  GitFork,
  Activity,
  ShieldAlert,
  Clock,
  Layers,
  Search,
  Scale,
} from "lucide-react";

type TabType = "graph" | "risk" | "evidence" | "alt-explanations" | "timeline" | "clusters";

export default function Home() {
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [demoCases, setDemoCases] = useState<SyntheticDemoCase[]>(SYNTHETIC_DEMO_CASES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("graph");

  // Selection states
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  // Modals & Drawers
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Initial load with preset demo case
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      try {
        const cases = await fetchDemoCases();
        if (cases && cases.length > 0) setDemoCases(cases);

        const initial = await createInvestigation({
          target: "0x98174f85e49f87f4c9c1b3f9429188d3f6a2b001",
          chain: "ethereum",
          maxHops: 6,
          direction: "forward",
          mode: "demo",
          title: "Operation Silk Trail (Narcotics Pipeline)",
          caseNumber: "CASE-SILK-001",
          investigatorName: "HIDTA Narcotics Task Force",
        });
        setInvestigation(initial);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Compute visible tabs (hide tabs that have 0 items)
  const visibleTabs = [
    { id: "graph" as TabType, label: "Graph Visualizer", icon: GitFork, alwaysShow: true },
    { id: "risk" as TabType, label: "Risk & Factors", icon: Activity, alwaysShow: true },
    { id: "evidence" as TabType, label: "Evidence Ledger", icon: ShieldAlert, count: investigation?.evidence?.length },
    { id: "alt-explanations" as TabType, label: "Alt. Explanations", icon: Scale, count: investigation?.alternativeExplanations?.length },
    { id: "timeline" as TabType, label: "Investigation Timeline", icon: Clock, count: investigation?.timeline?.length },
    { id: "clusters" as TabType, label: "Wallet Clusters", icon: Layers, count: investigation?.clusters?.length },
  ].filter((tab) => tab.alwaysShow || (tab.count !== undefined && tab.count > 0));

  // Fallback to "graph" tab if currently selected tab is hidden
  useEffect(() => {
    if (investigation) {
      const isCurrentTabVisible = visibleTabs.some((t) => t.id === activeTab);
      if (!isCurrentTabVisible) {
        setActiveTab("graph");
      }
    }
  }, [investigation, activeTab, visibleTabs]);

  const handleSearch = async (params: {
    target: string;
    chain: string;
    maxHops: number;
    direction: "forward" | "backward" | "both";
    mode: "live" | "demo";
  }) => {
    setIsLoading(true);
    setError(null);
    setInvestigation(null); // Clear old investigation
    setSelectedNode(null);
    setSelectedEdge(null);
    try {
      const inv = await createInvestigation({
        target: params.target,
        chain: params.chain,
        maxHops: params.maxHops,
        direction: params.direction,
        mode: params.mode,
        title: `Investigation: ${params.target.slice(0, 8)}... (${params.chain.toUpperCase()})`,
      });
      setInvestigation(inv);
      setActiveTab("graph");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to trace target address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b0f19]">
      {/* Top Header */}
      <InvestigationHeader
        investigation={investigation}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onReset={handleReset}
        isLoading={isLoading}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Omnibar Controls Bar */}
        <div className="border-b border-gray-800/80 bg-surface/60 backdrop-blur-md shrink-0">
          <Omnibar
            demoCases={demoCases}
            onSearch={handleSearch}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Tab Navigation & Statistics */}
        <div className="h-12 border-b border-gray-800 bg-surface/40 px-6 flex items-center justify-between shrink-0">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-gray-800 text-white border border-gray-700 shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-400" : ""}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-gray-400 border border-gray-800">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Metrics */}
          {investigation && (
            <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-400 font-mono">
              <div>
                <span className="text-gray-500">NODES: </span>
                <span className="text-gray-200 font-bold">{investigation.stats?.totalNodes ?? 0}</span>
              </div>
              <div>
                <span className="text-gray-500">EDGES: </span>
                <span className="text-gray-200 font-bold">{investigation.stats?.totalEdges ?? 0}</span>
              </div>
              <div>
                <span className="text-gray-500">VOLUME: </span>
                <span className="text-gray-200 font-bold">
                  {investigation.stats?.totalVolume ?? "0"} {investigation.chain === "bitcoin" ? "BTC" : "ETH"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 flex relative min-h-0 overflow-hidden">
          {isLoading && !investigation && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <span>Initializing forensic transaction graph...</span>
              </div>
            </div>
          )}

          {!isLoading && !investigation && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-6 text-center">
              <div className="flex flex-col items-center gap-4 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-2">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <p>No active investigation.</p>
                <p className="text-xs text-gray-600">
                  Enter a valid wallet address or select a demo scenario above to begin forensic tracing.
                </p>
              </div>
            </div>
          )}

          {activeTab === "graph" && investigation?.graph && (
            <div className="flex-1 flex w-full h-full relative">
              <GraphCanvas
                graphData={investigation.graph}
                onSelectNode={(node) => {
                  setSelectedNode(node);
                  setSelectedEdge(null);
                }}
                onSelectEdge={(edge) => {
                  setSelectedEdge(edge);
                  setSelectedNode(null);
                }}
                selectedNodeId={selectedNode?.address}
              />
              <InspectorDrawer
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                investigation={investigation}
                onClose={() => {
                  setSelectedNode(null);
                  setSelectedEdge(null);
                }}
              />
            </div>
          )}

          {activeTab === "risk" && investigation?.risk && (
            <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
              <RiskMeter risk={investigation.risk} investigation={investigation} />
            </div>
          )}

          {activeTab === "evidence" && investigation?.evidence && investigation.evidence.length > 0 && (
            <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
              <EvidencePanel evidenceList={investigation.evidence} />
            </div>
          )}

          {activeTab === "alt-explanations" &&
            investigation?.alternativeExplanations &&
            investigation.alternativeExplanations.length > 0 && (
              <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
                <AlternativeExplanationsPanel
                  alternativeExplanations={investigation.alternativeExplanations}
                />
              </div>
            )}

          {activeTab === "timeline" && investigation?.timeline && investigation.timeline.length > 0 && (
            <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
              <TimelinePanel
                events={investigation.timeline}
                onSelectNode={(nodeId) => {
                  const node = investigation.graph?.nodes.find(
                    (n) => n.address.toLowerCase() === nodeId.toLowerCase()
                  );
                  if (node) {
                    setSelectedNode(node);
                    setSelectedEdge(null);
                    setActiveTab("graph");
                  }
                }}
                onSelectEdge={(edgeId) => {
                  const edge = investigation.graph?.edges.find((e) => e.id === edgeId);
                  if (edge) {
                    setSelectedEdge(edge);
                    setSelectedNode(null);
                    setActiveTab("graph");
                  }
                }}
              />
            </div>
          )}

          {activeTab === "clusters" && investigation?.clusters && investigation.clusters.length > 0 && (
            <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
              <ClustersPanel clusters={investigation.clusters} />
            </div>
          )}
        </div>
      </div>

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        investigation={investigation}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Subpoena & Legal Dossier Report Modal */}
      <ReportModal
        investigation={investigation}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
