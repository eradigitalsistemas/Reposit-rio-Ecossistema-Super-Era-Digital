import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async () => {
  return new Response(JSON.stringify({ message: 'Deprecated or unused function endpoint.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
