import { NextResponse } from "next/server";

const GO_BACKEND_URL = process.env.BACKEND_URL || "https://ai-companion-haven.onrender.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const response = await fetch(`${GO_BACKEND_URL}/api/companions?${searchParams}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Backend error:", error);
    return NextResponse.json(
      { error: "Failed to fetch companions" },
      { status: 500 }
    );
  }
}
