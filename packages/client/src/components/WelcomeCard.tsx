import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Props for the WelcomeCard component.
 */
interface IWelcomeCardProps {
  /**
   * Current username.
   */
  username: string;

  /**
   * Callback when user clicks logout.
   */
  onLogout: () => void;

  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Welcome card component.
 * Displays welcome message for logged-in users.
 */
export function WelcomeCard({
  username,
  onLogout,
  className,
}: IWelcomeCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">Welcome Back!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Logged in as:</p>
          <p className="font-semibold">{username}</p>
        </div>

        <Button onClick={onLogout} variant="outline" className="w-full">
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}
