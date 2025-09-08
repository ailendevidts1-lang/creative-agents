import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message, mode = 'manual', attachments, persona = 'default', capabilities = [] } = await req.json();
    
    if (!googleApiKey) {
      throw new Error('Google AI API key not configured');
    }

    console.log(`Agent orchestrator received message for session ${sessionId}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT
    let userId;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
      
      if (userError || !user) {
        console.log('Invalid or missing user token, using demo mode');
        userId = '00000000-0000-0000-0000-000000000000';
      } else {
        userId = user.id;
      }
    } else {
      console.log('No auth header, using demo mode');
      userId = '00000000-0000-0000-0000-000000000000';
    }

    // Get or create session
    let session;
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();
      
      session = existingSession;
    }

    if (!session) {
      const newSessionId = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { data: newSession, error: sessionError } = await supabase
        .from('agent_sessions')
        .insert({
          session_id: newSessionId,
          user_id: userId,
          mode,
          persona,
          scopes: capabilities,
          context: { messages: [] }
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        throw new Error('Failed to create session');
      }
      
      session = newSession;
    }

    console.log('Session established:', session.id);

    // Set up SSE stream for real-time updates
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial acknowledgment
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'session_started',
          sessionId: session.session_id,
          mode: session.mode,
          persona: session.persona
        })}\n\n`));

        // Process the message with Gemini
        processWithGemini(message, session, attachments, controller, encoder, supabase)
          .then(() => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'done'
            })}\n\n`));
            controller.close();
          })
          .catch((error) => {
            console.error('Processing error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              message: error.message
            })}\n\n`));
            controller.close();
          });
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in agent orchestrator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Agent orchestration failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processWithGemini(
  message: string, 
  session: any, 
  attachments: any[], 
  controller: ReadableStreamDefaultController, 
  encoder: TextEncoder,
  supabase: any
) {
  try {
    // Step 1: Interpret the request with Gemini
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'log',
      level: 'info',
      message: 'Interpreting request with Gemini...'
    })}\n\n`));

    const interpretation = await interpretRequest(message, session, attachments);
    
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'interpretation',
      goal: interpretation.goal,
      constraints: interpretation.constraints,
      success_criteria: interpretation.success_criteria
    })}\n\n`));

    // Step 2: Retrieve relevant memories (RAG)
    const memories = await retrieveMemories(message, session.user_id, supabase);
    
    // Step 3: Generate execution plan (DAG)
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'log',
      level: 'info',
      message: 'Generating execution plan...'
    })}\n\n`));

    const plan = await generatePlan(interpretation, memories, session);
    
    // Save plan to database
    const { data: savedPlan } = await supabase
      .from('agent_plans')
      .insert({
        session_id: session.id,
        user_id: session.user_id,
        goal: interpretation.goal,
        constraints: interpretation.constraints,
        success_criteria: interpretation.success_criteria,
        dag_steps: plan.steps,
        status: 'executing'
      })
      .select()
      .single();

    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'plan',
      steps: plan.steps
    })}\n\n`));

    // Step 4: Execute plan steps
    await executePlan(savedPlan, controller, encoder, supabase);

    // Step 5: Save memories
    await saveMemories(interpretation, plan, session.user_id, supabase);

  } catch (error) {
    console.error('Gemini processing error:', error);
    throw error;
  }
}

async function interpretRequest(message: string, session: any, attachments: any[] = []) {
  const prompt = `You are an AI agent interpreter. Analyze the user's request and extract:
1. The main goal/objective
2. Any constraints or limitations
3. Success criteria to know when the task is complete

Respond in JSON format:
{
  "goal": "clear statement of what user wants to achieve",
  "constraints": {"budget": "value", "time": "value", "restrictions": []},
  "success_criteria": ["criterion1", "criterion2", "criterion3"]
}

User message: "${message}"
Session context: ${JSON.stringify(session.context)}
Persona: ${session.persona}`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': Deno.env.get('GOOGLE_AI_API_KEY')!
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
      }
    })
  });

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse interpretation:', content);
    return {
      goal: message,
      constraints: {},
      success_criteria: ["Task completed successfully"]
    };
  }
}

async function retrieveMemories(query: string, userId: string, supabase: any) {
  const { data: memories } = await supabase
    .from('agent_memories')
    .select('*')
    .eq('user_id', userId)
    .textSearch('value', query.split(' ').join(' | '))
    .limit(5);

  return memories || [];
}

