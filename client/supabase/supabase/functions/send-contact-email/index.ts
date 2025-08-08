// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import "https://deno.land/x/dotenv/load.ts";

// acceptable URL's for the origin header 
const origins = [
  "http://localhost:5173",
  "https://letmecook.ca"
]

serve(async (req: Request) => {
  // handle preflight options resquest for CORS
  const origin = req.headers.get("origin") ?? "";
  const isAllowed = origins.includes(origin);

  if (req.method == "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : "null",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return new Response("Invalid input", { 
      status: 400,
      headers: { "Access-Control-Allow-Origin": isAllowed ? origin : "null" }
    });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "You've got mail from <onboarding@resend.dev>",
      to: "jennyhe1686@gmail.com",
      subject: "Contact Form Submission",
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
    }),
  });

  if (!emailRes.ok) {
    return new Response("Failed to send email", { 
      status: 500,
      headers: { "Access-Control-Allow-Origin": isAllowed ? origin : "null" }
    });
  }

  return new Response("Email sent!", { 
    status: 200,
    headers: { "Access-Control-Allow-Origin": isAllowed ? origin : "null" }
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-contact-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
