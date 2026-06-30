import { MessageSquare, Video, Phone, Wallet, Clock, Shield } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Chat Consultation',
    description: 'Get instant legal advice through secure text chat with verified lawyers.',
  },
  {
    icon: Video,
    title: 'Video Calls',
    description: 'Face-to-face consultations from anywhere in the world.',
  },
  {
    icon: Phone,
    title: 'Audio Calls',
    description: 'Quick voice consultations when you need immediate guidance.',
  },
  {
    icon: Wallet,
    title: 'Pay Per Minute',
    description: 'Only pay for the time you use. No hidden fees or surprises.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Connect with lawyers anytime, any day of the week.',
  },
  {
    icon: Shield,
    title: 'Verified Experts',
    description: 'All lawyers are verified with bar council credentials.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            How VakeelGo Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get professional legal advice in three simple steps: Choose your lawyer,
            start a consultation, and get the answers you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 bg-card rounded-lg border border-border hover:shadow-card transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
