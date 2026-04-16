export type RiskLevel = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface SensorData {
  id?: string;
  gas_level: number;
  oxygen_level: number;
  temperature: number;
  timestamp: string;
  worker_id?: string;
}

export interface Alert {
  id: string;
  type: 'gas' | 'oxygen' | 'temperature' | 'sos' | 'system';
  severity: RiskLevel;
  message: string;
  timestamp: string;
  worker_id?: string;
  worker_name?: string;
  acknowledged: boolean;
}

export interface Task {
  id: string;
  title: string;
  worker_name: string;
  location: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export function classifyRisk(gasLevel: number, oxygenLevel: number): RiskLevel {
  if (gasLevel > 70 || oxygenLevel < 16) return 'CRITICAL';
  if (gasLevel > 40 || oxygenLevel < 18) return 'WARNING';
  return 'SAFE';
}

export function generateSensorData(): SensorData {
  return {
    gas_level: Math.round(Math.random() * 100),
    oxygen_level: +(15 + Math.random() * 6).toFixed(1),
    temperature: +(25 + Math.random() * 15).toFixed(1),
    timestamp: new Date().toISOString(),
    worker_id: 'W-001',
  };
}

export function generateAlert(sensor: SensorData, risk: RiskLevel): Alert | null {
  if (risk === 'SAFE') return null;

  let message = '';
  let type: Alert['type'] = 'system';

  if (sensor.gas_level > 70) { message = `Critical gas level: ${sensor.gas_level}%`; type = 'gas'; }
  else if (sensor.gas_level > 40) { message = `Elevated gas level: ${sensor.gas_level}%`; type = 'gas'; }
  else if (sensor.oxygen_level < 16) { message = `Critical oxygen: ${sensor.oxygen_level}%`; type = 'oxygen'; }
  else if (sensor.oxygen_level < 18) { message = `Low oxygen: ${sensor.oxygen_level}%`; type = 'oxygen'; }

  return {
    id: crypto.randomUUID(),
    type,
    severity: risk,
    message,
    timestamp: sensor.timestamp,
    worker_id: sensor.worker_id,
    worker_name: 'Rajesh Kumar',
    acknowledged: false,
  };
}

export const riskColors: Record<RiskLevel, string> = {
  SAFE: 'bg-success text-success-foreground',
  WARNING: 'bg-warning text-warning-foreground',
  CRITICAL: 'bg-critical text-critical-foreground',
};

export const riskBorderColors: Record<RiskLevel, string> = {
  SAFE: 'border-success',
  WARNING: 'border-warning',
  CRITICAL: 'border-critical',
};
