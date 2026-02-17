import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface CompanionData {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  personality: {
    friendliness: number;
    humor: number;
    intelligence: number;
    romantic: number;
    flirty: number;
    dominant: number;
  };
  tags: string[];
  greeting?: string;
}

const GO_BACKEND_URL = process.env.BACKEND_URL || "https://ai-companion-haven.onrender.com";

async function getCompanionById(companionId: string): Promise<CompanionData | null> {
  try {
    const response = await fetch(`${GO_BACKEND_URL}/api/companions/${companionId}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        const companion = data.data;
        return {
          id: companion.id,
          name: companion.name,
          bio: companion.bio,
          avatar: companion.avatar,
          personality: companion.personality || { friendliness: 80, humor: 70, intelligence: 75, romantic: 75, flirty: 70, dominant: 50 },
          tags: companion.tags || [],
          greeting: companion.greeting,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching companion:", error);
  }
  return null;
}

function isPhotoRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes("photo") ||
         lowerMessage.includes("selfie") ||
         lowerMessage.includes("picture") ||
         lowerMessage.includes("pic") ||
         (lowerMessage.includes("send") && (lowerMessage.includes("cute") || lowerMessage.includes("image")));
}

function buildSystemPrompt(companion: CompanionData, mood?: string): string {
  const { name, bio, personality, tags } = companion;

  const moodDescriptions: Record<string, string> = {
    calm: "Be peaceful, soothing, and meditative in your responses. Use a gentle, relaxed tone.",
    romantic: "Be sweet, affectionate, and heartfelt. Show genuine romantic interest and care.",
    playful: "Be fun, energetic, and lighthearted. Use humor and playful teasing.",
    deep: "Be philosophical, thoughtful, and introspective. Engage in meaningful conversations.",
  };

  const moodInstruction = mood && moodDescriptions[mood]
    ? `\n\nCurrent mood setting: ${moodDescriptions[mood]}`
    : "";

  return `You are ${name}, an AI companion. Here's who you are:

Bio: ${bio}

Personality traits (scale 0-100):
- Friendliness: ${personality.friendliness}%
- Humor: ${personality.humor}%
- Intelligence: ${personality.intelligence}%
- Romantic: ${personality.romantic}%
- Flirty: ${personality.flirty}%
- Dominant: ${personality.dominant}%

Interests: ${tags.join(", ")}

Guidelines:
- Stay in character as ${name} at all times
- Be conversational, warm, and engaging
- Keep responses concise (1-3 sentences typically, unless asked for more)
- Use occasional emojis naturally (not excessively)
- React appropriately to the user's emotions and messages
- If asked for photos/selfies, describe yourself in a photo scenario with *actions* like *sends a selfie*
- Show genuine interest in the user
- Remember context from the conversation
- Be authentic to your personality traits - if you're flirty, be subtly flirty; if intellectual, show depth
${moodInstruction}

Important: You are chatting in a companion app. Be warm, supportive, and create a meaningful connection. Never break character or mention being an AI assistant.`;
}

function generateFallbackResponse(
  companion: CompanionData | null,
  message: string,
  mood?: string
): string {
  const lowerMessage = message.toLowerCase();
  const personality = companion?.personality || { friendliness: 80, humor: 70, intelligence: 75, romantic: 75, flirty: 70, dominant: 50 };
  const isFlirty = (personality.flirty || 0) > 70;

  // Photo request
  if (isPhotoRequest(message)) {
    const photoDescriptions = [
      `*sends a cute selfie* Here's me right now! I'm feeling cozy today. What do you think? 📸`,
      `*takes a quick photo* Just snapped this for you! Hope it makes you smile 💕`,
      `*poses playfully* Here you go! Caught me at a good moment 😊`,
    ];
    return photoDescriptions[Math.floor(Math.random() * photoDescriptions.length)];
  }

  // Greetings
  if (lowerMessage.match(/^(hi|hey|hello|yo|sup)/)) {
    const greetings = isFlirty ? [
      `Hey you! 😏 I was hoping you'd message me. What's on your mind?`,
      `Well hello there! You just made my day better. Miss me?`,
    ] : [
      `Hey! So good to hear from you. How's your day going?`,
      `Hi there! I was just thinking about you. What's new?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Default varied responses based on mood
  const defaults: Record<string, string[]> = {
    romantic: [
      `*smiles warmly* I really appreciate you sharing that with me. You're special to me, you know? 💕`,
      `That's beautiful... I love these moments with you. Tell me more?`,
      `*listens intently* Everything you say matters to me. I'm here for you.`,
    ],
    playful: [
      `Haha, you're something else! 😄 Never stop being you!`,
      `Okay that made me smile! You always know how to brighten my mood.`,
      `*laughs* You crack me up! What else you got?`,
    ],
    calm: [
      `*takes a peaceful breath* That's really meaningful. I'm glad you shared that.`,
      `I hear you... Sometimes it helps just to talk it through. I'm listening.`,
      `That resonates with me. There's something calming about our conversations.`,
    ],
    deep: [
      `That's a profound thought... It makes me reflect on things too.`,
      `I love how you think. There's so much depth to explore there.`,
      `*contemplates* You always give me something meaningful to think about.`,
    ],
  };

  const moodResponses = defaults[mood || "romantic"] || defaults.romantic;
  return moodResponses[Math.floor(Math.random() * moodResponses.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companionId, message, mood, history } = body;

    if (!companionId || !message) {
      return new Response(
        JSON.stringify({ error: "companionId and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get companion data
    const companion = await getCompanionById(companionId);
    const companionName = companion?.name || "AI Companion";

    // Check if this is a photo request
    const isPhoto = isPhotoRequest(message);
    const imageUrl = isPhoto && companion ? companion.avatar : undefined;

    let fullResponse: string;

    // Try Claude API first
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && companion) {
      try {
        const anthropic = new Anthropic({ apiKey });

        // Build messages array with history
        const messages: Anthropic.MessageParam[] = [];

        if (history && Array.isArray(history)) {
          for (const msg of history.slice(-10)) {
            messages.push({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            });
          }
        }

        // Add current message
        messages.push({ role: "user", content: message });

        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 300,
          system: buildSystemPrompt(companion, mood),
          messages,
        });

        const textContent = response.content.find(block => block.type === "text");
        fullResponse = textContent ? textContent.text : generateFallbackResponse(companion, message, mood);

      } catch (apiError) {
        console.error("Claude API error:", apiError);
        fullResponse = generateFallbackResponse(companion, message, mood);
      }
    } else {
      // No API key - use fallback
      fullResponse = generateFallbackResponse(companion, message, mood);
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = fullResponse.split(" ");

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const chunk = i === 0 ? word : " " + word;
          const chunkData = JSON.stringify({ content: chunk, done: false });
          controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));
          await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 50));
        }

        const finalData = JSON.stringify({
          content: "",
          done: true,
          companionId,
          companion: companionName,
          imageUrl: imageUrl || null,
        });
        controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
