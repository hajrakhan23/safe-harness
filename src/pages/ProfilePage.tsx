import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ full_name: '', role: '', avatar_url: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, role, avatar_url').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({
          full_name: data.full_name || '',
          role: data.role || 'supervisor',
          avatar_url: data.avatar_url || '',
        });
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      avatar_url: form.avatar_url,
    }).eq('id', user.id);
    setLoading(false);
    if (error) toast.error('Failed to update profile');
    else toast.success('Profile updated!');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('profile')}</h1>

        <div className="bg-card rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground text-lg">{form.full_name || 'User'}</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> {t('fullName')}
              </label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> {t('email')}
              </label>
              <input value={user?.email || ''} disabled
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" /> {t('role')}
              </label>
              <input value={form.role} disabled
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground text-sm capitalize" />
            </div>
          </div>

          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50">
            <Save className="h-4 w-4" /> {loading ? '...' : t('save')}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
