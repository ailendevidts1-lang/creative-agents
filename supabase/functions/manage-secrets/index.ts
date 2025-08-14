import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, id, name, value, description } = await req.json();
    console.log('Managing secret:', action, name);

    // Create Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case 'list':
        const { data: secrets, error: listError } = await supabase
          .from('secrets')
          .select('id, name, description, created_at, last_used')
          .order('created_at', { ascending: false });

        if (listError) {
          console.error('List secrets error:', listError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: listError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          secrets: secrets || [] 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'create':
        if (!name || !value) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Name and value are required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Encrypt the value (simple base64 for demo - use proper encryption in production)
        const encryptedValue = btoa(value);

        const { data: newSecret, error: createError } = await supabase
          .from('secrets')
          .insert({
            name,
            value: encryptedValue,
            description: description || null,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Create secret error:', createError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: createError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          secret: { ...newSecret, value: undefined } // Don't return the value
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get':
        if (!id) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Secret ID is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: secret, error: getError } = await supabase
          .from('secrets')
          .select('value')
          .eq('id', id)
          .single();

        if (getError) {
          console.error('Get secret error:', getError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: getError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Decrypt the value
        const decryptedValue = atob(secret.value);

        // Update last_used timestamp
        await supabase
          .from('secrets')
          .update({ last_used: new Date().toISOString() })
          .eq('id', id);

        return new Response(JSON.stringify({ 
          success: true, 
          value: decryptedValue 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update':
        if (!id || !value) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Secret ID and value are required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const newEncryptedValue = btoa(value);

        const { error: updateError } = await supabase
          .from('secrets')
          .update({ 
            value: newEncryptedValue,
            last_used: new Date().toISOString()
          })
          .eq('id', id);

        if (updateError) {
          console.error('Update secret error:', updateError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: updateError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'delete':
        if (!id) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Secret ID is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: deleteError } = await supabase
          .from('secrets')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Delete secret error:', deleteError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: deleteError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Manage secrets error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to manage secrets' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});