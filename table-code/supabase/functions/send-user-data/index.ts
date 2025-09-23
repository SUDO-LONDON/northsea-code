import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RECIPIENT_EMAIL = Deno.env.get("RECIPIENT_EMAIL") ?? "";

function log(...args: any[]) {
  console.log(new Date().toISOString(), "[send-user-data]", ...args);
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

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
    const meta = record.raw_user_meta_data || record.user_metadata || {};
    // Try to extract company_name, position, country_of_incorporation, phone from multiple possible locations
    let company_name = record.company_name || meta.company_name || meta.company || "Not provided";
    let position = record.position || meta.position || "Not provided";
    let country_of_incorporation = record.country_of_incorporation || meta.country_of_incorporation || meta.country || "Not provided";
    let phone = record.phone || meta.phone || "Not provided";

    log("Dispatch email", {
      id: record.id,
      email: record.email,
      company_name,
      position,
      country_of_incorporation,
      phone,
      created_at: record.created_at,
      recipient: RECIPIENT_EMAIL,
    });

    const emailBody = `
      <h1>New User Signup</h1>
      <ul>
        <li><strong>Email:</strong> ${record.email || "Not provided"}</li>
        <li><strong>Company Name:</strong> ${company_name}</li>
        <li><strong>Position:</strong> ${position}</li>
        <li><strong>Country of Incorporation:</strong> ${country_of_incorporation}</li>
        <li><strong>Phone Number:</strong> ${phone}</li>
        <li><strong>User ID:</strong> ${record.id || "N/A"}</li>
        <li><strong>Created At:</strong> ${record.created_at || "N/A"}</li>
      </ul>
    `;

    // Use fetch to call Resend API directly
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "logs.northseatrading@sudolondon.com", // use your verified domain and correct from address
        to: RECIPIENT_EMAIL,
        subject: "New User Signup",
        html: emailBody
      })
    });
    const sendResult = await response.json();
    log("Resend response", sendResult);
    if (!response.ok) {
      log("Resend API error", sendResult);
      throw new Error(sendResult.error || "Failed to send email");
    }
    return new Response(
      JSON.stringify({ message: "Email dispatched", resend: sendResult }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    log("Email dispatch failed", error);
    return new Response(
      JSON.stringify({ error: "Email send failed", detail: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
