import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Props for the UserInfoCard component.
 */
interface IUserInfoCardProps {
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
 * User information card component.
 * Displays current user info and logout button.
 */
export function UserInfoCard({
  username,
  onLogout,
  className,
}: IUserInfoCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Logged in as:</p>
            <p className="font-semibold">{username}</p>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
