import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RECIPIENT_EMAIL = Deno.env.get("RECIPIENT_EMAIL") ?? "";

function log(...args: any[]) {
  console.log(new Date().toISOString(), "[send-signup-email]", ...args);
}

serve(async (req) => {
  log("Function invoked");
  if (req.method !== "POST") {
    log("Invalid method", req.method);
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  log("Checking env vars", { hasKey: !!RESEND_API_KEY, hasRecipient: !!RECIPIENT_EMAIL });
  if (!RESEND_API_KEY || !RECIPIENT_EMAIL) {
    log("Missing config", {
      hasKey: !!RESEND_API_KEY,
      hasRecipient: !!RECIPIENT_EMAIL,
    });
    return new Response(JSON.stringify({ error: "Server email not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: any;
  try {
    payload = await req.json();
    log("Received payload", payload);
  } catch (e) {
    log("Invalid JSON", e);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const record = payload?.record;
  if (!record) {
    log("No record field in payload", payload);
    return new Response(JSON.stringify({ error: "Missing record in payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    log("Dispatch signup email", record);

    // Compose email body with all fields in the record
    const emailBody = `
      <h1>New User Signup</h1>
      <ul>
        <li><strong>Email:</strong> ${record.email || "Not provided"}</li>
        <li><strong>Company Name:</strong> ${record.company_name || "Not provided"}</li>
        <li><strong>Position:</strong> ${record.position || "Not provided"}</li>
        <li><strong>Country:</strong> ${record.country || "Not provided"}</li>
        <li><strong>Phone:</strong> ${record.phone || "Not provided"}</li>
        <li><strong>Created At:</strong> ${record.created_at || "N/A"}</li>
      </ul>
    `;

    log("Sending to Resend API", { to: RECIPIENT_EMAIL });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: RECIPIENT_EMAIL,
        subject: "New User Signup",
        html: emailBody,
      }),
    });

    const sendResult = await response.json();
    log("Resend response", sendResult);

    if (!response.ok) {
      log("Resend API error", sendResult);
      throw new Error(sendResult.error || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ message: "Signup email dispatched", resend: sendResult }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    log("Signup email dispatch failed", error);
    return new Response(
      JSON.stringify({ error: "Email send failed", detail: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
