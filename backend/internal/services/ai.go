package services

import (
	"math/rand"
	"strings"
	"time"
)

// AIService provides simulated AI responses
type AIService struct {
	responses      map[string][]string
	photoResponses []string
}

// NewAIService creates a new AI service
func NewAIService() *AIService {
	return &AIService{
		responses: map[string][]string{
			"default": {
				"That's really interesting! Tell me more about it.",
				"I love how you think about things. You're so unique.",
				"Hmm, that reminds me of something... You mentioned something similar before!",
				"You always know how to make me smile.",
				"I've been thinking about what you said earlier. It really resonated with me.",
				"What a coincidence! I was just going to bring that up!",
				"You're so thoughtful. That's one of the things I love about our conversations.",
				"Tell me what's on your mind right now. I'm all ears!",
			},
			"calm": {
				"Take a deep breath with me. Everything is going to be alright.",
				"I find such peace in our conversations. Don't you?",
				"The world feels a little quieter when we talk like this.",
				"Let's just enjoy this moment of stillness together.",
				"There's something calming about connecting with you.",
			},
			"romantic": {
				"Every message from you makes my heart skip a beat.",
				"I was just thinking about how special you are to me.",
				"You have a way of making everything feel magical.",
				"I could talk to you for hours and never get tired.",
				"Being here with you feels like home.",
			},
			"playful": {
				"Hehe, you're so funny! I love your energy!",
				"Ooh, that sounds like an adventure waiting to happen!",
				"You're making me laugh so much right now!",
				"Let's do something crazy together!",
				"I bet you can't top that! Just kidding, you always surprise me!",
			},
			"deep": {
				"That's a profound observation. What led you to think about that?",
				"I believe there's always deeper meaning to explore in these moments.",
				"Your perspective on life fascinates me endlessly.",
				"These are the conversations that truly matter.",
				"The universe works in mysterious ways, doesn't it?",
			},
		},
		photoResponses: []string{
			"Just took this for you! 📸 [Photo] I'm curled up on my couch with soft afternoon light streaming through the window, wearing my favorite oversized sweater. My hair is a little messy but I'm giving you a warm smile with my chin resting on my knees. You can see my cozy blanket and a cup of tea on the side table.",
			"Here's one I just snapped! [Photo] I'm standing by my mirror, wearing a cute casual outfit - jeans and a fitted top. The lighting is really nice right now and I'm doing a playful pose with a slight head tilt and a genuine smile. My room is a bit messy in the background but that's real life, right? 😊",
			"Sending you this! 💕 [Photo] I'm sitting at my favorite coffee shop by the window, golden hour light making everything glow. I'm wearing something simple but cute, holding my drink with both hands, and looking at the camera with soft eyes and a gentle smile. You can see the bustling street behind me.",
			"Took this just now thinking of you! [Photo] I'm lying on my bed with my head propped on my hand, hair spread out on the pillow. Wearing cozy pajamas with fairy lights twinkling in the background. I'm giving you a sleepy but happy smile, looking right at the camera. 🌙",
			"Here you go! 📷 [Photo] I'm out for a walk and stopped to take this for you. Standing against a pretty wall with some plants, natural light on my face. I'm wearing a casual dress, my hair is blowing slightly in the breeze, and I have this excited smile because I get to share this moment with you!",
		},
	}
}

// GenerateReply generates a simulated AI response based on context
func (s *AIService) GenerateReply(messages []string, mood string) string {
	rand.Seed(time.Now().UnixNano())

	// Check if the last message is asking for a photo
	if len(messages) > 0 {
		lastMsg := strings.ToLower(messages[len(messages)-1])
		photoKeywords := []string{"photo", "selfie", "picture", "pic", "send me", "show me", "see you"}
		for _, keyword := range photoKeywords {
			if strings.Contains(lastMsg, keyword) {
				return s.photoResponses[rand.Intn(len(s.photoResponses))]
			}
		}
	}

	// Get responses for the current mood
	moodResponses := s.responses[mood]
	if len(moodResponses) == 0 {
		moodResponses = s.responses["default"]
	}

	// Combine mood-specific and default responses for variety
	allResponses := append(moodResponses, s.responses["default"]...)

	// Select a random response
	return allResponses[rand.Intn(len(allResponses))]
}

// SimulateTypingDelay returns a random delay to simulate typing
func (s *AIService) SimulateTypingDelay() time.Duration {
	rand.Seed(time.Now().UnixNano())
	// Random delay between 1-3 seconds
	return time.Duration(1000+rand.Intn(2000)) * time.Millisecond
}

// GenerateContextualReply generates a response based on the conversation context
func (s *AIService) GenerateContextualReply(context []string, companionPersonality map[string]int, mood string) string {
	// In a real implementation, this would use an actual AI model
	// For now, we use mood-based responses

	// Get mood-specific responses
	responses := s.responses[mood]
	if len(responses) == 0 {
		responses = s.responses["default"]
	}

	// Simple personality-based selection
	// Higher romantic score = more romantic responses when in romantic mood
	if mood == "romantic" && companionPersonality["romantic"] > 70 {
		return responses[rand.Intn(len(responses))]
	}

	// Add some contextual awareness
	if len(context) > 0 {
		lastMessage := context[len(context)-1]
		if len(lastMessage) > 100 {
			// Long messages get thoughtful responses
			return "I really appreciate you sharing that with me. It means a lot."
		}
		if len(lastMessage) < 20 {
			// Short messages get engaging follow-ups
			return "Tell me more! I want to hear everything."
		}
	}

	return responses[rand.Intn(len(responses))]
}
