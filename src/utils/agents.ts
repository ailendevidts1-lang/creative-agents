export type AgentStatus = "draft" | "published" | "archived";
export type AgentVisibility = "private" | "public";
export type TriggerType = "manual" | "schedule" | "webhook";
export type PriceType = "free" | "one_time" | "subscription";

export type AgentModel = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  avatarUrl: string;
  status: AgentStatus;
  visibility: AgentVisibility;
  templateId?: string;
  systemPrompt: string;
  instructions: string; // can be JSON string or long text
  tools: string[];
  integrations: Record<string, any>;
  triggerType: TriggerType;
  scheduleCron?: string;
  marketplaceListingId: string | null;
  priceType: PriceType;
  priceAmount: number; // minor currency units
  createdAt: string;
  updatedAt: string;
};

export type RunStatus = "queued" | "running" | "succeeded" | "failed";

export type RunModel = {
  id: string;
  agentId: string;
  userId: string;
  input: any;
  output: any;
  status: RunStatus;
  durationMs: number;
  cost?: number;
  createdAt: string;
  type?: "test" | "standard";
};

const AGENTS_KEY = "agents";
const RUNS_KEY = "runs";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function getAgents(ownerId: string): AgentModel[] {
  const all = read<AgentModel[]>(AGENTS_KEY, []);
  return all.filter(a => !a.ownerId || a.ownerId === ownerId);
}

export function getAgentById(id: string): AgentModel | undefined {
  const all = read<AgentModel[]>(AGENTS_KEY, []);
  return all.find(a => a.id === id);
}

export function saveAgent(agent: AgentModel) {
  const all = read<AgentModel[]>(AGENTS_KEY, []);
  const idx = all.findIndex(a => a.id === agent.id);
  if (idx >= 0) all[idx] = agent; else all.unshift(agent);
  write(AGENTS_KEY, all);
}

export function deleteAgentById(id: string) {
  const all = read<AgentModel[]>(AGENTS_KEY, []);
  write(AGENTS_KEY, all.filter(a => a.id !== id));
}

export function saveRun(run: RunModel) {
  const all = read<RunModel[]>(RUNS_KEY, []);
  all.unshift(run);
  write(RUNS_KEY, all);
}

export function getRuns(agentId?: string): RunModel[] {
  const all = read<RunModel[]>(RUNS_KEY, []);
  return agentId ? all.filter(r => r.agentId === agentId) : all;
}
