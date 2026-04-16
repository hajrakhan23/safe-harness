import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/utils/i18n';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const langs: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Language">
        <Globe className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-36 bg-card border border-border rounded-xl shadow-elevated z-50 py-1">
          {langs.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition ${lang === l.code ? 'text-primary font-medium' : 'text-foreground'}`}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
