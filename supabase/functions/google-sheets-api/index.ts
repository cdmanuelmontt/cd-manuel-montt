import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, data } = await req.json();

    console.log(`Processing ${type} data update from Google Sheets`);

    let result;

    switch (type) {
      case 'matches':
        // Update matches data
        const { error: matchError } = await supabase
          .from('matches')
          .upsert(data, { onConflict: 'id' });
        if (matchError) throw matchError;
        result = { success: true, message: 'Matches updated successfully' };
        break;

      case 'standings':
        // Update standings data
        const { error: standingsError } = await supabase
          .from('standings')
          .upsert(data, { onConflict: 'id' });
        if (standingsError) throw standingsError;
        result = { success: true, message: 'Standings updated successfully' };
        break;

      case 'suspended_players':
        // Update suspended players data
        const { error: suspendedError } = await supabase
          .from('suspended_players')
          .upsert(data, { onConflict: 'id' });
        if (suspendedError) throw suspendedError;
        result = { success: true, message: 'Suspended players updated successfully' };
        break;

      case 'gallery':
        // Update gallery data
        const { error: galleryError } = await supabase
          .from('gallery')
          .upsert(data, { onConflict: 'id' });
        if (galleryError) throw galleryError;
        result = { success: true, message: 'Gallery updated successfully' };
        break;

      case 'club_info':
        // Update club info data
        const { error: clubError } = await supabase
          .from('club_info')
          .upsert(data, { onConflict: 'section' });
        if (clubError) throw clubError;
        result = { success: true, message: 'Club info updated successfully' };
        break;

      default:
        throw new Error(`Unknown data type: ${type}`);
    }

    console.log(`Successfully updated ${type}:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});