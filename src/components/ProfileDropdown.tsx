import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function ProfileDropdown() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition">
        <User className="h-4 w-4 text-primary" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-64 bg-card border border-border rounded-xl shadow-elevated z-50 p-4 space-y-3">
          <div>
            <p className="font-medium text-card-foreground text-sm">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'supervisor'}</p>
          </div>
          <hr className="border-border" />
          <button onClick={async () => { await signOut(); navigate('/login'); }}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition">
            <LogOut className="h-4 w-4" /> {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
