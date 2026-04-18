import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Plus, Clock, CheckCircle2, XCircle, Loader2, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string | null;
  worker_name: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  user_id: string;
  assigned_to: string | null;
  created_at: string;
}

interface Worker {
  id: string;
  full_name: string | null;
}

interface HistoryTask {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  worker_name: string | null;
  status: string;
  completed_at: string;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  pending: { label: 'Pending', icon: Clock, cls: 'bg-warning/10 text-warning border-warning/30' },
  in_progress: { label: 'In Progress', icon: Loader2, cls: 'bg-primary/10 text-primary border-primary/30' },
  completed: { label: 'Completed', icon: CheckCircle2, cls: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: 'Cancelled', icon: XCircle, cls: 'bg-muted text-muted-foreground border-border' },
};

export default function TasksPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryTask[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [showForm, setShowForm] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [form, setForm] = useState({ title: '', description: '', worker_name: '', assigned_to: '', location: '', start_time: '', end_time: '' });

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data as Task[]);
  };
  const fetchHistory = async () => {
    const { data } = await supabase.from('task_history').select('*').order('completed_at', { ascending: false });
    if (data) setHistory(data as HistoryTask[]);
  };

  useEffect(() => {
    if (!user) return;
    fetchTasks();
    fetchHistory();
    // Load workers for assignment dropdown
    supabase.from('profiles').select('id, full_name').eq('role', 'worker')
      .then(({ data }) => { if (data) setWorkers(data as Worker[]); });

    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchTasks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_history' }, () => fetchHistory())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const addTask = async () => {
    if (!form.title || !form.worker_name) { toast.error('Title and worker name required'); return; }
    if (!user) return;
    const { error } = await supabase.from('tasks').insert({
      title: form.title,
      description: form.description,
      worker_name: form.worker_name,
      location: form.location,
      start_time: form.start_time,
      end_time: form.end_time,
      assigned_to: form.assigned_to || null,
      user_id: user.id,
      status: 'pending',
    });
    if (error) { toast.error(error.message); return; }
    setForm({ title: '', description: '', worker_name: '', assigned_to: '', location: '', start_time: '', end_time: '' });
    setShowForm(false);
    toast.success('Task created');
  };

  const updateStatus = async (id: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') {
      await archiveTask(id, status);
      return;
    }
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
  };

  const archiveTask = async (id: string, status: 'completed' | 'cancelled') => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const { error: histErr } = await supabase.from('task_history').insert({
      user_id: user.id,
      title: task.title,
      description: task.description,
      location: task.location,
      worker_name: task.worker_name,
      status,
    });
    if (histErr) { toast.error(histErr.message); return; }
    await supabase.from('tasks').delete().eq('id', id);
    toast.success(`Task ${status}`);
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) toast.error(error.message);
    else toast.success('Task deleted');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{t('taskManagement')}</h1>
            <p className="text-muted-foreground text-sm">
              {tab === 'active' ? `${tasks.length} active` : `${history.length} in history`}
            </p>
          </div>
          {tab === 'active' && (
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition">
              <Plus className="h-4 w-4" /> {t('newTask')}
            </button>
          )}
        </div>

        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setTab('active')}
            className={cn('px-4 py-2 text-sm font-medium border-b-2 transition', tab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
          >
            {t('activeTasks')}
          </button>
          <button
            onClick={() => setTab('history')}
            className={cn('px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2', tab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
          >
            <History className="h-4 w-4" /> {t('previousTasks')}
          </button>
        </div>

        {tab === 'active' && showForm && (
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4 border border-border">
            <h3 className="font-display font-semibold">{t('createNewTask')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              <input placeholder="Worker name *" value={form.worker_name} onChange={e => setForm({ ...form, worker_name: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              <div className="flex gap-2">
                <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" rows={2} />
            </div>
            <div className="flex gap-2">
              <button onClick={addTask} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Create</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}

        {tab === 'active' && (
          <div className="space-y-3">
            {tasks.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No active tasks. Create one to get started.</p>}
            {tasks.map(task => {
              const cfg = statusConfig[task.status] || statusConfig.pending;
              return (
                <div key={task.id} className="bg-card rounded-xl p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-card-foreground">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {task.worker_name} · {task.location || '—'} · {task.start_time || '—'}–{task.end_time || '—'}
                    </p>
                    {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('px-3 py-1 rounded-full text-xs border font-medium flex items-center gap-1', cfg.cls)}>
                      <cfg.icon className="h-3 w-3" /> {cfg.label}
                    </span>
                    <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-input bg-background text-foreground">
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Complete</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                    <button onClick={() => archiveTask(task.id, 'completed')} title="Complete" className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => archiveTask(task.id, 'cancelled')} title="Cancel" className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition">
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteTask(task.id)} title="Delete" className="p-1.5 rounded-md bg-critical/10 text-critical hover:bg-critical/20 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No completed or cancelled tasks yet.</p>}
            {history.map(h => {
              const isCompleted = h.status === 'completed';
              return (
                <div key={h.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between gap-3 border border-border">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-card-foreground">{h.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {h.worker_name || '—'} · {h.location || '—'} · {new Date(h.completed_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs border font-medium flex items-center gap-1 shrink-0',
                    isCompleted ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-border'
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {isCompleted ? 'Completed' : 'Cancelled'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
