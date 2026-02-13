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
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const results = [];

    for (const user of users) {
      if (!user.email) continue;

      // Get today's entries for this user
      const { data: entries, error: entriesError } = await supabase
        .from("journal_entries")
        .select("text, result, created_at")
        .eq("user_id", user.id)
        .gte("created_at", todayISO)
        .order("created_at", { ascending: false });

      if (entriesError) {
        console.error(`Error fetching entries for ${user.id}:`, entriesError);
        continue;
      }

      let subject: string;
      let html: string;

      if (entries && entries.length > 0) {
        // Journal summary email
        const emotions = entries.map((e: any) => {
          const r = typeof e.result === "string" ? JSON.parse(e.result) : e.result;
          return r?.primaryEmotion || "Unknown";
        });
        const uniqueEmotions = [...new Set(emotions)];

        subject = "Your Daily Emo Track Journal Summary 📊";
        html = `
          <h2>Daily Journal Summary</h2>
          <p>Great job journaling today! You made <strong>${entries.length}</strong> ${entries.length === 1 ? "entry" : "entries"}.</p>
          <p><strong>Emotions detected:</strong> ${uniqueEmotions.join(", ")}</p>
          <p>Keep up the great work! Consistent journaling helps you understand your emotional patterns. 💛</p>
        `;
      } else {
        // Streak reminder email
        subject = "Don't Break Your Streak! 🔥";
        html = `
          <h2>Streak Reminder</h2>
          <p>Hey there! We noticed you haven't journaled today.</p>
          <p>Taking a few minutes to reflect on your emotions can make a big difference in your well-being.</p>
          <p><a href="https://feel-guide-ai.lovable.app">Open Emo Track now</a> and keep your streak alive! 🚀</p>
        `;
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Emo Track <onboarding@resend.dev>",
          to: [user.email],
          subject,
          html,
        }),
      });

      const result = await res.json();
      results.push({ userId: user.id, email: user.email, result });
    }

    return new Response(JSON.stringify({ success: true, processed: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
