import { PlanStep, ToolResult } from './types';

export interface ValidationRule {
  stepType?: string;
  stepAction?: string;
  validator: (step: PlanStep, result: ToolResult) => Promise<ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reasons?: string[];
  suggestions?: string[];
  canRetry: boolean;
}

export class ExecutionValidator {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Timer validation rules
    this.addRule({
      stepType: 'skill',
      stepAction: 'create_timer',
      validator: async (step, result) => {
        if (!result.success) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['Timer creation failed'],
            canRetry: true
          };
        }

        const timer = result.data?.timer;
        if (!timer) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['No timer data returned'],
            canRetry: true
          };
        }

        const issues: string[] = [];
        if (!timer.id) issues.push('Missing timer ID');
        if (!timer.name) issues.push('Missing timer name');
        if (!timer.duration) issues.push('Missing timer duration');

        return {
          isValid: issues.length === 0,
          confidence: issues.length === 0 ? 1.0 : 0.3,
          reasons: issues.length > 0 ? issues : undefined,
          canRetry: true
        };
      }
    });

    // Note validation rules
    this.addRule({
      stepType: 'skill',
      stepAction: 'create_note',
      validator: async (step, result) => {
        if (!result.success) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['Note creation failed'],
            canRetry: true
          };
        }

        const note = result.data?.note;
        if (!note) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['No note data returned'],
            canRetry: true
          };
        }

        const issues: string[] = [];
        if (!note.id) issues.push('Missing note ID');
        if (!note.title) issues.push('Missing note title');

        return {
          isValid: issues.length === 0,
          confidence: issues.length === 0 ? 1.0 : 0.5,
          reasons: issues.length > 0 ? issues : undefined,
          canRetry: true
        };
      }
    });

    // Weather validation rules
    this.addRule({
      stepType: 'api',
      stepAction: 'get_weather',
      validator: async (step, result) => {
        if (!result.success) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['Weather API call failed'],
            canRetry: true
          };
        }

        const weather = result.data?.weather;
        if (!weather) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['No weather data returned'],
            canRetry: true
          };
        }

        const issues: string[] = [];
        if (weather.temperature === undefined || weather.temperature === null) {
          issues.push('Missing temperature data');
        }
        if (!weather.description) {
          issues.push('Missing weather description');
        }

        // Check for reasonable temperature ranges
        if (typeof weather.temperature === 'number') {
          if (weather.temperature < -100 || weather.temperature > 100) {
            issues.push('Temperature value seems unrealistic');
          }
        }

        return {
          isValid: issues.length === 0,
          confidence: issues.length === 0 ? 0.9 : 0.4,
          reasons: issues.length > 0 ? issues : undefined,
          suggestions: issues.length > 0 ? ['Try requesting weather for a different location'] : undefined,
          canRetry: true
        };
      }
    });

    // Search validation rules
    this.addRule({
      stepType: 'search',
      stepAction: 'web_search',
      validator: async (step, result) => {
        if (!result.success) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['Search operation failed'],
            canRetry: true
          };
        }

        const searchResults = result.data?.searchResults;
        if (!searchResults) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['No search results returned'],
            canRetry: false // Search returning no results might be valid
          };
        }

        const issues: string[] = [];
        const suggestions: string[] = [];

        if (!Array.isArray(searchResults.sources)) {
          issues.push('Search sources not in expected format');
        } else if (searchResults.sources.length === 0) {
          issues.push('No search results found');
          suggestions.push('Try rephrasing the search query');
        } else {
          // Validate source quality
          const validSources = searchResults.sources.filter((source: any) => 
            source.title && (source.content || source.snippet)
          );
          
          if (validSources.length === 0) {
            issues.push('No valid sources with content found');
          } else if (validSources.length < searchResults.sources.length * 0.5) {
            issues.push('Many sources lack proper content');
            suggestions.push('Search results may be of low quality');
          }
        }

        return {
          isValid: issues.length === 0,
          confidence: issues.length === 0 ? 0.85 : 0.2,
          reasons: issues.length > 0 ? issues : undefined,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
          canRetry: issues.some(issue => issue.includes('format') || issue.includes('failed'))
        };
      }
    });

    // General computation validation
    this.addRule({
      stepType: 'computation',
      validator: async (step, result) => {
        if (!result.success) {
          return {
            isValid: false,
            confidence: 1.0,
            reasons: ['Computation failed'],
            canRetry: true
          };
        }

        // For general computations, we just check if we got some result
        if (!result.data) {
          return {
            isValid: false,
            confidence: 0.8,
            reasons: ['No computation result returned'],
            canRetry: true
          };
        }

        return {
          isValid: true,
          confidence: 0.9,
          canRetry: false
        };
      }
    });
  }

  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  async validate(step: PlanStep, result: ToolResult): Promise<ValidationResult> {
    console.log(`Validating step: ${step.action} (${step.type})`);

    // Find applicable rules
    const applicableRules = this.rules.filter(rule => {
      const typeMatch = !rule.stepType || rule.stepType === step.type;
      const actionMatch = !rule.stepAction || rule.stepAction === step.action;
      return typeMatch && actionMatch;
    });

    if (applicableRules.length === 0) {
      // No specific rules - use basic validation
      return this.basicValidation(step, result);
    }

    // Run all applicable rules and combine results
    const validationResults = await Promise.all(
      applicableRules.map(rule => rule.validator(step, result))
    );

    // Combine results (all must be valid for overall validity)
    const isValid = validationResults.every(r => r.isValid);
    const minConfidence = Math.min(...validationResults.map(r => r.confidence));
    
    const allReasons = validationResults
      .flatMap(r => r.reasons || [])
      .filter((reason, index, arr) => arr.indexOf(reason) === index);
    
    const allSuggestions = validationResults
      .flatMap(r => r.suggestions || [])
      .filter((suggestion, index, arr) => arr.indexOf(suggestion) === index);

    const canRetry = validationResults.some(r => r.canRetry);

    const combinedResult: ValidationResult = {
      isValid,
      confidence: minConfidence,
      reasons: allReasons.length > 0 ? allReasons : undefined,
      suggestions: allSuggestions.length > 0 ? allSuggestions : undefined,
      canRetry
    };

    console.log('Validation result:', combinedResult);
    return combinedResult;
  }

  private async basicValidation(step: PlanStep, result: ToolResult): Promise<ValidationResult> {
    // Basic validation for steps without specific rules
    if (!result.success) {
      return {
        isValid: false,
        confidence: 1.0,
        reasons: [`Step execution failed: ${result.error || 'Unknown error'}`],
        canRetry: true
      };
    }

    // If it succeeded but has no data, it might still be valid
    if (!result.data) {
      return {
        isValid: true,
        confidence: 0.7,
        reasons: ['No data returned, but operation may have succeeded'],
        canRetry: false
      };
    }

    return {
      isValid: true,
      confidence: 0.8,
      canRetry: false
    };
  }

  // Utility method to get validation rules for debugging
  getRules(): ValidationRule[] {
    return [...this.rules];
  }

  // Method to clear all rules (useful for testing)
  clearRules(): void {
    this.rules = [];
  }
}