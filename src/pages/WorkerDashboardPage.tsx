import { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MapPin, Radio, ClipboardList, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  worker_name: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
}

export default function WorkerDashboardPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc?: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTasks(data as Task[]);
  };

  useEffect(() => {
    if (!user) return;
    fetchTasks();
    const channel = supabase
      .channel('worker-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Live GPS tracking
  useEffect(() => {
    if (!user) return;
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation not supported by this browser');
      return;
    }
    setTracking(true);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ lat: latitude, lng: longitude, acc: accuracy });
        // Persist every update (browser throttles naturally)
        await supabase.from('locations').insert({
          user_id: user.id,
          latitude,
          longitude,
          accuracy,
        });
      },
      (err) => {
        console.warn('Geolocation error', err);
        toast.error('Location permission denied');
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
    watchIdRef.current = id;
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [user]);

  const handleSOS = async () => {
    if (!user) return;
    setSosLoading(true);
    const locationStr = coords
      ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      : 'Live Worker Location';
    const { error } = await supabase.from('alerts').insert({
      user_id: user.id,
      message: '🚨 SOS Triggered by worker',
      location: locationStr,
      risk: 'CRITICAL',
      type: 'sos',
      worker_name: profile?.full_name || 'Worker',
    });
    setSosLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.error('🚨 SOS Emergency Alert Sent!', { duration: 5000 });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">👷 {t('workerDashboard') || 'Worker Dashboard'}</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
          </p>
        </div>

        {/* SOS Button */}
        <motion.button
          onClick={handleSOS}
          disabled={sosLoading}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'w-full py-8 rounded-2xl bg-critical text-critical-foreground font-display font-bold text-2xl shadow-elevated transition disabled:opacity-50',
            'animate-pulse-critical'
          )}
        >
          {sosLoading ? <Loader2 className="h-7 w-7 animate-spin mx-auto" /> : '🚨 SOS EMERGENCY'}
        </motion.button>

        {/* Location status */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Radio className={cn('h-5 w-5', tracking ? 'text-success animate-pulse' : 'text-muted-foreground')} />
            <h3 className="font-display font-semibold text-card-foreground">Location Tracking</h3>
            <span className={cn(
              'ml-auto text-xs px-2 py-1 rounded-full',
              tracking ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            )}>
              {tracking ? 'Active' : 'Inactive'}
            </span>
          </div>
          {coords ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
              {coords.acc && <span className="text-xs">(±{Math.round(coords.acc)}m)</span>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Waiting for GPS signal...</p>
          )}
        </div>

        {/* Assigned tasks */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-card-foreground">Assigned Tasks</h3>
            <span className="ml-auto text-xs text-muted-foreground">{tasks.length} total</span>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No tasks assigned yet</p>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-card-foreground">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {task.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {task.location}</span>}
                        {task.start_time && <span>⏱ {task.start_time}{task.end_time ? `–${task.end_time}` : ''}</span>}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
