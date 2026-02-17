import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

async function getCompanionById(companionId: string): Promise<{ name: string; avatar: string } | null> {
  try {
    const result = await pool.query(
      "SELECT name, avatar_url FROM companions WHERE id = $1",
      [companionId]
    );
    if (result.rows.length > 0) {
      return {
        name: result.rows[0].name,
        avatar: result.rows[0].avatar_url,
      };
    }
  } catch (error) {
    console.error("Database error:", error);
  }
  return null;
}

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

    // Get companion data from database
    const companion = await getCompanionById(companionId);
    const imageUrl = companion?.avatar || "/images/companions/default.jpg";
    const companionName = companion?.name || "AI Companion";

    // Simulate a small delay like real image generation
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      data: {
        imageUrl,
        companionId,
        companion: companionName,
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
