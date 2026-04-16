import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Activity, Bell, Users, BarChart3, ClipboardList, ChevronRight, Heart, Star } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';

const heroSlides = [
  { title: 'Real-Time Safety Monitoring', subtitle: 'Track gas levels, oxygen, and temperature for every worker on-site.' },
  { title: 'Instant Emergency Alerts', subtitle: 'Automated alerts and SOS system to ensure rapid response.' },
  { title: 'Data-Driven Protection', subtitle: 'Analytics and insights to prevent hazardous incidents.' },
];

const features = [
  { icon: Activity, title: 'Live Sensor Monitoring', desc: 'Real-time gas, oxygen & temperature tracking with 3-second updates.' },
  { icon: Bell, title: 'Smart Alert System', desc: 'Automated risk detection with instant notifications.' },
  { icon: Shield, title: 'SOS Emergency', desc: 'One-tap emergency button for immediate assistance.' },
  { icon: ClipboardList, title: 'Task Management', desc: 'Assign and track sanitation tasks efficiently.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Trends, exposure data, and incident reports.' },
  { icon: Users, title: 'Worker Profiles', desc: 'Monitor individual worker safety and history.' },
];

const stats = [
  { label: 'Workers Protected', value: 2450, suffix: '+' },
  { label: 'Alerts Resolved', value: 12800, suffix: '+' },
  { label: 'Tasks Completed', value: 8500, suffix: '+' },
  { label: 'Incidents Prevented', value: 340, suffix: '+' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = Math.ceil(value / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(current);
    }, 20);
    return () => clearInterval(timer);
  }, [started, value]);

  return <div ref={ref} className="text-4xl font-display font-bold text-primary">{count.toLocaleString()}{suffix}</div>;
}

const testimonials = [
  { name: 'Dr. Anita Sharma', role: 'Municipal Health Officer', text: 'Suraksha360 has transformed how we monitor worker safety. The real-time alerts have saved lives.', rating: 5 },
  { name: 'Vikram Patel', role: 'Sanitation Supervisor', text: 'The dashboard gives me complete visibility into my team\'s safety status at all times.', rating: 5 },
  { name: 'Priya Mehta', role: 'NGO Director', text: 'This system brings much-needed dignity and protection to our sanitation workers.', rating: 5 },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % heroSlides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8" />
              <span className="text-sm font-medium opacity-90">Suraksha360 – Smart Safety System</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 leading-tight">
              Ensuring Safety & Dignity for Sanitation Workers
            </h1>
            <div className="h-16 mb-6">
              <motion.p key={currentSlide} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-lg md:text-xl opacity-90">
                {heroSlides[currentSlide].subtitle}
              </motion.p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-card text-card-foreground font-semibold rounded-lg hover:shadow-elevated transition-all">
                Get Started <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-current font-semibold rounded-lg hover:bg-primary-foreground/10 transition-all">
                View Dashboard
              </Link>
            </div>
            <div className="flex gap-2 mt-8">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-primary-foreground' : 'w-2 bg-primary-foreground/40'}`} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Comprehensive Safety Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to monitor, protect, and manage sanitation worker safety in real-time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
                <p className="text-muted-foreground mt-1 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Impact Stories</h2>
            <p className="text-muted-foreground">Hear from the people making a difference.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-accent text-accent" />)}
                </div>
                <p className="text-card-foreground mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-card-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">Suraksha360</span>
            </div>
            <p className="text-muted-foreground text-sm">© 2026 Suraksha360. Protecting those who protect our cities.</p>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
}
