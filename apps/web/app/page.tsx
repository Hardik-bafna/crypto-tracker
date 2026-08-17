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
  Sparkles,
} from "lucide-react";

type TabType = "graph" | "risk" | "evidence" | "timeline" | "clusters";

export default function Home() {
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [demoCases, setDemoCases] = useState<SyntheticDemoCase[]>(SYNTHETIC_DEMO_CASES);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSearch = async (params: {
    target: string;
    chain: string;
    maxHops: number;
    direction: "forward" | "backward" | "both";
  }) => {
    setIsLoading(true);
    setSelectedNode(null);
    setSelectedEdge(null);
    try {
      const inv = await createInvestigation({
        target: params.target,
        chain: params.chain,
        maxHops: params.maxHops,
        direction: params.direction,
        title: `Investigation: ${params.target.slice(0, 8)}... (${params.chain.toUpperCase()})`,
      });
      setInvestigation(inv);
      setActiveTab("graph");
    } catch (err) {
      console.error(err);
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
          />
        </div>

        {/* Tab Navigation & Statistics */}
        <div className="h-12 border-b border-gray-800 bg-surface/40 px-6 flex items-center justify-between shrink-0">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            {[
              { id: "graph" as TabType, label: "Graph Visualizer", icon: GitFork },
              { id: "risk" as TabType, label: "Risk & Factors", icon: Activity },
              { id: "evidence" as TabType, label: "Evidence Ledger", icon: ShieldAlert, count: investigation?.evidence?.length },
              { id: "timeline" as TabType, label: "Transaction Timeline", icon: Clock, count: investigation?.graph?.edges.length },
              { id: "clusters" as TabType, label: "Wallet Clusters", icon: Layers, count: investigation?.clusters?.length },
            ].map((tab) => {
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
                <span className="text-gray-200 font-bold">{investigation.stats?.totalVolume ?? "0"} {investigation.chain === "bitcoin" ? "BTC" : "ETH"}</span>
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
              <RiskMeter risk={investigation.risk} />
            </div>
          )}

          {activeTab === "evidence" && investigation?.evidence && (
            <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
              <EvidencePanel evidenceList={investigation.evidence} />
            </div>
          )}

          {activeTab === "timeline" && investigation?.graph?.edges && (
            <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
              <TimelinePanel edges={investigation.graph.edges} />
            </div>
          )}

          {activeTab === "clusters" && investigation?.clusters && (
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
