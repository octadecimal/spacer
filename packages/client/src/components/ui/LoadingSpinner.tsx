import { cn } from '@/app/styles';

/**
 * Props for the LoadingSpinner component.
 */
interface ILoadingSpinnerProps {
  /**
   * Optional message to display below the spinner.
   */
  message?: string;

  /**
   * Size of the spinner (sm, md, lg).
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Loading spinner component with optional message.
 * Provides a consistent loading experience across the app.
 */
export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  className,
}: ILoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div className="text-center">
        <div
          className={cn(
            'animate-spin rounded-full border-b-2 border-primary mx-auto mb-4',
            sizeClasses[size]
          )}
        />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
