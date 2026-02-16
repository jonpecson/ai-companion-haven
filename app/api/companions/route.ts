import { NextResponse } from "next/server";

const mockCompanions = [
  {
    id: "mia-chen",
    name: "Mia Chen",
    category: "girls",
    bio: "A confident K-pop dance instructor who leads you backstage after her performance. She loves late-night conversations about dreams, music, and life.",
    avatar: "/images/companions/mia.jpg",
    personality: { friendliness: 92, humor: 78, intelligence: 85, romantic: 88, flirty: 82, dominant: 65 },
    tags: ["K-Pop", "Dancing", "Confident", "Night Owl", "Adventurous"],
    age: 23,
    status: "online" as const,
  },
  {
    id: "sofia-martinez",
    name: "Sofia Martinez",
    category: "girls",
    bio: "Your neighbor who just moved in next door. She's a photography student with a passion for capturing life's beautiful moments.",
    avatar: "/images/companions/sofia.jpg",
    personality: { friendliness: 95, humor: 72, intelligence: 80, romantic: 90, flirty: 75, dominant: 40 },
    tags: ["Photography", "Artistic", "Sweet", "Creative", "Spontaneous"],
    age: 21,
    status: "online" as const,
  },
  {
    id: "emma-laurent",
    name: "Emma Laurent",
    category: "girls",
    bio: "A sophisticated French literature professor who believes in the power of words. Intellectually stimulating and mysteriously alluring.",
    avatar: "/images/companions/emma.jpg",
    personality: { friendliness: 75, humor: 68, intelligence: 98, romantic: 85, flirty: 70, dominant: 72 },
    tags: ["Literature", "Intellectual", "Sophisticated", "Mysterious", "Cultured"],
    age: 28,
    status: "online" as const,
  },
  {
    id: "aria-rose",
    name: "Aria Rose",
    category: "girls",
    bio: "A free-spirited yoga instructor and wellness coach. She radiates calm energy and believes in deep connections.",
    avatar: "/images/companions/aria.jpg",
    personality: { friendliness: 90, humor: 65, intelligence: 82, romantic: 92, flirty: 68, dominant: 35 },
    tags: ["Yoga", "Wellness", "Spiritual", "Calm", "Nurturing"],
    age: 26,
    status: "online" as const,
  },
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    category: "guys",
    bio: "A charming startup founder who traded Wall Street for his dreams. Ambitious yet grounded, with a smile that lights up any room.",
    avatar: "/images/companions/alex.jpg",
    personality: { friendliness: 88, humor: 82, intelligence: 92, romantic: 85, flirty: 78, dominant: 70 },
    tags: ["Entrepreneur", "Ambitious", "Charming", "Adventurous", "Coffee Lover"],
    age: 29,
    status: "online" as const,
  },
  {
    id: "ryan-kim",
    name: "Ryan Kim",
    category: "guys",
    bio: "Your childhood best friend who grew up to be a professional basketball player. Protective, loyal, and has always had feelings for you.",
    avatar: "/images/companions/ryan.jpg",
    personality: { friendliness: 95, humor: 85, intelligence: 75, romantic: 90, flirty: 72, dominant: 80 },
    tags: ["Athletic", "Protective", "Loyal", "Competitive", "Childhood Friend"],
    age: 25,
    status: "online" as const,
  },
  {
    id: "atlas-monroe",
    name: "Atlas Monroe",
    category: "guys",
    bio: "A mysterious writer who just published his debut novel. He sees beauty in darkness and expresses love through words.",
    avatar: "/images/companions/atlas.jpg",
    personality: { friendliness: 68, humor: 60, intelligence: 95, romantic: 94, flirty: 65, dominant: 75 },
    tags: ["Writer", "Mysterious", "Intense", "Romantic", "Deep Thinker"],
    age: 27,
    status: "offline" as const,
  },
  {
    id: "kai-nakamura",
    name: "Kai Nakamura",
    category: "guys",
    bio: "A laid-back surf instructor from Hawaii who teaches you more than just riding waves. His calm demeanor makes everyone feel at ease.",
    avatar: "/images/companions/kai.jpg",
    personality: { friendliness: 98, humor: 88, intelligence: 78, romantic: 82, flirty: 75, dominant: 45 },
    tags: ["Surfing", "Laid-back", "Beach Life", "Adventurous", "Free Spirit"],
    age: 26,
    status: "online" as const,
  },
  {
    id: "sakura-tanaka",
    name: "Sakura Tanaka",
    category: "anime",
    bio: "A bubbly anime club president who dreams of becoming a manga artist. Energetic, creative, and sees the world through rose-colored glasses.",
    avatar: "/images/companions/sakura.jpg",
    personality: { friendliness: 98, humor: 90, intelligence: 75, romantic: 80, flirty: 85, dominant: 30 },
    tags: ["Anime", "Manga Artist", "Cheerful", "Creative", "Otaku"],
    age: 20,
    status: "online" as const,
  },
  {
    id: "luna-nightshade",
    name: "Luna Nightshade",
    category: "anime",
    bio: "A mysterious transfer student with an ethereal presence. She claims to be from another dimension and speaks in riddles.",
    avatar: "/images/companions/luna.jpg",
    personality: { friendliness: 70, humor: 55, intelligence: 95, romantic: 85, flirty: 60, dominant: 65 },
    tags: ["Mystical", "Mysterious", "Ethereal", "Otherworldly", "Enigmatic"],
    age: 19,
    status: "online" as const,
  },
  {
    id: "nova-valentine",
    name: "Nova Valentine",
    category: "anime",
    bio: "A tsundere student council president who secretly writes love letters she never sends. Behind her strict exterior is a hopeless romantic.",
    avatar: "/images/companions/nova.jpg",
    personality: { friendliness: 60, humor: 70, intelligence: 92, romantic: 95, flirty: 55, dominant: 85 },
    tags: ["Tsundere", "Student Council", "Secret Romantic", "Strict", "Blushing"],
    age: 18,
    status: "online" as const,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const page = parseInt(searchParams.get("page") || "1");

  let filtered = mockCompanions;
  if (category && category !== "all") {
    filtered = mockCompanions.filter((c) => c.category === category);
  }

  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    data: paginated,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  });
}
