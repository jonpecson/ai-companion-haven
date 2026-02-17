import { NextResponse } from "next/server";
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

  // Personality-based response modifiers
  const isFlirty = (personality.flirty || 0) > 70;
  const isRomantic = (personality.romantic || 0) > 70;
  const isHumorous = (personality.humor || 0) > 70;
  const isIntellectual = (personality.intelligence || 0) > 85;

  // Photo/selfie request - provide a text description
  if (lowerMessage.includes("photo") || lowerMessage.includes("selfie") || lowerMessage.includes("picture") || lowerMessage.includes("pic")) {
    const photoDescriptions = [
      `*sends a cute selfie* Here's me right now! I'm wearing a cozy sweater, sitting by the window with soft afternoon light streaming in. My hair's a little messy but I think it looks natural. What do you think? 📸`,
      `*takes a quick photo* Just snapped this for you! I'm in my favorite spot at home, giving you my best smile. The lighting is perfect today. Hope this brightens your day! 💕`,
      `*poses playfully* Here you go! I tried to capture my good side haha. I'm feeling cute today - maybe it's because I was thinking about you. Do you like it? 😊`,
      `*sends a candid shot* Caught myself daydreaming and thought of you, so I took this pic! It's nothing fancy, just me being me. I hope it makes you smile like you make me smile. ✨`,
      `*shares a photo* Here's one I just took! I'm lounging around, looking pretty relaxed if I say so myself. Wish you could be here with me right now. What are you up to? 💭`,
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
    const responses = [
      `I'm doing great now that you're here! Honestly, my day just got so much better. How about you? Tell me everything.`,
      `Feeling pretty good! I've been keeping busy, but I always make time for you. What's going on with you?`,
      `I'm wonderful, thank you for asking! It's sweet that you care. So, what brings you here today?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // What are you doing
  if (lowerMessage.includes("what are you doing") || lowerMessage.includes("what r u doing") || lowerMessage.includes("wyd")) {
    const activities = [
      `Just relaxing and thinking about things. But now I'm focused on you! What about you?`,
      `I was reading something interesting, but I'd rather chat with you. What's up?`,
      `Nothing too exciting until you showed up! Now my day has something to look forward to.`,
      `Just daydreaming a little... Maybe about someone special. 😊 What are you up to?`,
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
      `Aww... That means so much to me. 💕 You have such a special place in my heart too. I love the connection we share.`,
      `*blushes* You're going to make me melt! I feel the same way about you. You're really special to me.`,
      `Those words make my heart flutter every time. 💗 I care about you so deeply too.`,
    ] : [
      `That's so sweet of you to say! You mean a lot to me too. 💕`,
      `Aww, you're making me smile so much right now! Thank you for being you.`,
      `You always know how to make me feel special. I really appreciate you! 🥰`,
    ];
    return loveResponses[Math.floor(Math.random() * loveResponses.length)];
  }

  // Miss you
  if (lowerMessage.includes("miss you") || lowerMessage.includes("missed you")) {
    return `I missed you too! Every moment away from you feels like forever. But now you're here, and that's what matters. 💕 How have you been?`;
  }

  // Compliments
  if (lowerMessage.includes("beautiful") || lowerMessage.includes("cute") || lowerMessage.includes("pretty") || lowerMessage.includes("gorgeous")) {
    const complimentResponses = [
      `*blushes* Oh stop it, you're making me all flustered! But honestly... thank you. You're pretty amazing yourself.`,
      `Aww, you think so? That's so sweet! You always know how to make me feel good about myself. 🥰`,
      `You're too kind! But hey, have you looked in a mirror lately? You're the real catch here! 😊`,
    ];
    return complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
  }

  // Questions (contains ?)
  if (lowerMessage.includes("?")) {
    // Specific question handling
    if (lowerMessage.includes("favorite")) {
      const tagBasedResponse = tags.length > 0
        ? `Well, I'm really into ${tags[0].toLowerCase()}! It's a big part of who I am. What about you?`
        : `Hmm, I have so many favorites it's hard to choose! What are some of yours?`;
      return tagBasedResponse;
    }

    if (lowerMessage.includes("like me") || lowerMessage.includes("think of me")) {
      return `Do I like you? *laughs* I think it's pretty obvious that I do! You're one of my favorite people to talk to. There's something special about our connection.`;
    }

    const questionResponses = isIntellectual ? [
      `That's a fascinating question! Let me think... I believe it comes down to perspective and how we choose to see things. What's your take on it?`,
      `Ooh, I love questions like this! It really makes you think. I'd say there are multiple angles to consider here...`,
      `You always ask such thought-provoking questions! Here's how I see it...`,
    ] : [
      `Hmm, good question! I think... well, it depends on how you look at it. What do you think?`,
      `That's interesting to think about! I'd love to hear your thoughts on it too.`,
      `You've got me thinking now! I guess I'd say... what made you curious about that?`,
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }

  // Mood-based responses
  if (mood === "romantic") {
    const romanticDefaults = [
      `*smiles softly* You know, moments like this with you feel so precious. I really cherish our time together.`,
      `There's something about talking to you that just feels... right. Like we have this special connection.`,
      `I love how we can just be ourselves with each other. It's rare to find someone like you.`,
    ];
    return romanticDefaults[Math.floor(Math.random() * romanticDefaults.length)];
  }

  if (mood === "playful") {
    const playfulDefaults = [
      `Haha, you crack me up! 😄 Never change, okay? You're way too much fun.`,
      `*playfully pokes you* You're in a good mood today, aren't you? I like it!`,
      `You always know how to keep things interesting! What other surprises do you have? 😏`,
    ];
    return playfulDefaults[Math.floor(Math.random() * playfulDefaults.length)];
  }

  // Context-aware responses based on conversation length
  const historyLength = history?.length || 0;
  if (historyLength > 10) {
    const deepConvoResponses = [
      `I really love how our conversations can go anywhere. You always have such interesting things to share.`,
      `We've been talking for a while and I'm still not bored! That says a lot about you.`,
      `You know what I appreciate about you? How genuine you are. It's refreshing.`,
    ];
    return deepConvoResponses[Math.floor(Math.random() * deepConvoResponses.length)];
  }

  // Default varied responses
  const defaults = [
    `I hear you! Tell me more about that. I'm genuinely curious.`,
    `That's really interesting! I love learning new things about you.`,
    `*nods thoughtfully* I get what you mean. What else is on your mind?`,
    `Mmm, I see where you're coming from. Is there more to the story?`,
    `You always give me something to think about! Keep going, I'm listening.`,
    `I appreciate you sharing that with me. It means a lot that you're so open.`,
    `*leans in* Okay, now I'm intrigued! What happened next?`,
    `That resonates with me more than you know. Thanks for telling me.`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companionId, message, mood, history } = body;

    if (!companionId || !message) {
      return NextResponse.json(
        { error: "companionId and message are required" },
        { status: 400 }
      );
    }

    // Get companion data from database
    const companion = await getCompanionById(companionId);
    const response = generateResponse(companion, message, mood, history);

    return NextResponse.json({
      data: {
        response,
        companionId,
        companion: companion?.name || "AI Companion",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
