'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicLanding = pathname === '/';

  if (isPublicLanding) {
    return (
      <div className="public-site-wrapper">
        {children}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Suspense fallback={<aside className="sidebar" />}>
        <Sidebar />
      </Suspense>
      <div className="app-main-content">
        {children}
      </div>
    </div>
  );
}
