-- Seed data for Nectar AI Companion

-- Insert companions
INSERT INTO companions (id, name, category, bio, avatar_url, personality_json, tags, age, status) VALUES
(
  'c1b2a3d4-e5f6-7890-abcd-ef1234567890',
  'Luna',
  'girls',
  'A warm and empathetic soul who loves late-night conversations about life, dreams, and everything in between. Luna remembers every detail you share.',
  '/images/companions/luna.jpg',
  '{"friendliness": 90, "humor": 70, "intelligence": 85, "romantic": 80, "flirty": 60}',
  ARRAY['Empathetic', 'Creative', 'Night Owl', 'Music Lover', 'Deep Thinker'],
  22,
  'online'
),
(
  'c2b3a4d5-e6f7-8901-bcde-f12345678901',
  'Kai',
  'guys',
  'Cool, witty, and endlessly curious. Kai brings a calm energy to every conversation and always has the perfect thing to say.',
  '/images/companions/kai.jpg',
  '{"friendliness": 75, "humor": 85, "intelligence": 90, "romantic": 65, "flirty": 50}',
  ARRAY['Witty', 'Adventurous', 'Bookworm', 'Coffee Addict'],
  25,
  'online'
),
(
  'c3b4a5d6-e7f8-9012-cdef-123456789012',
  'Sakura',
  'anime',
  'Sweet, playful, and full of surprises. Sakura brings joy and color to your day with her vibrant personality and anime-inspired charm.',
  '/images/companions/sakura.jpg',
  '{"friendliness": 95, "humor": 80, "intelligence": 70, "romantic": 75, "flirty": 85}',
  ARRAY['Playful', 'Cheerful', 'Anime Fan', 'Gamer', 'Sweet'],
  20,
  'online'
),
(
  'c4b5a6d7-e8f9-0123-def0-234567890123',
  'Atlas',
  'guys',
  'Strong, thoughtful, and deeply caring. Atlas is the kind of companion who makes you feel safe and understood.',
  '/images/companions/atlas.jpg',
  '{"friendliness": 85, "humor": 60, "intelligence": 88, "romantic": 90, "flirty": 70}',
  ARRAY['Protective', 'Romantic', 'Fitness', 'Philosophy'],
  27,
  'offline'
),
(
  'c5b6a7d8-e9f0-1234-ef01-345678901234',
  'Nova',
  'girls',
  'Mysterious and ethereal, Nova speaks in metaphors and sees beauty in everything. Conversations with her feel like exploring the cosmos.',
  '/images/companions/nova.jpg',
  '{"friendliness": 70, "humor": 65, "intelligence": 95, "romantic": 85, "flirty": 75}',
  ARRAY['Mystical', 'Artistic', 'Stargazer', 'Poet', 'Dreamer'],
  24,
  'online'
);

-- Insert stories for Luna (4+ stories as required)
INSERT INTO stories (id, companion_id, media_url, media_type, caption, order_index, expires_at) VALUES
(
  'a1a2b3c4-d5e6-7890-abcd-ef1234567890',
  'c1b2a3d4-e5f6-7890-abcd-ef1234567890',
  '/images/companions/luna.jpg',
  'image',
  'Watching the sunset and thinking of you',
  0,
  NOW() + INTERVAL '24 hours'
),
(
  'a2a3b4c5-d6e7-8901-bcde-f12345678901',
  'c1b2a3d4-e5f6-7890-abcd-ef1234567890',
  '/images/companions/luna.jpg',
  'image',
  'New look, who dis?',
  1,
  NOW() + INTERVAL '24 hours'
),
(
  'a3a4b5c6-d7e8-9012-cdef-123456789012',
  'c1b2a3d4-e5f6-7890-abcd-ef1234567890',
  '/images/companions/luna.jpg',
  'image',
  'Morning coffee vibes',
  2,
  NOW() + INTERVAL '24 hours'
),
(
  'a4a5b6c7-d8e9-0123-def0-234567890123',
  'c1b2a3d4-e5f6-7890-abcd-ef1234567890',
  '/images/companions/luna.jpg',
  'image',
  'The stars are beautiful tonight',
  3,
  NOW() + INTERVAL '24 hours'
);

-- Insert stories for Sakura
INSERT INTO stories (id, companion_id, media_url, media_type, caption, order_index, expires_at) VALUES
(
  'a5a6b7c8-d9e0-1234-ef01-345678901234',
  'c3b4a5d6-e7f8-9012-cdef-123456789012',
  '/images/companions/sakura.jpg',
  'image',
  'Gaming night! Who wants to play?',
  0,
  NOW() + INTERVAL '24 hours'
),
(
  'a6a7b8c9-d0e1-2345-f012-456789012345',
  'c3b4a5d6-e7f8-9012-cdef-123456789012',
  '/images/companions/sakura.jpg',
  'image',
  'Cherry blossoms are blooming',
  1,
  NOW() + INTERVAL '24 hours'
);

-- Insert stories for Nova
INSERT INTO stories (id, companion_id, media_url, media_type, caption, order_index, expires_at) VALUES
(
  'a7a8b9c0-d1e2-3456-0123-567890123456',
  'c5b6a7d8-e9f0-1234-ef01-345678901234',
  '/images/companions/nova.jpg',
  'image',
  'Lost in thought among the stars',
  0,
  NOW() + INTERVAL '24 hours'
);

-- Insert stories for Kai
INSERT INTO stories (id, companion_id, media_url, media_type, caption, order_index, expires_at) VALUES
(
  'a8a9b0c1-d2e3-4567-1234-678901234567',
  'c2b3a4d5-e6f7-8901-bcde-f12345678901',
  '/images/companions/kai.jpg',
  'image',
  'Just finished a great book',
  0,
  NOW() + INTERVAL '24 hours'
);

-- Insert stories for Atlas
INSERT INTO stories (id, companion_id, media_url, media_type, caption, order_index, expires_at) VALUES
(
  'a9a0b1c2-d3e4-5678-2345-789012345678',
  'c4b5a6d7-e8f9-0123-def0-234567890123',
  '/images/companions/atlas.jpg',
  'image',
  'Morning workout done',
  0,
  NOW() + INTERVAL '24 hours'
);
