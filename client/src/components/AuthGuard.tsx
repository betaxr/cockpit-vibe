/**
 * @fileoverview Authentication Guard Component
 * 
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 * 
 * @module client/components/AuthGuard
 */

import { ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  /** Require admin role */
  requireAdmin?: boolean;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom unauthorized component */
  unauthorizedComponent?: ReactNode;
}

/**
 * Default loading spinner
 */
function DefaultLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Authentifizierung wird geprüft...</p>
      </div>
    </div>
  );
}

/**
 * Default unauthorized message
 */
function DefaultUnauthorized({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Zugriff verweigert</h1>
        <p className="text-muted-foreground">{message}</p>
        <a 
          href="/" 
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
}

/**
 * Authentication Guard
 * 
 * Wraps protected routes and handles:
 * - Loading state during auth check
 * - Redirect to login if not authenticated
 * - Admin role check if required
 * 
 * @example
 * ```tsx
 * <AuthGuard>
 *   <ProtectedPage />
 * </AuthGuard>
 * 
 * <AuthGuard requireAdmin>
 *   <AdminPage />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  requireAdmin = false,
  loadingComponent,
  unauthorizedComponent,
}: AuthGuardProps) {
  const { user, loading: isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return <>{loadingComponent || <DefaultLoading />}</>;
  }

  // Not authenticated - redirect to login
  if (!user) {
    // Use window.location for full page redirect to OAuth
    window.location.href = getLoginUrl();
    return <>{loadingComponent || <DefaultLoading />}</>;
  }

  // Check admin requirement
  if (requireAdmin && user.role !== "admin") {
    return (
      <>
        {unauthorizedComponent || (
          <DefaultUnauthorized message="Diese Seite erfordert Admin-Rechte." />
        )}
      </>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}

/**
 * Higher-order component version of AuthGuard
 * 
 * @example
 * ```tsx
 * const ProtectedPage = withAuth(MyPage);
 * const AdminPage = withAuth(MyAdminPage, { requireAdmin: true });
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, "children"> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

export default AuthGuard;
