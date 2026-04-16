import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { TopNavbar } from './TopNavbar';

export function AppLayout({ children, alertCount = 0 }: { children: ReactNode; alertCount?: number }) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar alertCount={alertCount} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
