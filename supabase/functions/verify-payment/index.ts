import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Reference is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (verifyData.data?.status === "success") {
      await supabase
        .from("donations")
        .update({ payment_status: "completed" })
        .eq("payment_reference", reference);

      // Update program raised amount if linked to a program
      const { data: donation } = await supabase
        .from("donations")
        .select("program_id, amount")
        .eq("payment_reference", reference)
        .single();

      if (donation?.program_id) {
        const { data: program } = await supabase
          .from("programs")
          .select("raised")
          .eq("id", donation.program_id)
          .single();

        if (program) {
          await supabase
            .from("programs")
            .update({ raised: Number(program.raised) + donation.amount })
            .eq("id", donation.program_id);
        }
      }

      return new Response(
        JSON.stringify({ status: "success", message: "Payment verified" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      await supabase
        .from("donations")
        .update({ payment_status: "failed" })
        .eq("payment_reference", reference);

      return new Response(
        JSON.stringify({ status: "failed", message: "Payment verification failed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
