import { NextResponse } from "next/server";

const TELEGRAM_API = "https://api.telegram.org/bot";

/** Optional: only respond to this Telegram user id (get it from webhook update). */
const ALLOWED_USER_IDS = new Set(
  (process.env.TELEGRAM_ALLOWED_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean)
);

export async function POST(req: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
    }

    const body = await req.json();
    const message = body?.message;
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id;
    const fromId = message.from?.id;
    const text = String(message.text).trim();

    if (!chatId) return NextResponse.json({ ok: true });

    if (ALLOWED_USER_IDS.size > 0 && fromId && !ALLOWED_USER_IDS.has(String(fromId))) {
      await sendTelegram(token, chatId, "You're not authorized to use this bot.");
      return NextResponse.json({ ok: true });
    }

    const reply = await getAIReply(text);
    await sendTelegram(token, chatId, reply);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function sendTelegram(token: string, chatId: number, text: string) {
  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Telegram sendMessage: ${res.status} ${t}`);
  }
}

async function getAIReply(userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return "OpenAI API key is not set. In Vercel → Settings → Environment Variables, add OPENAI_API_KEY with your key from platform.openai.com, then redeploy.";
  }

  const systemPrompt = `You are a helpful assistant for the Lowcore client dashboard project (Next.js, Supabase, Vercel). You help with the app at app.lowcoresystems.com: client portal, admin dashboard, Retell/Twilio webhooks, and Supabase. Keep answers short and actionable.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
    }),
  });

  const bodyText = await res.text();

  if (!res.ok) {
    console.error("OpenAI API error:", res.status, bodyText);
    let hint = "";
    try {
      const err = JSON.parse(bodyText) as { error?: { message?: string; code?: string } };
      const msg = err?.error?.message || "";
      if (res.status === 401 || msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("incorrect")) {
        hint = " Your OPENAI_API_KEY may be wrong or expired. Get a new key at platform.openai.com.";
      } else if (res.status === 429) {
        hint = " Rate limit or quota. Check usage at platform.openai.com.";
      } else if (msg.toLowerCase().includes("model")) {
        hint = " Try setting OPENAI_MODEL to gpt-3.5-turbo in Vercel env.";
      }
    } catch {
      // ignore parse error
    }
    return `OpenAI error (${res.status}).${hint} Check Vercel → Deployments → Logs for details.`;
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = JSON.parse(bodyText);
  } catch {
    return "OpenAI returned invalid JSON. Check Vercel logs.";
  }
  const content = data?.choices?.[0]?.message?.content?.trim();
  return content || "No response.";
}
