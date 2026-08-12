import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'admin' | 'chef' | 'arbetare';
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, profile, roles, loading, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const passwordChanged = typeof window !== 'undefined'
      ? sessionStorage.getItem('passwordChanged') === 'true'
      : false;

    if (!loading && !user) {
      navigate('/login');
    } else if (
      !loading &&
      user &&
      profile?.must_change_password &&
      !passwordChanged &&
      location.pathname !== '/change-password' &&
      location.pathname !== '/login'
    ) {
      navigate('/change-password');
    }
  }, [user, profile, loading, navigate, location.pathname]);

  // Show loading spinner while auth is loading OR while profile/roles are being fetched
  if (loading || (user && (!profile || !roles))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Security: Ensure user has at least one role
  if (roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Ingen åtkomst</h1>
          <p className="text-muted-foreground">
            Ditt konto saknar nödvändig profilinformation. Kontakta en administratör.
          </p>
        </div>
      </div>
    );
  }

  if (requireRole && !hasRole(requireRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Ingen åtkomst</h1>
          <p className="text-muted-foreground">
            Du har inte behörighet att se denna sida.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
