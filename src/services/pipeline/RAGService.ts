import { supabase } from '@/integrations/supabase/client';
import { RAGResult, EvidenceItem, ContextEntry } from './types';

export class RAGService {
  async processQuery(query: string, context: ContextEntry[]): Promise<RAGResult> {
    try {
      // First, try to get evidence from knowledge base and web search
      const evidence = await this.gatherEvidence(query, context);
      
      // Generate summary using AI with evidence
      const summary = await this.generateSummary(query, evidence, context);
      
      const confidence = this.calculateConfidence(evidence);
      
      return {
        evidence,
        summary,
        confidence
      };
    } catch (error) {
      console.error('RAG processing error:', error);
      
      // Return fallback response
      return {
        evidence: [],
        summary: `I understand you're asking about: "${query}". Let me help you with that based on my knowledge.`,
        confidence: 0.5
      };
    }
  }

  private async gatherEvidence(query: string, context: ContextEntry[]): Promise<EvidenceItem[]> {
    const evidence: EvidenceItem[] = [];
    
    try {
      // Search existing knowledge (notes, previous conversations, etc.)
      const localEvidence = await this.searchLocalKnowledge(query);
      evidence.push(...localEvidence);
      
      // If local evidence is insufficient, search the web
      if (evidence.length < 2) {
        const webEvidence = await this.searchWeb(query);
        evidence.push(...webEvidence);
      }
      
      // Rerank evidence by relevance
      return this.rerankEvidence(query, evidence);
    } catch (error) {
      console.error('Evidence gathering error:', error);
      return evidence;
    }
  }

  private async searchLocalKnowledge(query: string): Promise<EvidenceItem[]> {
    const evidence: EvidenceItem[] = [];
    
    try {
      // Search user's notes
      const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .textSearch('title', query)
        .limit(3);
      
      if (notes) {
        for (const note of notes) {
          evidence.push({
            source: `Personal Note: ${note.title}`,
            content: note.content || '',
            relevance: 0.8,
            timestamp: new Date(note.created_at)
          });
        }
      }

      // Search previous search history
      const { data: searches } = await supabase
        .from('search_history')
        .select('*')
        .ilike('query', `%${query}%`)
        .limit(2);
      
      if (searches) {
        for (const search of searches) {
          if (search.response) {
            evidence.push({
              source: `Previous Search: ${search.query}`,
              content: search.response,
              relevance: 0.6,
              timestamp: new Date(search.created_at)
            });
          }
        }
      }
    } catch (error) {
      console.error('Local knowledge search error:', error);
    }
    
    return evidence;
  }

  private async searchWeb(query: string): Promise<EvidenceItem[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-qa', {
        body: { 
          query,
          includeWeb: true,
          maxResults: 3 
        }
      });

      if (error || !data) {
        return [];
      }

      const evidence: EvidenceItem[] = [];
      
      if (data.sources && Array.isArray(data.sources)) {
        for (const source of data.sources.slice(0, 3)) {
          evidence.push({
            source: source.title || source.url || 'Web Source',
            content: source.content || source.snippet || '',
            relevance: source.relevance || 0.7,
            url: source.url
          });
        }
      }

      return evidence;
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  }

  private rerankEvidence(query: string, evidence: EvidenceItem[]): EvidenceItem[] {
    // Simple relevance scoring based on query terms
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    return evidence
      .map(item => ({
        ...item,
        relevance: this.calculateRelevanceScore(queryTerms, item.content.toLowerCase())
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5); // Top 5 most relevant
  }

  private calculateRelevanceScore(queryTerms: string[], content: string): number {
    let score = 0;
    const contentLength = content.length;
    
    for (const term of queryTerms) {
      const termCount = (content.match(new RegExp(term, 'g')) || []).length;
      score += termCount / Math.max(contentLength / 100, 1); // Normalize by content length
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  private async generateSummary(query: string, evidence: EvidenceItem[], context: ContextEntry[]): Promise<string> {
    try {
      // Use AI to generate a comprehensive summary
      const { data, error } = await supabase.functions.invoke('generate-rag-response', {
        body: {
          query,
          evidence: evidence.map(e => ({
            source: e.source,
            content: e.content.slice(0, 500) // Truncate for API limits
          })),
          context: context.slice(-3).map(c => ({
            role: c.type,
            content: c.content
          }))
        }
      });

      if (error || !data?.summary) {
        // Fallback to simple evidence compilation
        return this.createFallbackSummary(query, evidence);
      }

      return data.summary;
    } catch (error) {
      console.error('Summary generation error:', error);
      return this.createFallbackSummary(query, evidence);
    }
  }

  private createFallbackSummary(query: string, evidence: EvidenceItem[]): string {
    if (evidence.length === 0) {
      return `I don't have specific information about "${query}" in my current knowledge base. You might want to search for more recent information about this topic.`;
    }

    let summary = `Based on the available information about "${query}":\n\n`;
    
    const topEvidence = evidence.slice(0, 3);
    for (let i = 0; i < topEvidence.length; i++) {
      const item = topEvidence[i];
      const snippet = item.content.slice(0, 200);
      summary += `${i + 1}. From ${item.source}: ${snippet}${item.content.length > 200 ? '...' : ''}\n\n`;
    }

    return summary.trim();
  }

  private calculateConfidence(evidence: EvidenceItem[]): number {
    if (evidence.length === 0) return 0.3;
    
    const avgRelevance = evidence.reduce((sum, e) => sum + e.relevance, 0) / evidence.length;
    const evidenceCount = Math.min(evidence.length, 5) / 5; // Normalize to 0-1
    
    return Math.min(avgRelevance * 0.7 + evidenceCount * 0.3, 0.95);
  }
}