const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert emotion analysis AI for a mental health journaling app called Emo Track. Analyze the user's journal entry and return a JSON response.

You MUST call the "analyze_emotion" function with your analysis. Do NOT return plain text.

Rules:
- primaryEmotion: exactly one of: happy, sad, angry, fear, surprise, love, anxious. NEVER use "neutral" — always pick the closest emotional match even for mild or ambiguous text.
- confidence: integer 55-98 representing how confident you are
- sentiment: exactly one of: Positive, Negative, Neutral, Mixed
- intensity: exactly one of: Low, Medium, High
- insight: A warm, empathetic 1-2 sentence insight about their emotional state. Be specific to what they wrote. Write like you're talking to a close friend -- use simple, everyday words anyone would understand. Avoid formal, clinical, or complex vocabulary (e.g., say "out of the blue" not "unanticipated", say "feeling low" not "emotional exhaustion", say "tough day" not "adversity"). Use relatable phrases like: "suddenly", "unexpectedly", "out of nowhere" for surprise; "scared", "freaked out", "shook" for fear; "feeling down", "rough day", "heavy heart" for sadness.
- suggestions: exactly 3 actionable, personalized suggestions with emoji prefixes. Suggestions should sound like friendly advice, not therapy instructions (e.g., "Take a walk and clear your head" not "Engage in ambulatory mindfulness practice"). Keep everything conversational and warm -- like a caring friend, not a textbook.
- safetyAlert: true if the text contains any indication of self-harm, suicidal thoughts, crisis, or danger to self/others
- safetyMessage: if safetyAlert is true, provide a warm, caring message encouraging them to seek support. Do NOT include phone numbers. Keep it gentle and non-diagnostic.
- mentalHealthClassification: exactly one of: Normal, Depression, Suicidal, Anxiety, Stress, Bipolar, Personality Disorder
- mentalHealthConfidence: integer 50-95

Critical safety rules:
- Text mentioning wanting to die, self-harm, ending life, feeling worthless with no hope MUST trigger safetyAlert=true and primaryEmotion=sad
- NEVER classify distressing/crisis text as "happy"
- When in doubt about safety, err on the side of triggering the alert`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_emotion",
              description: "Return the structured emotion analysis result",
              parameters: {
                type: "object",
                properties: {
                  primaryEmotion: { type: "string", enum: ["happy", "sad", "angry", "fear", "surprise", "love", "anxious"] },
                  confidence: { type: "integer", minimum: 55, maximum: 98 },
                  sentiment: { type: "string", enum: ["Positive", "Negative", "Neutral", "Mixed"] },
                  intensity: { type: "string", enum: ["Low", "Medium", "High"] },
                  insight: { type: "string" },
                  suggestions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
                  safetyAlert: { type: "boolean" },
                  safetyMessage: { type: "string" },
                  mentalHealthClassification: { type: "string", enum: ["Normal", "Depression", "Suicidal", "Anxiety", "Stress", "Bipolar", "Personality Disorder"] },
                  mentalHealthConfidence: { type: "integer", minimum: 50, maximum: 95 },
                },
                required: ["primaryEmotion", "confidence", "sentiment", "intensity", "insight", "suggestions", "safetyAlert", "mentalHealthClassification", "mentalHealthConfidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_emotion" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI returned unexpected format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-emotion error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
