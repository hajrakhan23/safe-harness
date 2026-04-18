import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Radio, RefreshCw, User as UserIcon } from 'lucide-react';
import { reverseGeocode } from '@/utils/geocoding';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface WorkerStatus {
  user_id: string;
  full_name: string;
  role: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  address?: string;
  risk: 'SAFE' | 'WARNING' | 'CRITICAL';
}

const riskStyle: Record<WorkerStatus['risk'], string> = {
  SAFE: 'bg-success/10 text-success border-success/30',
  WARNING: 'bg-warning/10 text-warning border-warning/30',
  CRITICAL: 'bg-critical/10 text-critical border-critical/30',
};

export default function LiveTrackingPage() {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState<WorkerStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    // Fetch all worker profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'worker');

    if (!profiles || profiles.length === 0) {
      setWorkers([]);
      setLoading(false);
      return;
    }

    // Latest location per worker
    const { data: locations } = await supabase
      .from('locations')
      .select('user_id, latitude, longitude, created_at')
      .in('user_id', profiles.map(p => p.id))
      .order('created_at', { ascending: false });

    // Latest sensor reading per worker
    const { data: sensors } = await supabase
      .from('sensor_data')
      .select('user_id, gas_level, oxygen_level, created_at')
      .in('user_id', profiles.map(p => p.id))
      .order('created_at', { ascending: false });

    const latestLoc = new Map<string, any>();
    locations?.forEach(l => {
      if (!latestLoc.has(l.user_id)) latestLoc.set(l.user_id, l);
    });

    const latestSensor = new Map<string, any>();
    sensors?.forEach(s => {
      if (!latestSensor.has(s.user_id!)) latestSensor.set(s.user_id!, s);
    });

    const result: WorkerStatus[] = [];
    for (const p of profiles) {
      const loc = latestLoc.get(p.id);
      if (!loc) continue;
      const s = latestSensor.get(p.id);
      let risk: WorkerStatus['risk'] = 'SAFE';
      if (s) {
        if (s.gas_level > 80 || s.oxygen_level < 16) risk = 'CRITICAL';
        else if (s.gas_level > 40 || s.oxygen_level < 18) risk = 'WARNING';
      }
      result.push({
        user_id: p.id,
        full_name: p.full_name || 'Unknown Worker',
        role: p.role || 'worker',
        latitude: loc.latitude,
        longitude: loc.longitude,
        updated_at: loc.created_at,
        risk,
      });
    }

    setWorkers(result);
    setLoading(false);

    // Reverse geocode in background
    result.forEach(async (w, i) => {
      const addr = await reverseGeocode(w.latitude, w.longitude);
      setWorkers(prev => {
        const next = [...prev];
        if (next[i] && next[i].user_id === w.user_id) next[i] = { ...next[i], address: addr };
        return next;
      });
    });
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('live-tracking')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'locations' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Radio className="h-6 w-6 text-success animate-pulse" />
              {t('liveTracking') || 'Live Worker Tracking'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Real-time location & safety status of all workers
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm hover:bg-muted transition"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {loading && workers.length === 0 && (
          <p className="text-muted-foreground text-sm py-12 text-center">Loading worker locations...</p>
        )}

        {!loading && workers.length === 0 && (
          <div className="bg-card rounded-xl p-8 text-center border border-border">
            <UserIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No active workers with location data yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Workers must sign in and allow GPS access.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workers.map(w => (
            <div key={w.user_id} className="bg-card rounded-xl p-5 shadow-card border border-border space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                    {w.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-card-foreground truncate">{w.full_name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{w.role}</p>
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs border font-medium shrink-0',
                  riskStyle[w.risk]
                )}>
                  {w.risk}
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-card-foreground leading-snug">
                  {w.address || `${w.latitude.toFixed(5)}, ${w.longitude.toFixed(5)}`}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Last update: {formatDistanceToNow(new Date(w.updated_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
