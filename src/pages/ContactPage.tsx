import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill required fields'); return; }
    setLoading(true);
    try {
      await emailjs.send('service_s63ntv1', 'template_9peg19k', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        time: new Date().toLocaleString(),
      }, 'F0Y4vDRe847839sgH');
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: 'Email', value: 'support@suraksha360.org' },
            { icon: Phone, label: 'Phone', value: '+91 11 2345 6789' },
            { icon: MapPin, label: 'Address', value: 'New Delhi, India' },
          ].map((c, i) => (
            <div key={i} className="bg-card rounded-xl p-5 shadow-card text-center">
              <c.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-card-foreground text-sm">{c.label}</p>
              <p className="text-muted-foreground text-sm">{c.value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Your Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm" />
            <input type="email" placeholder="Email Address *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm" />
          </div>
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm" />
          <textarea placeholder="Your Message *" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none" />
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50">
            <Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
