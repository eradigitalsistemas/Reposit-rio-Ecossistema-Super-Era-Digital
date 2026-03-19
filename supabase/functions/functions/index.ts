import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  return new Response(JSON.stringify({ message: 'Function executed successfully' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
