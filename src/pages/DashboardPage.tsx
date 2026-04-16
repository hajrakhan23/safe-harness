import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { useSensorSimulation } from '@/hooks/useSensorSimulation';
import { riskColors } from '@/utils/riskLogic';
import { cn } from '@/lib/utils';
import { Flame, Wind, Thermometer, AlertTriangle, User, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { sensorData, riskLevel, alerts, history, triggerSOS, acknowledgeAlert } = useSensorSimulation();

  const unackAlerts = alerts.filter(a => !a.acknowledged);

  const handleSOS = () => {
    triggerSOS();
    toast.error('🚨 SOS Emergency Alert Triggered!', { duration: 5000 });
  };

  const chartData = history.map((d, i) => ({
    time: i,
    gas: d.gas_level,
    oxygen: d.oxygen_level,
    temp: d.temperature,
  }));

  return (
    <AppLayout alertCount={unackAlerts.length}>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Safety Dashboard</h1>
            <p className="text-muted-foreground text-sm">Real-time monitoring · Updates every 3 seconds</p>
          </div>
          <button onClick={handleSOS}
            className={cn('px-6 py-3 rounded-xl font-bold text-lg bg-critical text-critical-foreground shadow-elevated hover:opacity-90 transition-all', riskLevel === 'CRITICAL' && 'animate-pulse-critical')}>
            🚨 SOS
          </button>
        </div>

        {/* Risk Banner */}
        <motion.div key={riskLevel} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={cn('rounded-xl p-4 text-center font-display font-bold text-xl', riskColors[riskLevel], riskLevel === 'CRITICAL' && 'animate-pulse-critical')}>
          Status: {riskLevel}
        </motion.div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SensorCard icon={Flame} label="Gas Level" value={`${sensorData.gas_level}%`} danger={sensorData.gas_level > 70} warn={sensorData.gas_level > 40} />
          <SensorCard icon={Wind} label="Oxygen Level" value={`${sensorData.oxygen_level}%`} danger={sensorData.oxygen_level < 16} warn={sensorData.oxygen_level < 18} />
          <SensorCard icon={Thermometer} label="Temperature" value={`${sensorData.temperature}°C`} danger={sensorData.temperature > 38} warn={sensorData.temperature > 35} />
        </div>

        {/* Chart + Alerts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-card rounded-xl p-4 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground mb-4">Sensor Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Line type="monotone" dataKey="gas" stroke="hsl(var(--critical))" strokeWidth={2} dot={false} name="Gas %" />
                <Line type="monotone" dataKey="oxygen" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="O₂ %" />
                <Line type="monotone" dataKey="temp" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Temp °C" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts */}
          <div className="bg-card rounded-xl p-4 shadow-card max-h-[350px] overflow-auto">
            <h3 className="font-display font-semibold text-card-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" /> Recent Alerts
            </h3>
            {unackAlerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active alerts</p>
            ) : (
              <div className="space-y-2">
                {unackAlerts.slice(0, 10).map(a => (
                  <div key={a.id} className={cn('p-3 rounded-lg border text-sm', a.severity === 'CRITICAL' ? 'border-critical/30 bg-critical/5' : 'border-warning/30 bg-warning/5')}>
                    <p className="font-medium text-card-foreground">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(a.timestamp).toLocaleTimeString()}</p>
                    <button onClick={() => acknowledgeAlert(a.id)} className="text-xs text-primary mt-1 hover:underline">Acknowledge</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Worker Info */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-card-foreground mb-4">Active Worker</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3"><User className="h-5 w-5 text-primary" /><div><p className="text-sm font-medium text-card-foreground">Rajesh Kumar</p><p className="text-xs text-muted-foreground">ID: W-001</p></div></div>
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-secondary" /><div><p className="text-sm font-medium text-card-foreground">Zone A - Sewer Line 4</p><p className="text-xs text-muted-foreground">Shift: Morning</p></div></div>
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-accent" /><div><p className="text-sm font-medium text-card-foreground">+91 98765 43210</p><p className="text-xs text-muted-foreground">Emergency Contact</p></div></div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SensorCard({ icon: Icon, label, value, danger, warn }: { icon: any; label: string; value: string; danger: boolean; warn: boolean }) {
  const color = danger ? 'border-critical bg-critical/5' : warn ? 'border-warning bg-warning/5' : 'border-success bg-success/5';
  const iconColor = danger ? 'text-critical' : warn ? 'text-warning' : 'text-success';
  return (
    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={cn('rounded-xl p-5 border-2 shadow-card transition-all', color)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <p className="text-3xl font-display font-bold text-card-foreground">{value}</p>
    </motion.div>
  );
}
