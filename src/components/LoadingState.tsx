import { RefreshCw } from 'lucide-react';
import { Card } from './Card';

interface LoadingStateProps {
  message?: string;
  variant?: 'child' | 'parent';
  className?: string;
}

export function LoadingState({
  message = 'Loading data...',
  variant = 'parent',
  className = '',
}: LoadingStateProps) {
  const iconColor = variant === 'child' ? 'text-[var(--child-blue)]' : 'text-[var(--parent-teal)]';

  return (
    <Card variant={variant} className={className}>
      <div className="flex items-center gap-3 text-[#64748b]">
        <RefreshCw className={`h-5 w-5 animate-spin ${iconColor}`} />
        <p className="text-sm sm:text-base">{message}</p>
      </div>
    </Card>
  );
}
