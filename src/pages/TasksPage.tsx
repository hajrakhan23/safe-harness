import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Task } from '@/utils/riskLogic';
import { cn } from '@/lib/utils';
import { Plus, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const initialTasks: Task[] = [
  { id: '1', title: 'Sewer line inspection - Zone A', worker_name: 'Rajesh Kumar', location: 'Zone A', start_time: '08:00', end_time: '12:00', status: 'in_progress' },
  { id: '2', title: 'Drain cleaning - Block 5', worker_name: 'Suresh Yadav', location: 'Zone B', start_time: '09:00', end_time: '13:00', status: 'pending' },
  { id: '3', title: 'Manhole maintenance', worker_name: 'Amit Sharma', location: 'Zone C', start_time: '07:00', end_time: '11:00', status: 'completed' },
];

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, cls: 'bg-warning/10 text-warning border-warning/30' },
  in_progress: { label: 'In Progress', icon: Loader2, cls: 'bg-primary/10 text-primary border-primary/30' },
  completed: { label: 'Completed', icon: CheckCircle2, cls: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: 'Cancelled', icon: XCircle, cls: 'bg-muted text-muted-foreground border-border' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', worker_name: '', location: '', start_time: '', end_time: '' });

  const addTask = () => {
    if (!form.title || !form.worker_name) { toast.error('Please fill required fields'); return; }
    setTasks(prev => [...prev, { ...form, id: crypto.randomUUID(), status: 'pending' }]);
    setForm({ title: '', worker_name: '', location: '', start_time: '', end_time: '' });
    setShowForm(false);
    toast.success('Task created');
  };

  const updateStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground text-sm">{tasks.length} tasks total</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4 border border-border">
            <h3 className="font-display font-semibold">Create New Task</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              <input placeholder="Worker name *" value={form.worker_name} onChange={e => setForm({ ...form, worker_name: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              <div className="flex gap-2">
                <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addTask} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Create</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {tasks.map(task => {
            const cfg = statusConfig[task.status];
            return (
              <div key={task.id} className="bg-card rounded-xl p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.worker_name} · {task.location} · {task.start_time}–{task.end_time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('px-3 py-1 rounded-full text-xs border font-medium flex items-center gap-1', cfg.cls)}>
                    <cfg.icon className="h-3 w-3" /> {cfg.label}
                  </span>
                  <select value={task.status} onChange={e => updateStatus(task.id, e.target.value as Task['status'])}
                    className="text-xs px-2 py-1 rounded border border-input bg-background text-foreground">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
