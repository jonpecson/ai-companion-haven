import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { Message } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

const mockUserMessage: Message = {
  id: 'msg-1',
  conversationId: 'conv-1',
  sender: 'user',
  content: 'Hello, how are you?',
  createdAt: new Date().toISOString(),
};

const mockAiMessage: Message = {
  id: 'msg-2',
  conversationId: 'conv-1',
  sender: 'ai',
  content: 'I am doing great, thanks for asking!',
  createdAt: new Date().toISOString(),
};

describe('MessageBubble', () => {
  it('renders user message content', () => {
    render(<MessageBubble message={mockUserMessage} />);
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
  });

  it('renders AI message content', () => {
    render(<MessageBubble message={mockAiMessage} />);
    expect(screen.getByText('I am doing great, thanks for asking!')).toBeInTheDocument();
  });

  it('applies correct styling for user messages', () => {
    const { container } = render(<MessageBubble message={mockUserMessage} />);
    const bubble = container.querySelector('.gradient-primary');
    expect(bubble).toBeInTheDocument();
  });

  it('applies correct styling for AI messages', () => {
    const { container } = render(<MessageBubble message={mockAiMessage} />);
    const bubble = container.querySelector('.glass');
    expect(bubble).toBeInTheDocument();
  });

  it('shows relative time for messages', () => {
    render(<MessageBubble message={mockUserMessage} />);
    // Should show "Just now" or similar for recent messages
    expect(screen.getByText(/now|ago/i)).toBeInTheDocument();
  });

  it('aligns user messages to the right', () => {
    const { container } = render(<MessageBubble message={mockUserMessage} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('justify-end');
  });

  it('aligns AI messages to the left', () => {
    const { container } = render(<MessageBubble message={mockAiMessage} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('justify-start');
  });
});
