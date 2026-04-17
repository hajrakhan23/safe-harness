import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Phone, Shield, Save, Camera, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ full_name: '', role: 'supervisor', phone: '', avatar_url: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, role, avatar_url, phone').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({
          full_name: data.full_name || '',
          role: data.role || 'supervisor',
          phone: (data as any).phone || '',
          avatar_url: data.avatar_url || '',
        });
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      role: form.role,
      avatar_url: form.avatar_url,
    }).eq('id', user.id);
    setLoading(false);
    if (error) toast.error('Failed to update profile');
    else toast.success('Profile updated!');
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = data.publicUrl;
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    setForm(f => ({ ...f, avatar_url: url }));
    setUploading(false);
    toast.success('Profile picture updated');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('profile')}</h1>

        <div className="bg-card rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated hover:opacity-90 transition"
                title="Upload picture"
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
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
                <Phone className="h-4 w-4" /> {t('phone')}
              </label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" /> {t('role')}
              </label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm capitalize">
                <option value="supervisor">Supervisor</option>
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
              </select>
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
