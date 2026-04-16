import { AppLayout } from '@/components/AppLayout';
import { useSensorSimulation } from '@/hooks/useSensorSimulation';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapPin } from 'lucide-react';

export default function AnalyticsPage() {
  const { history, alerts } = useSensorSimulation();

  const chartData = history.map((d, i) => ({ time: i, gas: d.gas_level, oxygen: d.oxygen_level, temp: d.temperature }));

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
  const pieData = [
    { name: 'Critical', value: criticalCount || 1, color: 'hsl(0, 80%, 55%)' },
    { name: 'Warning', value: warningCount || 1, color: 'hsl(42, 95%, 50%)' },
    { name: 'Safe', value: Math.max(1, 20 - criticalCount - warningCount), color: 'hsl(152, 60%, 48%)' },
  ];

  const exposureData = [
    { zone: 'Zone A', hours: 24 }, { zone: 'Zone B', hours: 18 },
    { zone: 'Zone C', hours: 32 }, { zone: 'Zone D', hours: 12 },
  ];

  const incidents = [
    { date: '2026-04-15', type: 'Gas Leak', zone: 'Zone A', severity: 'Critical' },
    { date: '2026-04-14', type: 'Low Oxygen', zone: 'Zone C', severity: 'Warning' },
    { date: '2026-04-13', type: 'SOS Trigger', zone: 'Zone B', severity: 'Critical' },
    { date: '2026-04-12', type: 'High Temp', zone: 'Zone A', severity: 'Warning' },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm">Safety trends, exposure data, and incident reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gas Trends */}
          <div className="bg-card rounded-xl p-4 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Gas & Oxygen Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="gas" stroke="hsl(var(--critical))" strokeWidth={2} dot={false} name="Gas %" />
                <Line type="monotone" dataKey="oxygen" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="O₂ %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          <div className="bg-card rounded-xl p-4 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Exposure Tracking */}
          <div className="bg-card rounded-xl p-4 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Exposure Hours by Zone</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={exposureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="zone" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap Placeholder */}
          <div className="bg-card rounded-xl p-4 shadow-card flex flex-col items-center justify-center min-h-[300px]">
            <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-display font-semibold text-card-foreground mb-1">Hazard Heatmap</h3>
            <p className="text-muted-foreground text-sm text-center max-w-xs">Geographic heatmap integration coming soon. This will visualize high-risk zones across the city.</p>
          </div>
        </div>

        {/* Incident Logs */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h3 className="font-display font-semibold text-card-foreground mb-4">Incident Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-3">Date</th><th className="text-left py-2 px-3">Type</th><th className="text-left py-2 px-3">Zone</th><th className="text-left py-2 px-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 px-3 text-card-foreground">{inc.date}</td>
                    <td className="py-2 px-3 text-card-foreground">{inc.type}</td>
                    <td className="py-2 px-3 text-card-foreground">{inc.zone}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${inc.severity === 'Critical' ? 'bg-critical/10 text-critical' : 'bg-warning/10 text-warning'}`}>
                        {inc.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
