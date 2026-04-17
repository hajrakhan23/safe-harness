import { useEffect, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Zone {
  name: string;
  lat: number;
  lng: number;
  risk: 'CRITICAL' | 'WARNING' | 'SAFE';
  detail: string;
}

const mumbaiZones: Zone[] = [
  { name: 'Dharavi', lat: 19.0444, lng: 72.8570, risk: 'CRITICAL', detail: 'High gas accumulation in sewer network' },
  { name: 'Sion', lat: 19.0433, lng: 72.8610, risk: 'CRITICAL', detail: 'Critical oxygen levels detected' },
  { name: 'Chembur', lat: 19.0626, lng: 72.9005, risk: 'WARNING', detail: 'Elevated temperature & gas readings' },
  { name: 'Andheri East', lat: 19.1136, lng: 72.8697, risk: 'WARNING', detail: 'Periodic methane spikes' },
  { name: 'Borivali', lat: 19.2307, lng: 72.8567, risk: 'WARNING', detail: 'Sewer maintenance ongoing' },
  { name: 'Colaba', lat: 18.9067, lng: 72.8147, risk: 'SAFE', detail: 'All sensors within normal range' },
  { name: 'Bandra West', lat: 19.0596, lng: 72.8295, risk: 'SAFE', detail: 'Clear conditions' },
  { name: 'Powai', lat: 19.1176, lng: 72.9060, risk: 'SAFE', detail: 'Routine inspection complete' },
];

const riskColor = (r: Zone['risk']) =>
  r === 'CRITICAL' ? '#ef4444' : r === 'WARNING' ? '#f59e0b' : '#22c55e';

export default function HeatmapPage() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [19.0760, 72.8777],
      zoom: 11,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mumbaiZones.forEach(z => {
      const color = riskColor(z.risk);
      L.circle([z.lat, z.lng], {
        radius: 1200,
        color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2,
      })
        .bindPopup(
          `<div style="font-family:system-ui;min-width:160px">
            <strong style="color:${color};font-size:14px">${z.name}</strong><br/>
            <span style="font-size:12px;color:#666">Risk: ${z.risk}</span><br/>
            <span style="font-size:11px">${z.detail}</span>
          </div>`
        )
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Hazard Heatmap</h1>
            <p className="text-muted-foreground text-sm">Real-time risk visualization across Mumbai zones</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-critical" />Critical</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-warning" />Warning</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-success" />Safe</span>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-border shadow-card" style={{ height: 560 }}>
          <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </AppLayout>
  );
}
