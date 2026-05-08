import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'card' | 'panel' | 'soft';
}

export default function GlassCard({
  children,
  className = '',
  variant = 'card',
}: GlassCardProps) {
  const variantClasses = {
    card: 'glass-card',
    panel: 'glass-panel',
    soft: 'soft-glass',
  };

  return (
    <div className={`${variantClasses[variant]} rounded-lg shadow-sm border border-white/40 ${className}`}>
      {children}
    </div>
  );
}