async function generatePlan(interpretation: any, memories: any[], session: any) {
  const availableTools = [
    'web.search', 'web.actions', 'web.extract', 'web.download',
    'mail.search', 'mail.draft', 'mail.send',
    'calendar.create', 'calendar.update', 'calendar.find',
    'files.upload', 'files.download', 'files.list',
    'notes.create', 'notes.list', 'notes.update',
    'timers.create', 'timers.list', 'timers.pause',
    'weather.get', 'search.web'
  ];

  const prompt = `You are an AI task planner. Create a detailed execution plan as a DAG (Directed Acyclic Graph).

Available tools: ${availableTools.join(', ')}

Goal: ${interpretation.goal}
Constraints: ${JSON.stringify(interpretation.constraints)}
Success Criteria: ${interpretation.success_criteria.join(', ')}
Relevant Memories: ${memories.map(m => m.key + ': ' + JSON.stringify(m.value)).join('; ')}

Create a plan with steps that can be executed. Mark risky steps that need approval.

Respond in JSON format:
{
  "steps": [
    {
      "id": "step1",
      "tool": "tool_name",
      "args": {"param": "value"},
      "dependencies": [],
      "dryRun": true,
      "needsApproval": false,
      "riskLevel": "low|medium|high"
    }
  ],
  "summary": "Brief plan description"
}`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': Deno.env.get('GOOGLE_AI_API_KEY')!
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2000,
      }
    })
  });

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse plan:', content);
    return {
      steps: [{
        id: 'fallback',
        tool: 'web.search',
        args: { query: interpretation.goal },
        dependencies: [],
        dryRun: true,
        needsApproval: false,
        riskLevel: 'low'
      }],
      summary: 'Fallback search plan'
    };
  }
}

async function executePlan(
  plan: any, 
  controller: ReadableStreamDefaultController, 
  encoder: TextEncoder, 
  supabase: any
) {
  for (const step of plan.dag_steps) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'tool_call',
      stepId: step.id,
      tool: step.tool,
      args: step.args,
      dryRun: step.dryRun
    })}\n\n`));

    try {
      // Create execution record
      const { data: execution } = await supabase
        .from('agent_executions')
        .insert({
          plan_id: plan.id,
          step_id: step.id,
          tool_name: step.tool,
          parameters: step.args,
          dry_run: step.dryRun,
          needs_approval: step.needsApproval || false,
          status: 'executing'
        })
        .select()
        .single();

      // Check if approval needed
      if (step.needsApproval) {
        await supabase
          .from('agent_approvals')
          .insert({
            execution_id: execution.id,
            user_id: plan.user_id,
            summary: `Approval needed for ${step.tool}`,
            details: { step, args: step.args },
            risk_level: step.riskLevel || 'medium'
          });

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'approval_request',
          executionId: execution.id,
          summary: `Approval needed for ${step.tool}`,
          riskLevel: step.riskLevel || 'medium'
        })}\n\n`));
        
        // Skip execution for now - wait for approval
        continue;
      }

      // Execute the tool
      const result = await executeToolStep(step, supabase);
      
      // Update execution record
      await supabase
        .from('agent_executions')
        .update({
          result,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', execution.id);

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'tool_result',
        stepId: step.id,
        result
      })}\n\n`));

    } catch (error) {
      console.error(`Error executing step ${step.id}:`, error);
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'tool_error',
        stepId: step.id,
        error: error.message
      })}\n\n`));
    }
  }
}

async function executeToolStep(step: any, supabase: any) {
  const { tool, args } = step;
  
  switch (tool) {
    case 'web.search':
      return await supabase.functions.invoke('search-qa', {
        body: { query: args.query, includeWeb: true, maxResults: 5 }
      });
      
    case 'notes.create':
      return await supabase.functions.invoke('execute-task', {
        body: { 
          action: 'create_note',
          parameters: { title: args.title, content: args.content }
        }
      });
      
    case 'timers.create':
      return await supabase.functions.invoke('execute-task', {
        body: { 
          action: 'create_timer',
          parameters: { name: args.name, duration: args.duration }
        }
      });
      
    case 'weather.get':
      return await supabase.functions.invoke('get-weather', {
        body: { location: args.location }
      });
      
    default:
      console.log(`Mock execution for tool: ${tool}`, args);
      return {
        success: true,
        data: { message: `Mock result for ${tool}` },
        tool,
        args
      };
  }
}

async function saveMemories(interpretation: any, plan: any, userId: string, supabase: any) {
  try {
    await supabase
      .from('agent_memories')
      .insert({
        user_id: userId,
        namespace: 'goals',
        key: interpretation.goal,
        value: {
          goal: interpretation.goal,
          constraints: interpretation.constraints,
          success_criteria: interpretation.success_criteria,
          plan_summary: plan.summary,
          timestamp: new Date().toISOString()
        }
      });
  } catch (error) {
    console.error('Failed to save memories:', error);
  }
}