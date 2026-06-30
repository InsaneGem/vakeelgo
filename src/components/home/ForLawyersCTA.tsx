import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Globe, Clock } from 'lucide-react';
const benefits = [
  { icon: Users, text: 'Reach thousands of potential clients' },
  { icon: TrendingUp, text: 'Grow your practice with flexible scheduling' },
  { icon: Globe, text: 'Consult clients from anywhere in the world' },
  { icon: Clock, text: 'Set your own hours and rates' },
];
export const ForLawyersCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/60 mb-3">For Legal Professionals</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Grow Your Legal Practice with VakeelGo
            </h2>
            <p className="text-primary-foreground/70 mb-8 leading-relaxed">
              Join our network of verified lawyers and connect with clients seeking expert legal advice.
              Set your own rates, manage your schedule, and build your reputation.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-8 group"
              onClick={() => navigate('/signup?role=lawyer')}
            >
              Join as a Lawyer
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            {benefits.map((b) => (
              <div key={b.text} className="p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm">
                <b.icon className="h-6 w-6 text-primary-foreground mb-3" />
                <p className="text-primary-foreground/90 text-sm font-medium">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};