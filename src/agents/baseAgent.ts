import { AgentResponse } from './types';

export abstract class BaseAgent {
  protected agentId: string;
  protected agentName: string;

  constructor(agentId: string, agentName: string) {
    this.agentId = agentId;
    this.agentName = agentName;
  }

  abstract process(input: any): Promise<AgentResponse>;

  protected createResponse(status: AgentResponse['status'], output?: any, error?: string): AgentResponse {
    return {
      agentId: this.agentId,
      agentName: this.agentName,
      status,
      output,
      error,
      logs: []
    };
  }

  protected log(message: string, response: AgentResponse): void {
    if (!response.logs) response.logs = [];
    response.logs.push(`[${new Date().toISOString()}] ${message}`);
    console.log(`[${this.agentName}] ${message}`);
  }
}