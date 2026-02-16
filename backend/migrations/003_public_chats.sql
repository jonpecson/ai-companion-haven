-- Public chats table for demo/anonymous users
CREATE TABLE IF NOT EXISTS public_conversations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    companion_id TEXT NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, companion_id)
);

CREATE TABLE IF NOT EXISTS public_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES public_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'ai')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_public_conversations_session ON public_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_public_messages_conversation ON public_messages(conversation_id);
