import { NextResponse } from "next/server";

// Generate a slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      category,
      bio,
      avatar,
      personality,
      tags,
      age,
      greeting,
      scenario,
      communicationStyle,
      interests,
      appearance
    } = body;

    // Validate required fields
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name is required and must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!category || !["girls", "guys", "anime"].includes(category)) {
      return NextResponse.json(
        { error: "Category must be one of: girls, guys, anime" },
        { status: 400 }
      );
    }

    if (!age || age < 18 || age > 100) {
      return NextResponse.json(
        { error: "Age must be between 18 and 100" },
        { status: 400 }
      );
    }

    // Generate ID from name
    const baseSlug = generateSlug(name);
    const id = baseSlug + "-" + Date.now().toString(36);

    // Create the companion object
    const companion = {
      id,
      name,
      category,
      bio: bio || `Meet ${name}, your new AI companion!`,
      avatar: avatar || "/images/companions/default.jpg",
      personality: personality || {
        friendliness: 75,
        humor: 60,
        intelligence: 70,
        romantic: 65,
        flirty: 50,
      },
      tags: tags || ["Friendly"],
      age,
      status: "online" as const,
      greeting: greeting || null,
      scenario: scenario || null,
      communicationStyle: communicationStyle || "friendly",
      interests: interests || [],
      appearance: appearance || {},
      createdAt: new Date().toISOString(),
    };

    // In a real app, we'd save this to a database
    // For now, we return success with the created companion
    return NextResponse.json({ data: companion }, { status: 201 });
  } catch (error) {
    console.error("Error creating companion:", error);
    return NextResponse.json(
      { error: "Failed to create companion" },
      { status: 500 }
    );
  }
}
