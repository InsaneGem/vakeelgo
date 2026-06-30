
import { CheckCircle2 } from 'lucide-react';
import constitutionofindia from "../../assets/Book.jpg";

const advantages = [
  'Bar-council verified lawyers with proven track records',
  'Instant consultations via chat, audio, or video',
  'Transparent pay-per-minute pricing with no hidden fees',
  '24/7 availability across multiple time zones',
  'End-to-end encrypted and 100% confidential sessions',
  'Multi-language support for global accessibility',
  'Dedicated dashboard to track all your legal matters',
  'Satisfaction guarantee with easy refund policy',
];

export const WhyChoose = () => {
  return (
    <section className="py-12 md:py-20 -mt-10 md:-mt-10 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">

          {/* LEFT - IMAGE */}
          <div className="relative flex justify-center">
            <div className="
              relative
              w-full max-w-xs sm:max-w-sm md:max-w-md
              rounded-2xl overflow-hidden
              border border-black/80
              bg-background/80 backdrop-blur-md
              shadow-md
            ">
              <img
                src={constitutionofindia}
                alt="Constitution of India"
                className="w-full h-full object-contain p-3"
              />
            </div>
          </div>

          {/* RIGHT - CONTENT */}
          <div>

            {/* HEADER */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Why VakeelGo
            </p>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
              The Smarter Way to Get Legal Help
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed max-w-xl">
              VakeelGo connects you with top-tier legal professionals through a modern, secure, and affordable platform built for today's world.
            </p>

            {/* ADVANTAGES LIST */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

              {advantages.map((item, index) => (
                <li
                  key={index}
                  className="
                    flex items-start gap-2 sm:gap-3
                    p-3 sm:p-4
                    rounded-lg
                    border border-border/50
                    bg-background/70
                    hover:bg-primary/5
                    transition-all duration-300
                  "
                >
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-[12px] sm:text-sm leading-snug">
                    {item}
                  </span>
                </li>
              ))}

            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
