import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useSensorSimulation } from '@/hooks/useSensorSimulation';
import { cn } from '@/lib/utils';
import { riskColors } from '@/utils/riskLogic';
import { Search, Filter } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, acknowledgeAlert } = useSensorSimulation();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filtered = alerts.filter(a => {
    const matchSearch = a.message.toLowerCase().includes(search.toLowerCase()) || (a.worker_name || '').toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <AppLayout alertCount={alerts.filter(a => !a.acknowledged).length}>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Alerts Center</h1>
          <p className="text-muted-foreground text-sm">{alerts.length} total alerts · {alerts.filter(a => !a.acknowledged).length} unacknowledged</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..." className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
              <option value="all">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="SAFE">Safe</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No alerts found</div>
          ) : filtered.map(a => (
            <div key={a.id} className={cn('bg-card rounded-xl p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4',
              a.severity === 'CRITICAL' ? 'border-l-critical' : a.severity === 'WARNING' ? 'border-l-warning' : 'border-l-success')}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-bold', riskColors[a.severity])}>{a.severity}</span>
                  <span className="text-xs text-muted-foreground">{a.type.toUpperCase()}</span>
                </div>
                <p className="font-medium text-card-foreground">{a.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.worker_name} · {new Date(a.timestamp).toLocaleString()}</p>
              </div>
              {!a.acknowledged ? (
                <button onClick={() => acknowledgeAlert(a.id)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition whitespace-nowrap">
                  Acknowledge
                </button>
              ) : (
                <span className="text-xs text-success font-medium">✓ Acknowledged</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
