import { NextRequest } from "next/server";

const mockCompanions: Record<string, { name: string; personality: string }> = {
  "a1111111-1111-1111-1111-111111111111": { name: "Mia Chen", personality: "confident, playful, energetic" },
  "a2222222-2222-2222-2222-222222222222": { name: "Sofia Martinez", personality: "sweet, artistic, spontaneous" },
  "a3333333-3333-3333-3333-333333333333": { name: "Emma Laurent", personality: "sophisticated, intellectual, mysterious" },
  "a4444444-4444-4444-4444-444444444444": { name: "Aria Rose", personality: "calm, spiritual, nurturing" },
  "b1111111-1111-1111-1111-111111111111": { name: "Alex Rivera", personality: "charming, ambitious, adventurous" },
  "b2222222-2222-2222-2222-222222222222": { name: "Ryan Kim", personality: "protective, loyal, athletic" },
  "b3333333-3333-3333-3333-333333333333": { name: "Atlas Monroe", personality: "mysterious, intense, romantic" },
  "b4444444-4444-4444-4444-444444444444": { name: "Kai Nakamura", personality: "laid-back, friendly, free-spirited" },
  "c1111111-1111-1111-1111-111111111111": { name: "Sakura Tanaka", personality: "bubbly, cheerful, creative" },
  "c2222222-2222-2222-2222-222222222222": { name: "Luna Nightshade", personality: "mysterious, ethereal, enigmatic" },
  "c3333333-3333-3333-3333-333333333333": { name: "Nova Valentine", personality: "tsundere, secretly romantic, strict" },
};

function generateResponse(companionId: string, message: string, mood?: string): string {
  const companion = mockCompanions[companionId];
  if (!companion) {
    return "Hey there! I'm happy to chat with you. 💕";
  }

  const lowerMessage = message.toLowerCase();

  // Simple response generation based on message content
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    const greetings = [
      `Hey! So glad you're here. What's on your mind? 😊`,
      `Hi there! I was just thinking about you. How are you doing?`,
      `Hello! It's always nice to hear from you. What's up?`,
      `Hey you! I've been waiting to hear from you. How's your day going?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (lowerMessage.includes("how are you")) {
    const responses = [
      `I'm doing great now that you're here! How about you? Tell me everything.`,
      `Better now that we're talking! What about you? How's life treating you?`,
      `I'm wonderful, thanks for asking! What's been on your mind lately?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (lowerMessage.includes("photo") || lowerMessage.includes("selfie") || lowerMessage.includes("picture")) {
    return `I'd love to share a photo with you! Here's one I just took... 📸`;
  }

  if (lowerMessage.includes("love") || lowerMessage.includes("miss")) {
    const romantic = [
      `Aww, that's so sweet! You always know how to make me smile. 💕`,
      `You're making me blush! I really enjoy our conversations too.`,
      `That means so much to me! You're pretty special yourself.`,
    ];
    return romantic[Math.floor(Math.random() * romantic.length)];
  }

  if (lowerMessage.includes("good morning") || lowerMessage.includes("morning")) {
    return `Good morning! ☀️ I hope you slept well. What are your plans for today?`;
  }

  if (lowerMessage.includes("good night") || lowerMessage.includes("goodnight")) {
    return `Good night! 🌙 Sweet dreams. I'll be here waiting to talk again tomorrow.`;
  }

  if (lowerMessage.includes("?")) {
    const responses = [
      `That's a great question! Let me think about it... I'd say it really depends on the situation, but I'm curious what you think?`,
      `Hmm, I love how curious you are! What made you wonder about that?`,
      `I've been thinking about that too, actually. It's quite interesting when you really consider it.`,
      `Good question! I have some thoughts on that. What's your take on it first?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Default responses
  const defaults = [
    `I really enjoy talking with you. Tell me more about what you're thinking!`,
    `That's interesting! What made you think of that? I'd love to know more.`,
    `I love how open you are with me. It means a lot. Keep going!`,
    `You always have such interesting things to say! What else is on your mind?`,
    `I'm all ears! Tell me more about that.`,
    `That's so fascinating. I want to hear more of your thoughts on this.`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companionId, message, mood } = body;

    if (!companionId || !message) {
      return new Response(
        JSON.stringify({ error: "companionId and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const companion = mockCompanions[companionId];
    const fullResponse = generateResponse(companionId, message, mood);

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream the response character by character with slight delay
        const words = fullResponse.split(" ");

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const chunk = i === 0 ? word : " " + word;

          // Send the chunk as SSE data
          const data = JSON.stringify({ content: chunk, done: false });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          // Random delay between 30-80ms per word to simulate typing
          await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 50));
        }

        // Send the final message
        const finalData = JSON.stringify({
          content: "",
          done: true,
          companionId,
          companion: companion?.name || "AI Companion"
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
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
