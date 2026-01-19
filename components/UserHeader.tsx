'use client';

/**
 * User header component showing logged-in user info
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { getStudentSession, clearStudentSession } from '@/lib/storage';
import { StudentSession } from '@/types/kanji';

export default function UserHeader() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentSession = getStudentSession();
    setSession(currentSession);
  }, []);

  const handleLogout = () => {
    clearStudentSession();
    router.push('/login');
  };

  if (!session) {
    return null;
  }

  const bgColor = session.isMasterAccess ? 'bg-amber-100 border-amber-300' : 'bg-blue-50 border-blue-200';
  const textColor = session.isMasterAccess ? 'text-amber-900' : 'text-blue-900';

  return (
    <div className={`${bgColor} border-b ${textColor}`}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User size={16} />
            <span className="text-sm font-medium">{session.userName}</span>
            {session.isMasterAccess && (
              <span className="text-xs bg-amber-200 px-2 py-0.5 rounded">Master Access</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-sm hover:underline"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
