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
    const { text, voice = 'alloy', speed = 1.0 } = await req.json();
    
    if (!text) {
      throw new Error('Text is required for TTS');
    }

    // Note: Gemini does not support TTS - you'll need to use a different service
    // Options: ElevenLabs, Google Cloud TTS, Azure Cognitive Services, etc.
    return new Response(
      JSON.stringify({ 
        error: 'TTS not available with Gemini. Please use ElevenLabs, Google Cloud TTS, or Azure TTS instead.',
        suggestion: 'Consider integrating with ElevenLabs API for high-quality text-to-speech'
      }),
      {
        status: 501,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('TTS error (Gemini does not support TTS):', error);
    return new Response(
      JSON.stringify({ 
        error: 'TTS not supported with Gemini API',
        suggestion: 'Use ElevenLabs, Google Cloud TTS, or Azure TTS for text-to-speech functionality'
      }),
      {
        status: 501,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});