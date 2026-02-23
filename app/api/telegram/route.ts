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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "OpenAI API key is not set. Add OPENAI_API_KEY in Vercel env.";
  }

  const systemPrompt = `You are a helpful assistant for the Lowcore client dashboard project (Next.js, Supabase, Vercel). You help with the app at app.lowcoresystems.com: client portal, admin dashboard, Retell/Twilio webhooks, and Supabase. Keep answers short and actionable.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    return `Sorry, the AI returned an error. Check OPENAI_API_KEY and logs. (${res.status})`;
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data?.choices?.[0]?.message?.content?.trim();
  return content || "No response.";
}
