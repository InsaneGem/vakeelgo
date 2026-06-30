import { Star, Quote } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Business Owner',
    rating: 5,
    text: 'VakeelGo made it incredibly easy to get quick legal advice for my startup. The video consultation was seamless and the lawyer was extremely knowledgeable.',
  },
  {
    name: 'Rahul Verma',
    role: 'Software Engineer',
    rating: 5,
    text: 'I needed urgent advice on a property dispute. Within minutes, I was connected with a specialist who guided me step-by-step. Highly recommend!',
  },
  {
    name: 'Anita Desai',
    role: 'Freelancer',
    rating: 5,
    text: 'The pay-per-minute model is brilliant. I didn\'t have to pay for a full consultation — just the 12 minutes I needed. Transparent and affordable.',
  },
  {
    name: 'Mohammed Khan',
    role: 'HR Manager',
    rating: 5,
    text: 'Our company now uses VakeelGo for all employee-related legal queries. The multi-language support is a huge plus for our diverse team.',
  },
  {
    name: 'Sneha Patel',
    role: 'Teacher',
    rating: 4,
    text: 'I was nervous about consulting a lawyer online, but the experience was professional and confidential. The lawyer made me feel at ease throughout.',
  },
];
export const TestimonialSection = () => {
  return (
    <section className="py-12 md:py-20 -mt-10 md:-mt-10 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Testimonials</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thousands of clients trust VakeelGo for their legal needs.
          </p>
        </div>
        <div className="max-w-5xl mx-auto px-12">
          <Carousel opts={{ align: 'start', loop: true }}>
            <CarouselContent>
              {testimonials.map((t, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <div className="p-8 bg-card rounded-xl border border-border h-full flex flex-col">
                    <Quote className="h-8 w-8 text-muted-foreground/30 mb-4" />
                    <p className="text-sm leading-relaxed text-muted-foreground flex-1 mb-6">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < t.rating ? 'text-gold fill-gold' : 'text-border'}`}
                        />
                      ))}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
