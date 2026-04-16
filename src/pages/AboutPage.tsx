import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Shield, Target, Eye, Heart, Users } from 'lucide-react';

const team = [
  { name: 'Dr. Priya Sharma', role: 'Project Lead', desc: 'Public health expert with 15 years of experience in worker safety.' },
  { name: 'Arjun Patel', role: 'Tech Lead', desc: 'Full-stack developer specializing in IoT and real-time systems.' },
  { name: 'Kavita Reddy', role: 'Field Coordinator', desc: 'Connects technology with on-ground sanitation teams.' },
  { name: 'Ravi Gupta', role: 'Data Analyst', desc: 'Transforms safety data into actionable insights.' },
];

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
          <Shield className="h-14 w-14 text-primary mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">About Suraksha360</h1>
          <p className="text-muted-foreground text-lg">Protecting the invisible workforce that keeps our cities clean and safe.</p>
        </motion.div>

        {/* Problem */}
        <div className="bg-card rounded-xl p-8 shadow-card max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-card-foreground mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6 text-critical" /> The Problem
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Sanitation workers face life-threatening hazards daily — toxic gases in sewers, oxygen-depleted environments, extreme temperatures, and the constant risk of accidents. Despite being essential to public health, they often lack basic safety monitoring. Many incidents go unreported, and emergency response is delayed due to lack of real-time information.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card rounded-xl p-6 shadow-card">
            <Target className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-display font-bold text-xl text-card-foreground mb-2">Our Mission</h3>
            <p className="text-muted-foreground">To provide every sanitation worker with real-time safety monitoring, ensuring no one enters a hazardous environment without protection and oversight.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card rounded-xl p-6 shadow-card">
            <Eye className="h-8 w-8 text-secondary mb-3" />
            <h3 className="font-display font-bold text-xl text-card-foreground mb-2">Our Vision</h3>
            <p className="text-muted-foreground">A future where technology ensures zero fatalities in sanitation work, where every worker returns home safely every day.</p>
          </motion.div>
        </div>

        {/* Team */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-5 shadow-card">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="font-display font-bold text-primary">{t.name[0]}</span>
                </div>
                <h4 className="font-semibold text-card-foreground">{t.name}</h4>
                <p className="text-sm text-primary font-medium">{t.role}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
