import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, Alert, RiskLevel, generateSensorData, classifyRisk, generateAlert } from '@/utils/riskLogic';

export function useSensorSimulation(intervalMs = 3000) {
  const [sensorData, setSensorData] = useState<SensorData>(generateSensorData());
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('SAFE');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<SensorData[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const tick = useCallback(() => {
    const data = generateSensorData();
    const risk = classifyRisk(data.gas_level, data.oxygen_level);
    setSensorData(data);
    setRiskLevel(risk);
    setHistory(prev => [...prev.slice(-59), data]);

    const alert = generateAlert(data, risk);
    if (alert) {
      setAlerts(prev => [alert, ...prev].slice(0, 50));
    }
  }, []);

  useEffect(() => {
    tick();
    intervalRef.current = setInterval(tick, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [tick, intervalMs]);

  const triggerSOS = useCallback(() => {
    const sos: Alert = {
      id: crypto.randomUUID(),
      type: 'sos',
      severity: 'CRITICAL',
      message: '🚨 SOS triggered by worker!',
      timestamp: new Date().toISOString(),
      worker_id: 'W-001',
      worker_name: 'Rajesh Kumar',
      acknowledged: false,
    };
    setAlerts(prev => [sos, ...prev].slice(0, 50));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  return { sensorData, riskLevel, alerts, history, triggerSOS, acknowledgeAlert };
}
