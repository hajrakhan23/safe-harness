import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_s63ntv1';
const TEMPLATE_ID = 'template_igfpn0o';
const PUBLIC_KEY = 'F0Y4vDRe847839sgH';

export async function sendAlertEmail(alert: { message: string; location: string; risk: string }) {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      message: alert.message,
      location: alert.location,
      risk: alert.risk,
      time: new Date().toLocaleString(),
    }, PUBLIC_KEY);
  } catch (err) {
    console.error('EmailJS send failed:', err);
  }
}
