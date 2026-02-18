import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = ["Info.rhrci@gmail.com", "rhrci.ng@gmail.com"];
const FROM_EMAIL = "onboarding@resend.dev";
const FROM_NAME = "RHRCI Website";

interface NotificationPayload {
  type: "contact" | "volunteer" | "partner" | "donation";
  data: Record<string, string | number | boolean | null | undefined>;
}

function buildContactEmail(data: Record<string, string | number | boolean | null | undefined>): { subject: string; html: string } {
  return {
    subject: `📩 New Contact Message from ${data.name}`,
    html: `
      <h2 style="color:#1a6b3c;">New Contact Message</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;width:140px;">Name</td><td style="padding:8px;">${data.name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Email</td><td style="padding:8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Phone</td><td style="padding:8px;">${data.phone}</td></tr>` : ""}
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Subject</td><td style="padding:8px;">${data.subject}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Message</td><td style="padding:8px;white-space:pre-wrap;">${data.message}</td></tr>
      </table>
    `,
  };
}

function buildVolunteerEmail(data: Record<string, string | number | boolean | null | undefined>): { subject: string; html: string } {
  return {
    subject: `🙋 New Volunteer Application from ${data.full_name}`,
    html: `
      <h2 style="color:#1a6b3c;">New Volunteer Application</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;width:140px;">Full Name</td><td style="padding:8px;">${data.full_name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Email</td><td style="padding:8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Phone</td><td style="padding:8px;">${data.phone}</td></tr>
        ${data.location ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Location</td><td style="padding:8px;">${data.location}</td></tr>` : ""}
        ${data.occupation ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Occupation</td><td style="padding:8px;">${data.occupation}</td></tr>` : ""}
        ${data.availability ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Availability</td><td style="padding:8px;">${data.availability}</td></tr>` : ""}
        ${data.skills ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Skills</td><td style="padding:8px;">${data.skills}</td></tr>` : ""}
        ${data.motivation ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Motivation</td><td style="padding:8px;white-space:pre-wrap;">${data.motivation}</td></tr>` : ""}
        ${data.how_heard ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">How They Heard</td><td style="padding:8px;">${data.how_heard}</td></tr>` : ""}
      </table>
    `,
  };
}

function buildPartnerEmail(data: Record<string, string | number | boolean | null | undefined>): { subject: string; html: string } {
  return {
    subject: `🤝 New Partnership Request from ${data.organization_name}`,
    html: `
      <h2 style="color:#1a6b3c;">New Partnership Request</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;width:160px;">Organization</td><td style="padding:8px;">${data.organization_name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Contact Person</td><td style="padding:8px;">${data.contact_person}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Email</td><td style="padding:8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Phone</td><td style="padding:8px;">${data.phone}</td></tr>` : ""}
        ${data.organization_type ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Org Type</td><td style="padding:8px;">${data.organization_type}</td></tr>` : ""}
        ${data.website ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Website</td><td style="padding:8px;"><a href="${data.website}">${data.website}</a></td></tr>` : ""}
        ${data.partnership_type ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Partnership Type</td><td style="padding:8px;">${data.partnership_type}</td></tr>` : ""}
        ${data.message ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Message</td><td style="padding:8px;white-space:pre-wrap;">${data.message}</td></tr>` : ""}
      </table>
    `,
  };
}

function buildDonationEmail(data: Record<string, string | number | boolean | null | undefined>): { subject: string; html: string } {
  const amount = typeof data.amount === "number" ? `₦${data.amount.toLocaleString()}` : data.amount;
  const donorLabel = data.is_anonymous ? "Anonymous" : (data.donor_name || "Unknown");
  return {
    subject: `💚 New Donation of ${amount} from ${donorLabel}`,
    html: `
      <h2 style="color:#1a6b3c;">New Donation Received</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;width:160px;">Amount</td><td style="padding:8px;font-size:1.2em;color:#1a6b3c;font-weight:bold;">${amount}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Donor Name</td><td style="padding:8px;">${donorLabel}</td></tr>
        ${data.donor_email ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Email</td><td style="padding:8px;"><a href="mailto:${data.donor_email}">${data.donor_email}</a></td></tr>` : ""}
        ${data.donor_phone ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Phone</td><td style="padding:8px;">${data.donor_phone}</td></tr>` : ""}
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Status</td><td style="padding:8px;">${data.payment_status}</td></tr>
        ${data.payment_reference ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Reference</td><td style="padding:8px;">${data.payment_reference}</td></tr>` : ""}
        ${data.message ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Message</td><td style="padding:8px;">${data.message}</td></tr>` : ""}
      </table>
    `,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const payload: NotificationPayload = await req.json();
    const { type, data } = payload;

    let emailContent: { subject: string; html: string };
    switch (type) {
      case "contact":
        emailContent = buildContactEmail(data);
        break;
      case "volunteer":
        emailContent = buildVolunteerEmail(data);
        break;
      case "partner":
        emailContent = buildPartnerEmail(data);
        break;
      case "donation":
        emailContent = buildDonationEmail(data);
        break;
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const footer = `
      <br/><hr style="margin-top:24px;border:none;border-top:1px solid #eee;"/>
      <p style="color:#888;font-size:12px;font-family:sans-serif;">
        This notification was sent automatically by the RHRCI website.
      </p>
    `;

    // Send to all admin emails
    const results = await Promise.all(
      ADMIN_EMAILS.map((to) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to,
            subject: emailContent.subject,
            html: emailContent.html + footer,
          }),
        }).then(async (res) => {
          const body = await res.json();
          if (!res.ok) {
            console.error(`Resend error for ${to}:`, body);
            return { success: false, error: body };
          }
          return { success: true, id: body.id };
        })
      )
    );

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Email notification error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
