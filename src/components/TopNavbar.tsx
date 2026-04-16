import { Moon, Sun, Bell, User, Menu, Globe, Shield } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { title: 'Home', path: '/' },
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Tasks', path: '/tasks' },
  { title: 'Alerts', path: '/alerts' },
  { title: 'Analytics', path: '/analytics' },
  { title: 'About', path: '/about' },
  { title: 'Contact', path: '/contact' },
];

export function TopNavbar({ alertCount = 0 }: { alertCount?: number }) {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <Link to="/" className="flex items-center gap-2 md:hidden">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display font-bold">Suraksha360</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-muted transition-colors relative" title="Language">
          <Globe className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link to="/alerts" className="p-2 rounded-lg hover:bg-muted transition-colors relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-critical text-critical-foreground text-[10px] flex items-center justify-center font-bold">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Link>
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {theme === 'dark' ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
        </button>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-card border-b border-border shadow-elevated md:hidden z-50">
          <nav className="p-4 space-y-1">
            {mobileNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
