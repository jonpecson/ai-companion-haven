import { useState } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const quickEmojis = ['❤️', '😊', '😂', '🥰', '😘', '💕', '✨', '🔥', '😍', '🤗', '💜', '🌙'];

interface ChatInputProps {
  onSend: (text: string) => void;
}

export const ChatInput = ({ onSend }: ChatInputProps) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="border-t border-border glass p-3">
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-2"
          >
            <div className="flex flex-wrap gap-2 p-2">
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setText(prev => prev + emoji)}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Smile size={20} />
        </button>
        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Paperclip size={20} />
        </button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        {text.trim() ? (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleSend}
            className="p-2 gradient-primary rounded-full text-primary-foreground"
          >
            <Send size={18} />
          </motion.button>
        ) : (
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2 rounded-full transition-colors ${isRecording ? 'gradient-primary text-primary-foreground animate-pulse-ring' : 'text-muted-foreground hover:text-primary'}`}
          >
            <Mic size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
