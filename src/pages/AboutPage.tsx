import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Shield, Users, Heart } from 'lucide-react';

const team = [
  { name: 'Hajra Khan', role: 'Project Lead', description: 'Leading the vision for smart worker safety systems.' },
  { name: 'Bushra Kazi', role: 'Backend Developer', description: 'Building robust backend infrastructure and data pipelines.' },
  { name: 'Aakef Shaikh', role: 'Frontend Developer', description: 'Crafting intuitive interfaces for real-time monitoring.' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center space-y-3">
          <Shield className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-display font-bold text-foreground">About Suraksha360</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A smart safety and assistance system designed to protect sanitation workers through real-time monitoring, alerts, and data-driven decision making.
          </p>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-critical" />
            <h2 className="text-lg font-display font-semibold text-card-foreground">The Problem</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sanitation workers face life-threatening hazards daily — toxic gas exposure, oxygen depletion, and extreme temperatures in confined spaces. Manual monitoring is unreliable and often too late.
          </p>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground mb-2">🎯 Mission</h3>
            <p className="text-muted-foreground text-sm">Provide real-time digital safety monitoring to protect every sanitation worker on duty.</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h3 className="font-display font-semibold text-card-foreground mb-2">👁️ Vision</h3>
            <p className="text-muted-foreground text-sm">A future where no worker enters a hazardous zone without smart digital protection.</p>
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">Our Team</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-card rounded-xl p-5 shadow-card text-center space-y-2 border border-border">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">{member.name[0]}</span>
                </div>
                <h3 className="font-display font-semibold text-card-foreground">{member.name}</h3>
                <p className="text-xs text-primary font-medium">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
