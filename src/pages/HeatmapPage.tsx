import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface AlertPoint {
  id: string;
  message: string;
  risk: string;
  location: string;
  created_at: string;
}

const zoneCoords: Record<string, [number, number]> = {
  'Solapur Zone 1': [17.6599, 75.9064],
  'Solapur Zone 2': [17.6700, 75.9200],
  'Solapur Zone 3': [17.6500, 75.8900],
  'Mumbai Zone A': [19.0760, 72.8777],
  'Pune Zone B': [18.5204, 73.8567],
};

const riskColor = (risk: string) => {
  if (risk === 'CRITICAL') return '#ef4444';
  if (risk === 'WARNING') return '#f59e0b';
  return '#22c55e';
};

export default function HeatmapPage() {
  const [alerts, setAlerts] = useState<AlertPoint[]>([]);

  useEffect(() => {
    supabase.from('alerts').select('id, message, risk, location, created_at')
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { if (data) setAlerts(data); });

    const interval = setInterval(() => {
      supabase.from('alerts').select('id, message, risk, location, created_at')
        .order('created_at', { ascending: false }).limit(100)
        .then(({ data }) => { if (data) setAlerts(data); });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const markers = alerts.map(a => {
    const base = zoneCoords[a.location] || [17.6599, 75.9064];
    return {
      ...a,
      lat: base[0] + (Math.random() - 0.5) * 0.01,
      lng: base[1] + (Math.random() - 0.5) * 0.01,
    };
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Hazard Heatmap</h1>
        <div className="rounded-xl overflow-hidden border border-border shadow-card" style={{ height: 500 }}>
          <MapContainer center={[17.6599, 75.9064]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map(m => (
              <CircleMarker key={m.id + m.lat} center={[m.lat, m.lng]} radius={10}
                pathOptions={{ color: riskColor(m.risk), fillColor: riskColor(m.risk), fillOpacity: 0.6 }}>
                <Popup>
                  <strong>{m.risk}</strong><br />{m.message}<br />
                  <small>{new Date(m.created_at).toLocaleString()}</small>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </AppLayout>
  );
}
