import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://ai-companion-haven.onrender.com";

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

    // Call the backend API to get the AI response
    console.log(`[Stream] Calling backend: ${BACKEND_URL}/api/chat/public`);

    const backendResponse = await fetch(`${BACKEND_URL}/api/chat/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companionId,
        message,
        mood: mood || "romantic",
        history: history || [],
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`[Stream] Backend error ${backendResponse.status}:`, errorText);
      throw new Error(`Backend returned ${backendResponse.status}: ${errorText}`);
    }

    const data = await backendResponse.json();
    console.log(`[Stream] Got response from backend:`, data.data?.response?.substring(0, 50));
    const fullResponse = data.data?.response || "Hey there! I'm happy to chat with you.";
    const companionName = data.data?.companion || "AI Companion";

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

        // Send the final message
        const finalData = JSON.stringify({
          content: "",
          done: true,
          companionId,
          companion: companionName,
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
