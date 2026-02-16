import { NextResponse } from "next/server";

// Companion photo collections - multiple images per companion for variety
const companionPhotos: Record<string, string[]> = {
  "mia-chen": ["/images/companions/mia.jpg"],
  "sofia-martinez": ["/images/companions/sofia.jpg"],
  "emma-laurent": ["/images/companions/emma.jpg"],
  "aria-rose": ["/images/companions/aria.jpg"],
  "alex-rivera": ["/images/companions/alex.jpg"],
  "ryan-kim": ["/images/companions/ryan.jpg"],
  "atlas-monroe": ["/images/companions/atlas.jpg"],
  "kai-nakamura": ["/images/companions/kai.jpg"],
  "sakura-tanaka": ["/images/companions/sakura.jpg"],
  "luna-nightshade": ["/images/companions/luna.jpg"],
  "nova-valentine": ["/images/companions/nova.jpg"],
};

const companionNames: Record<string, string> = {
  "mia-chen": "Mia Chen",
  "sofia-martinez": "Sofia Martinez",
  "emma-laurent": "Emma Laurent",
  "aria-rose": "Aria Rose",
  "alex-rivera": "Alex Rivera",
  "ryan-kim": "Ryan Kim",
  "atlas-monroe": "Atlas Monroe",
  "kai-nakamura": "Kai Nakamura",
  "sakura-tanaka": "Sakura Tanaka",
  "luna-nightshade": "Luna Nightshade",
  "nova-valentine": "Nova Valentine",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companionId, photoType } = body;

    if (!companionId) {
      return NextResponse.json(
        { error: "companionId is required" },
        { status: 400 }
      );
    }

    // Get photos for this companion or use defaults
    const photos = companionPhotos[companionId] || ["/images/companions/mia.jpg"];

    // Pick a random photo from the companion's collection
    const randomIndex = Math.floor(Math.random() * photos.length);
    const imageUrl = photos[randomIndex];

    // Simulate a small delay like real image generation
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      data: {
        imageUrl,
        companionId,
        companion: companionNames[companionId] || "AI Companion",
        photoType: photoType || "selfie",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
