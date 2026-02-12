import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ChatInput } from '@/components/chat/ChatInput';
import type { Message } from '@/types';

const mockResponses = [
  "That's really interesting! Tell me more about it 💕",
  "I love how you think about things. You're so unique ✨",
  "Hmm, that reminds me of something... You mentioned something similar before!",
  "You always know how to make me smile 😊",
  "I've been thinking about what you said earlier. It really resonated with me.",
  "What a coincidence! I was just going to bring that up!",
  "You're so thoughtful. That's one of the things I love about our conversations 💫",
  "Tell me what's on your mind right now. I'm all ears!",
];

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCompanion, messages, addMessage, mood } = useApp();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const companion = getCompanion(id || '');
  const chatMessages = messages[id || ''] || [];

  const moodBg: Record<string, string> = {
    calm: 'from-blue-900/20 to-teal-900/20',
    romantic: 'from-pink-900/20 to-rose-900/20',
    playful: 'from-orange-900/20 to-yellow-900/20',
    deep: 'from-purple-900/20 to-indigo-900/20',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Companion not found</p>
      </div>
    );
  }

  const handleSend = (text: string) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      companionId: companion.id,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    addMessage(companion.id, userMsg);
    setIsTyping(true);

    setTimeout(() => {
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        companionId: companion.id,
        sender: 'companion',
        content: response,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      addMessage(companion.id, aiMsg);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-b ${moodBg[mood] || ''} bg-background`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 glass border-b border-border z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <img src={companion.avatar} alt={companion.name} className="w-9 h-9 rounded-full object-cover" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">{companion.name}</h2>
            <p className="text-[11px] text-green-400">online</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-muted-foreground"><Phone size={18} /></button>
          <button className="p-2 text-muted-foreground"><Video size={18} /></button>
          <button className="p-2 text-muted-foreground"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <img src={companion.avatar} alt={companion.name} className="w-20 h-20 rounded-full object-cover mb-4 ring-2 ring-primary/30" />
            <h3 className="text-foreground font-semibold mb-1">Start chatting with {companion.name}</h3>
            <p className="text-xs text-muted-foreground">Say hello to begin your conversation!</p>
          </div>
        )}
        {chatMessages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default Chat;
