import type {
  User,
  Companion,
  Story,
  Message,
  Memory,
  Mood,
  Conversation,
  ApiResponse,
  PaginatedResponse
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    fetchApi<ApiResponse<{ user: User; token: string }>>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchApi<ApiResponse<{ user: User; token: string }>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<ApiResponse<User>>("/api/auth/me"),
};

// Companions API
export const companionsApi = {
  list: (params?: { category?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    return fetchApi<PaginatedResponse<Companion>>(`/api/companions?${searchParams}`);
  },

  get: (id: string) => fetchApi<ApiResponse<Companion>>(`/api/companions/${id}`),

  create: (data: Partial<Companion>) =>
    fetchApi<ApiResponse<Companion>>("/api/companions/custom", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Stories API
export const storiesApi = {
  list: () => fetchApi<ApiResponse<Story[]>>("/api/stories"),

  getByCompanion: (companionId: string) =>
    fetchApi<ApiResponse<Story[]>>(`/api/stories/${companionId}`),

  markViewed: (storyId: string) =>
    fetchApi<ApiResponse<void>>("/api/stories/view", {
      method: "POST",
      body: JSON.stringify({ storyId }),
    }),
};

// Chat API
export const chatApi = {
  start: (companionId: string) =>
    fetchApi<ApiResponse<Conversation>>("/api/chat/start", {
      method: "POST",
      body: JSON.stringify({ companionId }),
    }),

  sendMessage: (conversationId: string, content: string) =>
    fetchApi<ApiResponse<{ userMessage: Message; aiMessage: Message }>>("/api/chat/message", {
      method: "POST",
      body: JSON.stringify({ conversationId, content }),
    }),

  getHistory: (companionId: string, params?: { page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    return fetchApi<PaginatedResponse<Message>>(`/api/chat/history/${companionId}?${searchParams}`);
  },

  // Get all conversations
  getConversations: () =>
    fetchApi<ApiResponse<Conversation[]>>("/api/chat/conversations"),

  // Public chat (no auth required)
  publicChat: (data: {
    companionId: string;
    message: string;
    history?: { role: string; content: string }[];
    mood?: string;
  }) =>
    fetchApi<ApiResponse<{ response: string; companionId: string; companion: string }>>("/api/chat/public", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Memories API
export const memoriesApi = {
  list: (params?: { page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    return fetchApi<PaginatedResponse<Memory>>(`/api/memories?${searchParams}`);
  },
};

// Images API
export const imagesApi = {
  generate: (data: {
    companionId: string;
    photoType?: 'selfie' | 'portrait' | 'full_body' | 'candid' | 'flirty' | 'cute' | 'romantic';
    context?: string;
  }) =>
    fetchApi<ApiResponse<{ imageUrl: string; companionId: string; companion: string; photoType: string }>>("/api/images/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Moods API
export const moodsApi = {
  set: (moodType: string) =>
    fetchApi<ApiResponse<Mood>>("/api/moods", {
      method: "POST",
      body: JSON.stringify({ moodType }),
    }),

  get: () => fetchApi<ApiResponse<Mood>>("/api/moods"),
};
