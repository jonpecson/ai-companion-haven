import { NextResponse } from "next/server";

const mockCompanions: Record<string, { name: string; personality: string }> = {
  "mia-chen": { name: "Mia Chen", personality: "confident, playful, energetic" },
  "sofia-martinez": { name: "Sofia Martinez", personality: "sweet, artistic, spontaneous" },
  "emma-laurent": { name: "Emma Laurent", personality: "sophisticated, intellectual, mysterious" },
  "aria-rose": { name: "Aria Rose", personality: "calm, spiritual, nurturing" },
  "alex-rivera": { name: "Alex Rivera", personality: "charming, ambitious, adventurous" },
  "ryan-kim": { name: "Ryan Kim", personality: "protective, loyal, athletic" },
  "atlas-monroe": { name: "Atlas Monroe", personality: "mysterious, intense, romantic" },
  "kai-nakamura": { name: "Kai Nakamura", personality: "laid-back, friendly, free-spirited" },
  "sakura-tanaka": { name: "Sakura Tanaka", personality: "bubbly, cheerful, creative" },
  "luna-nightshade": { name: "Luna Nightshade", personality: "mysterious, ethereal, enigmatic" },
  "nova-valentine": { name: "Nova Valentine", personality: "tsundere, secretly romantic, strict" },
};

const moodResponses: Record<string, string> = {
  calm: "responds thoughtfully and peacefully",
  romantic: "responds sweetly and affectionately",
  playful: "responds with humor and fun energy",
  deep: "responds with philosophical depth",
};

function generateResponse(companionId: string, message: string, mood?: string): string {
  const companion = mockCompanions[companionId];
  if (!companion) {
    return "Hey there! I'm happy to chat with you.";
  }

  const moodStyle = mood ? moodResponses[mood] || "" : "";
  const lowerMessage = message.toLowerCase();

  // Simple response generation based on message content
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    const greetings = [
      `Hey! So glad you're here. What's on your mind?`,
      `Hi there! I was just thinking about you.`,
      `Hello! It's always nice to hear from you.`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (lowerMessage.includes("how are you")) {
    return `I'm doing great now that you're here! How about you?`;
  }

  if (lowerMessage.includes("photo") || lowerMessage.includes("selfie") || lowerMessage.includes("picture")) {
    return `I'd love to share a photo with you! Here's one I just took...`;
  }

  if (lowerMessage.includes("love") || lowerMessage.includes("miss")) {
    return `Aww, that's so sweet! You always know how to make me smile.`;
  }

  if (lowerMessage.includes("?")) {
    const responses = [
      `That's a great question! Let me think about it...`,
      `Hmm, I love how curious you are!`,
      `I've been wondering about that too, actually.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Default responses
  const defaults = [
    `I really enjoy talking with you. Tell me more!`,
    `That's interesting! What made you think of that?`,
    `I love how open you are with me. It means a lot.`,
    `You always have such interesting things to say!`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companionId, message, mood } = body;

    if (!companionId || !message) {
      return NextResponse.json(
        { error: "companionId and message are required" },
        { status: 400 }
      );
    }

    const companion = mockCompanions[companionId];
    const response = generateResponse(companionId, message, mood);

    return NextResponse.json({
      data: {
        response,
        companionId,
        companion: companion?.name || "AI Companion",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
