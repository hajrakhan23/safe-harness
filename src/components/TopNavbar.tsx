import { Moon, Sun, Bell, Menu, Shield, ExternalLink } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ProfileDropdown } from './ProfileDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

const mobileNavItems = [
  { key: 'home', path: '/home' },
  { key: 'dashboard', path: '/dashboard' },
  { key: 'tasks', path: '/tasks' },
  { key: 'alerts', path: '/alerts' },
  { key: 'heatmap', path: '/heatmap' },
  { key: 'analytics', path: '/analytics' },
  { key: 'profile', path: '/profile' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
];

export function TopNavbar({ alertCount = 0 }: { alertCount?: number }) {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <Link to="/home" className="flex items-center gap-2 md:hidden">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display font-bold">Suraksha360</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => window.open('https://www.osha.gov/safety-management', '_blank')}
          className="p-2 rounded-lg hover:bg-muted transition-colors" title={t('safetyGuidelines')}>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </button>
        <LanguageSwitcher />
        <Link to="/alerts" className="p-2 rounded-lg hover:bg-muted transition-colors relative" title={t('alerts')}>
          <Bell className="h-4 w-4 text-muted-foreground" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-critical text-critical-foreground text-[10px] flex items-center justify-center font-bold">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Link>
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-muted transition-colors" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
        </button>
        <ProfileDropdown />
      </div>

      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-card border-b border-border shadow-elevated md:hidden z-50">
          <nav className="p-4 space-y-1">
            {mobileNavItems.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
