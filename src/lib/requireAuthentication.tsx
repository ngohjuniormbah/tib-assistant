'use client';

import Unauthorized from '@/app/unauthorized/page';
import useAuth from '@/lib/useAuth';

export default function requireAuthentication<P extends object>(
  Component: React.ComponentType<P>
) {
  // Return a new component that handles the authentication check
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Unauthorized />;
    }

    return <Component {...props} />;
  };
}
