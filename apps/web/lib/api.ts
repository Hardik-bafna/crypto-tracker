import {
  Investigation,
  CreateInvestigationRequest,
  InvestigationReport,
  AIQueryResponse,
} from "@crypto-tracer/types";
import { InvestigationService } from "../../../apps/api/src/services/investigation-service.js";
import { ToolDispatcher, AIInvestigator } from "@crypto-tracer/ai";
import { SYNTHETIC_DEMO_CASES } from "@crypto-tracer/blockchain";

// Singleton local investigation service for robust in-browser fallback
let localService: InvestigationService | null = null;
function getLocalService(): InvestigationService {
  if (!localService) {
    localService = new InvestigationService();
  }
  return localService;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchDemoCases() {
  try {
    const res = await fetch(`${API_BASE}/api/demo/cases`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return SYNTHETIC_DEMO_CASES;
}

export async function createInvestigation(req: CreateInvestigationRequest): Promise<Investigation> {
  try {
    const res = await fetch(`${API_BASE}/api/investigations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return getLocalService().createInvestigation(req);
}

export async function fetchInvestigation(id: string): Promise<Investigation | null> {
  try {
    const res = await fetch(`${API_BASE}/api/investigations/${id}`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return getLocalService().getInvestigation(id) || null;
}

export async function fetchInvestigationReport(id: string): Promise<InvestigationReport | null> {
  try {
    const res = await fetch(`${API_BASE}/api/investigations/${id}/report`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}
  return getLocalService().getReport(id);
}

export async function queryAI(investigationId: string, query: string): Promise<AIQueryResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/ai/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ investigationId, query }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}

  const service = getLocalService();
  const inv = service.getInvestigation(investigationId);
  const dispatcher = new ToolDispatcher(
    service.getEntityDatabase(),
    service.getPatternEngine(),
    service.getClusterEngine(),
    service.getRiskEngine()
  );
  const investigator = new AIInvestigator(dispatcher);
  return investigator.processQuery({ investigationId, query }, inv);
}
