// Shared utilities for Supabase Edge Functions

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function createResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

export function createErrorResponse(error: string, status: number = 500) {
  return createResponse({ error }, status)
}

export function createSuccessResponse(data?: any, message?: string) {
  return createResponse({ 
    success: true, 
    data, 
    message 
  })
}


