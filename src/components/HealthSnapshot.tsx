import { useEffect, useState } from 'react';
import { Heart, Save } from 'lucide-react';
import { getHealthData, saveHealthData, HealthData } from '@/utils/system';
import { toast } from 'sonner';

export function HealthSnapshot() {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<HealthData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getHealthData().then(d => { if (d) setData(d as HealthData); });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveHealthData(data);
      toast.success('Health data saved');
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-critical" />
        <h3 className="font-display font-semibold text-card-foreground">Health Snapshot</h3>
        <button
          onClick={() => setEditing(e => !e)}
          className="ml-auto text-xs text-primary hover:underline"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Age"
              value={data.age ?? ''}
              onChange={e => setData({ ...data, age: e.target.value ? Number(e.target.value) : null })}
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
            />
            <input
              placeholder="Blood group (e.g. O+)"
              value={data.blood_group ?? ''}
              onChange={e => setData({ ...data, blood_group: e.target.value })}
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
            />
          </div>
          <input
            placeholder="Allergies"
            value={data.allergies ?? ''}
            onChange={e => setData({ ...data, allergies: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          />
          <input
            placeholder="Medical conditions"
            value={data.conditions ?? ''}
            onChange={e => setData({ ...data, conditions: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          />
          <input
            placeholder="Emergency contact"
            value={data.emergency_contact ?? ''}
            onChange={e => setData({ ...data, emergency_contact: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Age" value={data.age != null ? String(data.age) : '—'} />
          <Field label="Blood Group" value={data.blood_group || '—'} />
          <Field label="Allergies" value={data.allergies || '—'} className="col-span-2" />
          <Field label="Conditions" value={data.conditions || '—'} className="col-span-2" />
          <Field label="Emergency Contact" value={data.emergency_contact || '—'} className="col-span-2" />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-card-foreground font-medium">{value}</p>
    </div>
  );
}
