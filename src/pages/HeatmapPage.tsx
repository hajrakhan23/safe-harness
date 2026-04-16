import { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import L from 'leaflet';
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
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    const fetchAlerts = () => {
      supabase.from('alerts').select('id, message, risk, location, created_at')
        .order('created_at', { ascending: false }).limit(100)
        .then(({ data }) => { if (data) setAlerts(data); });
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([17.6599, 75.9064], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
      }).addTo(mapRef.current);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    alerts.forEach(a => {
      const base = zoneCoords[a.location] || [17.6599, 75.9064];
      const lat = base[0] + (Math.random() - 0.5) * 0.01;
      const lng = base[1] + (Math.random() - 0.5) * 0.01;
      const color = riskColor(a.risk);
      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        color,
        fillColor: color,
        fillOpacity: 0.6,
      }).addTo(mapRef.current!);
      marker.bindPopup(`<strong>${a.risk}</strong><br/>${a.message}<br/><small>${new Date(a.created_at).toLocaleString()}</small>`);
      markersRef.current.push(marker);
    });
  }, [alerts]);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Hazard Heatmap</h1>
        <div className="rounded-xl overflow-hidden border border-border shadow-card" style={{ height: 500 }}>
          <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </AppLayout>
  );
}
