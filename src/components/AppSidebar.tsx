import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, AlertTriangle, BarChart3,
  Info, Phone, Home, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Home', path: '/', icon: Home },
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Tasks', path: '/tasks', icon: ClipboardList },
  { title: 'Alerts', path: '/alerts', icon: AlertTriangle },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 },
  { title: 'About', path: '/about', icon: Info },
  { title: 'Contact', path: '/contact', icon: Phone },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      'hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 relative',
      collapsed ? 'w-16' : 'w-60'
    )}>
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <Shield className="h-7 w-7 text-primary shrink-0" />
        {!collapsed && <span className="font-display font-bold text-lg text-sidebar-foreground">Suraksha360</span>}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
