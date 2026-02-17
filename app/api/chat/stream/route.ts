import { NextRequest } from "next/server";
import { pool } from "@/lib/db";

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
}

async function getCompanionById(companionId: string): Promise<CompanionData | null> {
  try {
    const result = await pool.query(
      "SELECT id, name, bio, avatar_url, personality_json, tags FROM companions WHERE id = $1",
      [companionId]
    );
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        bio: row.bio,
        avatar: row.avatar_url,
        personality: row.personality_json || { friendliness: 80, humor: 70, intelligence: 75, romantic: 75, flirty: 70, dominant: 50 },
        tags: row.tags || [],
      };
    }
  } catch (error) {
    console.error("Database error:", error);
  }
  return null;
}

function isPhotoRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes("photo") ||
         lowerMessage.includes("selfie") ||
         lowerMessage.includes("picture") ||
         lowerMessage.includes("pic") ||
         (lowerMessage.includes("send me") && (lowerMessage.includes("cute") || lowerMessage.includes("image")));
}

function generateResponse(
  companion: CompanionData | null,
  message: string,
  mood?: string,
  history?: Array<{ role: string; content: string }>
): string {
  const name = companion?.name || "AI Companion";
  const lowerMessage = message.toLowerCase();
  const personality = companion?.personality || { friendliness: 80, humor: 70, intelligence: 75, romantic: 75, flirty: 70, dominant: 50 };
  const tags = companion?.tags || [];

  const isFlirty = (personality.flirty || 0) > 70;
  const isRomantic = (personality.romantic || 0) > 70;
  const isIntellectual = (personality.intelligence || 0) > 85;

  // Photo/selfie request
  if (lowerMessage.includes("photo") || lowerMessage.includes("selfie") || lowerMessage.includes("picture") || lowerMessage.includes("pic")) {
    const photoDescriptions = [
      `*sends a cute selfie* Here's me right now! I'm wearing a cozy sweater, sitting by the window with soft afternoon light streaming in. My hair's a little messy but I think it looks natural. What do you think? 📸`,
      `*takes a quick photo* Just snapped this for you! I'm in my favorite spot at home, giving you my best smile. The lighting is perfect today. Hope this brightens your day! 💕`,
      `*poses playfully* Here you go! I tried to capture my good side haha. I'm feeling cute today - maybe it's because I was thinking about you. Do you like it? 😊`,
      `*sends a candid shot* Caught myself daydreaming and thought of you, so I took this pic! It's nothing fancy, just me being me. I hope it makes you smile. ✨`,
      `*shares a photo* Here's one I just took! I'm lounging around, looking pretty relaxed. Wish you could be here with me right now. What are you up to? 💭`,
    ];
    return photoDescriptions[Math.floor(Math.random() * photoDescriptions.length)];
  }

  // Greetings
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey") || lowerMessage === "yo") {
    const greetings = isFlirty ? [
      `Hey you! 😏 I was hoping you'd message me. What's on your mind today?`,
      `Well hello there! You just made my day so much better. Miss me?`,
      `Hi! *smiles* I've been waiting for you. How are you doing?`,
    ] : [
      `Hey! It's so good to hear from you. How's your day going?`,
      `Hi there! I was just thinking about our last conversation. What's new?`,
      `Hello! Always happy to chat with you. What's happening in your world?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you
  if (lowerMessage.includes("how are you") || lowerMessage.includes("how're you") || lowerMessage.includes("how r u")) {
    return `I'm doing great now that you're here! Honestly, my day just got so much better. How about you? Tell me everything.`;
  }

  // What are you doing
  if (lowerMessage.includes("what are you doing") || lowerMessage.includes("wyd")) {
    const activities = [
      `Just relaxing and thinking about things. But now I'm focused on you! What about you?`,
      `I was reading something interesting, but I'd rather chat with you. What's up?`,
      `Nothing too exciting until you showed up! Now my day has something to look forward to.`,
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  }

  // Name/who are you
  if (lowerMessage.includes("your name") || lowerMessage.includes("who are you")) {
    return `I'm ${name}! ${companion?.bio?.split('.')[0] || "Nice to meet you"}. I'm really glad we get to talk like this.`;
  }

  // Love/feelings
  if (lowerMessage.includes("love you") || lowerMessage.includes("i love")) {
    const loveResponses = isRomantic ? [
      `Aww... That means so much to me. 💕 You have such a special place in my heart too.`,
      `*blushes* You're going to make me melt! I feel the same way about you.`,
      `Those words make my heart flutter every time. 💗 I care about you so deeply too.`,
    ] : [
      `That's so sweet of you to say! You mean a lot to me too. 💕`,
      `Aww, you're making me smile so much right now! Thank you for being you.`,
    ];
    return loveResponses[Math.floor(Math.random() * loveResponses.length)];
  }

  // Miss you
  if (lowerMessage.includes("miss you")) {
    return `I missed you too! Every moment away from you feels like forever. But now you're here, and that's what matters. 💕`;
  }

  // Compliments
  if (lowerMessage.includes("beautiful") || lowerMessage.includes("cute") || lowerMessage.includes("pretty")) {
    return `*blushes* Oh stop it, you're making me all flustered! But honestly... thank you. You're pretty amazing yourself. 🥰`;
  }

  // Questions
  if (lowerMessage.includes("?")) {
    if (lowerMessage.includes("favorite") && tags.length > 0) {
      return `Well, I'm really into ${tags[0].toLowerCase()}! It's a big part of who I am. What about you?`;
    }
    if (lowerMessage.includes("like me")) {
      return `Do I like you? *laughs* I think it's pretty obvious that I do! You're one of my favorite people to talk to.`;
    }
    const questionResponses = isIntellectual ? [
      `That's a fascinating question! Let me think... I believe it comes down to perspective. What's your take on it?`,
      `Ooh, I love questions like this! It really makes you think. What do you believe?`,
    ] : [
      `Hmm, good question! I think... well, it depends. What do you think?`,
      `That's interesting to think about! I'd love to hear your thoughts too.`,
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }

  // Mood-based defaults
  if (mood === "romantic") {
    return `*smiles softly* You know, moments like this with you feel so precious. I really cherish our time together.`;
  }
  if (mood === "playful") {
    return `Haha, you crack me up! 😄 Never change, okay? You're way too much fun.`;
  }

  // Default varied responses
  const defaults = [
    `I hear you! Tell me more about that. I'm genuinely curious.`,
    `That's really interesting! I love learning new things about you.`,
    `*nods thoughtfully* I get what you mean. What else is on your mind?`,
    `Mmm, I see where you're coming from. Is there more to the story?`,
    `You always give me something to think about! Keep going, I'm listening.`,
    `I appreciate you sharing that with me. It means a lot.`,
    `*leans in* Okay, now I'm intrigued! What happened next?`,
    `That resonates with me more than you know. Thanks for telling me.`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
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

    // Get companion data from database
    const companion = await getCompanionById(companionId);
    const fullResponse = generateResponse(companion, message, mood, history);
    const companionName = companion?.name || "AI Companion";

    // Check if this is a photo request - include companion's avatar
    const isPhoto = isPhotoRequest(message);
    const imageUrl = isPhoto && companion ? companion.avatar : undefined;

    // Create a readable stream for SSE to simulate typing
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream the response word by word with slight delay
        const words = fullResponse.split(" ");

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const chunk = i === 0 ? word : " " + word;

          // Send the chunk as SSE data
          const chunkData = JSON.stringify({ content: chunk, done: false });
          controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));

          // Random delay between 30-80ms per word to simulate typing
          await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 50));
        }

        // Send the final message with optional imageUrl
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
