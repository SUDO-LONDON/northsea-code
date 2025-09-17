import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "resend";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RECIPIENT_EMAIL = Deno.env.get("RECIPIENT_EMAIL") ?? "";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!RESEND_API_KEY || !RECIPIENT_EMAIL || !resend) {
    console.error("Missing configuration: RESEND_API_KEY or RECIPIENT_EMAIL");
    return new Response(JSON.stringify({ error: "Server email not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const record = payload?.record;
  if (!record) {
    return new Response(JSON.stringify({ error: "Missing record in payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const meta = record.raw_user_meta_data || record.user_metadata || {};
    const { company_name, position, country_of_incorporation, phone } = meta;

    const emailBody = `
      <h1>New User Signup</h1>
      <ul>
        <li><strong>Email:</strong> ${record.email || 'Not provided'}</li>
        <li><strong>Company Name:</strong> ${company_name || 'Not provided'}</li>
        <li><strong>Position:</strong> ${position || 'Not provided'}</li>
        <li><strong>Country of Incorporation:</strong> ${country_of_incorporation || 'Not provided'}</li>
        <li><strong>Phone Number:</strong> ${phone || 'Not provided'}</li>
        <li><strong>User ID:</strong> ${record.id || 'N/A'}</li>
        <li><strong>Created At:</strong> ${record.created_at || 'N/A'}</li>
      </ul>
    `;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: RECIPIENT_EMAIL,
      subject: "New User Signup",
      html: emailBody,
    });

    return new Response(JSON.stringify({ message: "Email dispatched" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email dispatch failed", error);
    return new Response(JSON.stringify({ error: "Email send failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
