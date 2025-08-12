export type AgentField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "email";
  placeholder?: string;
  required?: boolean;
};

export type AgentUI = {
  fields: AgentField[];
};

export type LlmTask = {
  id: string;
  type: "llm";
  promptTemplate: string; // can use {{fieldId}} placeholders
  system?: string;
  model?: string; // default gpt-4o-mini
};

export type HttpTask = {
  id: string;
  type: "http";
  url: string; // may contain templates
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  bodyTemplate?: string; // stringified body template
};

export type AgentTask = LlmTask | HttpTask;

export type AgentRuntimePlan = {
  plan: AgentTask[];
};

export type AgentDefinition = {
  id: string;
  name: string;
  description?: string;
  personality?: string;
  ui?: AgentUI;
  runtime?: AgentRuntimePlan;
};
