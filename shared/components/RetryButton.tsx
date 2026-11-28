import { RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface RetryButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function RetryButton({ onClick, label = 'Try again', className }: RetryButtonProps) {
  return (
    <Button variant="secondary" leadingIcon={RotateCcw} onClick={onClick} className={className}>
      {label}
    </Button>
  );
}
