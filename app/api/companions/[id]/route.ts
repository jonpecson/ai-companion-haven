import { NextResponse } from "next/server";

const GO_BACKEND_URL = process.env.BACKEND_URL || "https://ai-companion-haven.onrender.com";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${GO_BACKEND_URL}/api/companions/${params.id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Companion not found" },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Backend error:", error);
    return NextResponse.json(
      { error: "Failed to fetch companion" },
      { status: 500 }
    );
  }
}
