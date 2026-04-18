import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, Alert, RiskLevel, generateSensorData, classifyRisk, generateAlert } from '@/utils/riskLogic';
import { supabase } from '@/integrations/supabase/client';
import { sendAlertEmail } from '@/utils/emailService';
import { playBeepSound } from '@/utils/alertSound';

export function useSensorSimulation(intervalMs = 9000) {
  const [sensorData, setSensorData] = useState<SensorData>(generateSensorData());
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('SAFE');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<SensorData[]>([]);
  const lastAlertTime = useRef(0);

  // Load initial data from DB
  useEffect(() => {
    supabase.from('sensor_data').select('*').order('created_at', { ascending: false }).limit(60)
      .then(({ data }) => {
        if (data && data.length) {
          setHistory(data.reverse().map(d => ({
            gas_level: Number(d.gas_level),
            oxygen_level: Number(d.oxygen_level),
            temperature: Number(d.temperature),
            timestamp: d.created_at,
            worker_id: d.worker_id || 'W-001',
          })));
        }
      });

    supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => {
        if (data) {
          setAlerts(data.map(a => ({
            id: a.id,
            type: (a.type || 'system') as Alert['type'],
            severity: a.risk as RiskLevel,
            message: a.message,
            timestamp: a.created_at,
            worker_id: 'W-001',
            worker_name: a.worker_name || 'Rajesh Kumar',
            acknowledged: a.acknowledged ?? false,
          })));
        }
      });
  }, []);

  const tick = useCallback(async () => {
    const data = generateSensorData();
    const risk = classifyRisk(data.gas_level, data.oxygen_level);
    setSensorData(data);
    setRiskLevel(risk);
    setHistory(prev => [...prev.slice(-59), data]);

    // Insert into DB (best-effort)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      supabase.from('sensor_data').insert([{
        user_id: user.id,
        gas_level: data.gas_level,
        oxygen_level: data.oxygen_level,
        temperature: data.temperature,
        worker_id: data.worker_id,
      }]).then(() => {});
    }

    // AUTO-SOS: gas > 80 OR oxygen < 18 → critical hazardous condition
    const isHazardous = data.gas_level > 80 || data.oxygen_level < 18;

    // Risk-based alert with cooldown
    if (risk !== 'SAFE' || isHazardous) {
      const now = Date.now();
      if (risk === 'CRITICAL' && now - lastAlertTime.current < 30000) return;
      if (risk === 'CRITICAL') lastAlertTime.current = now;

      const alert = generateAlert(data, risk);
      if (alert) {
        // Auto-SOS override
        if (isHazardous) {
          alert.type = 'sos';
          alert.severity = 'CRITICAL';
          alert.message = `🚨 AUTO-SOS: Hazardous condition (gas ${data.gas_level}%, O₂ ${data.oxygen_level}%)`;
        }

        setAlerts(prev => [alert, ...prev].slice(0, 50));

        if (user) {
          supabase.from('alerts').insert([{
            user_id: user.id,
            message: alert.message,
            location: 'Solapur Zone 1',
            risk: isHazardous ? 'CRITICAL' : risk,
            type: alert.type,
            worker_name: alert.worker_name,
          }]).then(() => {});
        }

        if (risk === 'CRITICAL' || isHazardous) {
          playBeepSound();
          sendAlertEmail({
            message: alert.message,
            location: 'Solapur Zone 1',
            risk: 'CRITICAL',
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, intervalMs);
    return () => clearInterval(interval);
  }, [tick, intervalMs]);

  const triggerSOS = useCallback(async () => {
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
    playBeepSound();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      supabase.from('incidents').insert([{
        user_id: user.id,
        type: 'SOS',
        location: 'Live Location',
        status: 'ACTIVE',
        worker_name: 'Rajesh Kumar',
      }]).then(() => {});

      supabase.from('alerts').insert([{
        user_id: user.id,
        message: sos.message,
        location: 'Live Location',
        risk: 'CRITICAL',
        type: 'sos',
        worker_name: 'Rajesh Kumar',
      }]).then(() => {});
    }

    sendAlertEmail({ message: 'SOS Triggered', location: 'Live Location', risk: 'CRITICAL' });
  }, []);

  const acknowledgeAlert = useCallback(async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    supabase.from('alerts').update({ acknowledged: true }).eq('id', id).then(() => {});
  }, []);

  return { sensorData, riskLevel, alerts, history, triggerSOS, acknowledgeAlert };
}
