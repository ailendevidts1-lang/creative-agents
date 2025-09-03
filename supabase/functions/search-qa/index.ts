import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // First, get web search results (simplified - in production you'd use a real search API)
    const searchResults = await performWebSearch(query);

    // Then, use Gemini to generate a comprehensive answer
    const aiResponse = await generateAIAnswer(query, searchResults, geminiApiKey);

    return new Response(JSON.stringify({
      response: aiResponse,
      sources: searchResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-qa function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Search failed' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performWebSearch(query: string) {
  // Simplified mock search results
  // In production, you'd integrate with Google Custom Search API, Bing API, or similar
  const mockResults = [
    {
      title: `Information about: ${query}`,
      url: `https://example.com/search?q=${encodeURIComponent(query)}`,
      snippet: `This is relevant information about ${query}. Here are some key details and facts that might be helpful for your query.`
    },
    {
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      snippet: `Wikipedia article providing comprehensive information about ${query}, including history, context, and related topics.`
    },
    {
      title: `Latest news about ${query}`,
      url: `https://news.example.com/${encodeURIComponent(query)}`,
      snippet: `Recent news and updates related to ${query}. Stay informed with the latest developments and insights.`
    }
  ];

  return mockResults;
}

async function generateAIAnswer(query: string, searchResults: any[], apiKey: string) {
  const context = searchResults.map(result => 
    `Title: ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}`
  ).join('\n\n');

  const prompt = `Based on the following search results, provide a comprehensive and accurate answer to the user's question: "${query}"

Search Results:
${context}

Please provide a helpful, accurate, and well-structured answer based on the information available. If the search results don't contain enough information to fully answer the question, acknowledge this and provide what information is available.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{
            text: `You are a helpful AI assistant that provides accurate, well-researched answers based on web search results. Always be factual and cite your sources when possible.

${prompt}`
          }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7
      }
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI response');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}