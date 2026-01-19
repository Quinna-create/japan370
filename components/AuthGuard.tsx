'use client';

/**
 * Authentication guard component
 * Wraps the app to manage authentication state
 */

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getStudentSession } from '@/lib/storage';
import { isRosterAuthEnabled } from '@/lib/rosterData';

const PUBLIC_ROUTES = ['/login', '/join'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

      // Public routes don't need auth
      if (isPublicRoute) {
        setIsChecking(false);
        return;
      }

      // Check if roster auth is enabled
      const rosterAuthEnabled = isRosterAuthEnabled();

      if (!rosterAuthEnabled) {
        // If roster auth is disabled, allow access
        setIsChecking(false);
        return;
      }

      // Check for valid session
      const session = getStudentSession();

      if (!session) {
        // No session, redirect to login
        router.push('/login');
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
