// Environment configuration with validation

const isDev = process.env.NODE_ENV === "development";

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    if (typeof window === "undefined") {
      // Only warn on server-side to avoid hydration issues
      console.warn(`Missing environment variable: ${key}`);
    }
    return "";
  }
  return value || fallback || "";
}

export const config = {
  // API Configuration
  apiUrl: getEnvVar("NEXT_PUBLIC_API_URL", isDev ? "" : ""),
  wsUrl: getEnvVar("NEXT_PUBLIC_WS_URL", isDev ? `ws://${typeof window !== "undefined" ? window.location.host : "localhost:8080"}` : ""),

  // App Configuration
  appName: "Nectar AI",
  appVersion: "1.0.0",
  appBuild: "2026.02",

  // Feature Flags
  features: {
    voiceCalls: false,
    videoCalls: false,
    imageSharing: false,
    emojiPicker: false,
    voiceMessages: false,
  },

  // Pagination Defaults
  pagination: {
    defaultPageSize: 50,
    chatHistoryPageSize: 50,
    companionListPageSize: 50,
  },

  // Timeouts (in milliseconds)
  timeouts: {
    apiRequest: 30000,
    websocketReconnect: 30000,
    typingIndicator: 3000,
  },

  // Limits
  limits: {
    maxReconnectAttempts: 5,
    maxChatHistoryContext: 10,
    maxCompanionTags: 4,
  },
} as const;

export type Config = typeof config;
