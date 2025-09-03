import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, model = 'gpt-4o-mini' } = body || {};
    
    console.log('Received classify-intent request:', { text, model });
    
    if (!text || typeof text !== 'string' || !text.trim()) {
      console.error('Invalid text input:', text);
      throw new Error('Valid text input is required for classification');
    }

    const prompt = `Classify the following user input into one of these categories and extract relevant entities:

Categories:
- timer: Setting timers, alarms, reminders
- notes: Creating, editing, or managing notes
- weather: Getting weather information
- search: Searching for information or asking questions
- development: Coding, debugging, project-related questions
- general: Everything else

Text to classify: "${text.trim()}"

Respond with JSON in this format:
{
  "intent": "category_name",
  "entities": {
    "duration": "5 minutes" (for timers),
    "location": "New York" (for weather),
    "content": "note content" (for notes),
    "query": "search terms" (for search)
  },
  "confidence": 0.95,
  "needsPlanning": true/false,
  "isQuestion": true/false
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{
              text: `You are an intent classification system. Always respond with valid JSON.\n\n${prompt}`
            }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.1
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    try {
      const result = JSON.parse(content);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', parseError);
      
      // Fallback classification with better logic
      const lowerText = text.toLowerCase().trim();
      const fallback = {
        intent: simpleClassifyIntent(lowerText),
        entities: simpleExtractEntities(lowerText),
        confidence: 0.6,
        needsPlanning: simpleNeedsPlanning(lowerText),
        isQuestion: lowerText.includes('?') || lowerText.startsWith('what') || 
                   lowerText.startsWith('how') || lowerText.startsWith('when') ||
                   lowerText.startsWith('where') || lowerText.startsWith('why') ||
                   lowerText.startsWith('who') || lowerText.startsWith('can you') ||
                   lowerText.startsWith('do you') || lowerText.startsWith('will you')
      };
      
      console.log('Using fallback classification:', fallback);
      
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Intent classification error:', error);
    
    // Return a safe fallback response
    const safeFallback = {
      intent: 'general',
      entities: {},
      confidence: 0.5,
      needsPlanning: false,
      isQuestion: false
    };
    
    return new Response(
      JSON.stringify(safeFallback),
      { 
        status: 200, // Return 200 so the client gets the fallback
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Helper functions for fallback classification
  function simpleClassifyIntent(text: string): string {
    if (text.includes('timer') || text.includes('alarm') || text.includes('remind')) return 'timer';
    if (text.includes('note') || text.includes('write') || text.includes('remember')) return 'notes';
    if (text.includes('weather') || text.includes('temperature')) return 'weather';
    if (text.includes('search') || text.includes('find') || text.includes('look')) return 'search';
    if (text.includes('code') || text.includes('debug') || text.includes('implement')) return 'development';
    return 'general';
  }

  function simpleExtractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract time patterns
    const timeMatch = text.match(/(\d+)\s*(minute|min|second|sec|hour|hr)/i);
    if (timeMatch) entities.duration = timeMatch[0];
    
    // Extract locations
    const locationMatch = text.match(/in\s+([a-z\s]+)/i);
    if (locationMatch) entities.location = locationMatch[1].trim();
    
    return entities;
  }

  function simpleNeedsPlanning(text: string): boolean {
    const planningKeywords = ['create', 'set', 'make', 'add', 'start', 'timer', 'note', 'weather', 'search'];
    return planningKeywords.some(keyword => text.includes(keyword));
  }
});