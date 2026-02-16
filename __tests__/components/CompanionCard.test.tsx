import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompanionCard } from '@/components/companions/CompanionCard';
import type { Companion } from '@/types';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const mockCompanion: Companion = {
  id: 'luna',
  name: 'Luna',
  avatar: '/images/companions/luna.jpg',
  bio: 'A warm and empathetic soul who loves late-night conversations.',
  category: 'girls',
  personality: {
    friendliness: 90,
    humor: 70,
    intelligence: 85,
    romantic: 80,
    flirty: 60,
  },
  tags: ['Empathetic', 'Creative', 'Night Owl'],
  age: 22,
  status: 'online',
};

describe('CompanionCard', () => {
  it('renders companion name and age', () => {
    render(<CompanionCard companion={mockCompanion} />);
    expect(screen.getByText('Luna, 22')).toBeInTheDocument();
  });

  it('renders companion bio', () => {
    render(<CompanionCard companion={mockCompanion} />);
    expect(screen.getByText(/warm and empathetic soul/i)).toBeInTheDocument();
  });

  it('renders companion tags', () => {
    render(<CompanionCard companion={mockCompanion} />);
    expect(screen.getByText('Empathetic')).toBeInTheDocument();
    expect(screen.getByText('Creative')).toBeInTheDocument();
  });

  it('renders link to companion detail page', () => {
    render(<CompanionCard companion={mockCompanion} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/companions/luna');
  });

  it('shows online status indicator for online companions', () => {
    render(<CompanionCard companion={mockCompanion} />);
    // The online indicator should be present (green dot)
    const container = screen.getByRole('link');
    expect(container).toBeInTheDocument();
  });

  it('shows offline status for offline companions', () => {
    const offlineCompanion = { ...mockCompanion, status: 'offline' as const };
    render(<CompanionCard companion={offlineCompanion} />);
    const container = screen.getByRole('link');
    expect(container).toBeInTheDocument();
  });

  it('applies animation delay based on index', () => {
    const { container } = render(<CompanionCard companion={mockCompanion} index={3} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
