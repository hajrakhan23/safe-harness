import { supabase } from '@/integrations/supabase/client';
import emailjs from '@emailjs/browser';

/* ---------------- USER ---------------- */
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
};

/* ---------------- HEALTH DATA ---------------- */
export interface HealthData {
  age?: number | null;
  blood_group?: string | null;
  allergies?: string | null;
  conditions?: string | null;
  emergency_contact?: string | null;
  notes?: string | null;
}

export const getHealthData = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  return data;
};

export const saveHealthData = async (data: HealthData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not logged in');

  const existing = await supabase
    .from('health_data')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing.data?.id) {
    return await supabase
      .from('health_data')
      .update(data)
      .eq('id', existing.data.id);
  }
  return await supabase.from('health_data').insert([{ user_id: user.id, ...data }]);
};

/* ---------------- TASKS ---------------- */
export const completeTask = async (task: { id: string; title: string; description?: string | null; location?: string | null; worker_name?: string | null }) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not logged in');
  await supabase.from('task_history').insert([{
    user_id: user.id,
    title: task.title,
    description: task.description ?? null,
    location: task.location ?? null,
    worker_name: task.worker_name ?? null,
    status: 'completed',
  }]);
  return await supabase.from('tasks').delete().eq('id', task.id);
};

export const cancelTask = async (task: { id: string; title: string; description?: string | null; location?: string | null; worker_name?: string | null }) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not logged in');
  await supabase.from('task_history').insert([{
    user_id: user.id,
    title: task.title,
    description: task.description ?? null,
    location: task.location ?? null,
    worker_name: task.worker_name ?? null,
    status: 'cancelled',
  }]);
  return await supabase.from('tasks').delete().eq('id', task.id);
};

/* ---------------- SENSOR + SOS ---------------- */
let lastAlertTime = 0;

export interface SensorPayload {
  gas_level: number;
  oxygen_level: number;
  temperature: number;
  location?: string;
}

export const processSensorData = async (data: SensorPayload) => {
  const now = Date.now();
  if (now - lastAlertTime < 30000) return false;

  const isCritical = data.gas_level > 80 || data.oxygen_level < 18;
  if (!isCritical) return false;

  lastAlertTime = now;
  const user = await getCurrentUser();
  await supabase.from('alerts').insert([{
    user_id: user?.id,
    type: 'sos',
    risk: 'CRITICAL',
    message: `🚨 AUTO-SOS: gas ${data.gas_level}%, O₂ ${data.oxygen_level}%`,
    location: data.location ?? 'Live Location',
  }]);
  sendSOSMail({
    message: 'Hazardous condition detected',
    location: data.location ?? 'Live Location',
    risk: 'CRITICAL',
  });
  return true;
};

/* ---------------- EMAILS ---------------- */
const EMAILJS_SERVICE = 'service_s63ntv1';
const EMAILJS_PUBLIC_KEY = 'F0Y4vDRe847839sgH';
const EMAILJS_SOS_TEMPLATE = 'template_igfpn0o';
const EMAILJS_CONTACT_TEMPLATE = 'template_9peg19k';

export const sendSOSMail = (alert: { message: string; location: string; risk: string }) => {
  return emailjs.send(EMAILJS_SERVICE, EMAILJS_SOS_TEMPLATE, {
    message: alert.message,
    location: alert.location,
    risk: alert.risk,
    time: new Date().toLocaleString(),
  }, EMAILJS_PUBLIC_KEY).catch(err => console.error('SOS email failed:', err));
};

export const sendContactMail = (form: { name: string; email: string; subject?: string; message: string }) => {
  return emailjs.send(EMAILJS_SERVICE, EMAILJS_CONTACT_TEMPLATE, {
    name: form.name,
    email: form.email,
    subject: form.subject ?? '',
    message: form.message,
    time: new Date().toLocaleString(),
  }, EMAILJS_PUBLIC_KEY);
};

/* ---------------- LOCATION ---------------- */
export const saveLocation = async (coords: { lat: number; lng: number; accuracy?: number }) => {
  const user = await getCurrentUser();
  if (!user) return null;
  return await supabase.from('locations').insert([{
    user_id: user.id,
    latitude: coords.lat,
    longitude: coords.lng,
    accuracy: coords.accuracy ?? null,
  }]);
};
