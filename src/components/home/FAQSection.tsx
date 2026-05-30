import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
const faqs = [
  {
    question: 'How does LEGALMATE work?',
    answer: 'LEGALMATE connects you with verified lawyers for instant consultations via chat, audio, or video. Simply browse lawyers, choose one based on your legal need, and start a session. You pay only for the time you use.',
  },
  {
    question: 'Are the lawyers on LEGALMATE verified?',
    answer: 'Yes, every lawyer on our platform goes through a rigorous verification process including bar council credential checks, identity verification, and professional background screening.',
  },
  {
    question: 'How much does a consultation cost?',
    answer: 'Costs vary by lawyer and are displayed on their profile. We use a transparent pay-per-minute model so you only pay for the time you actually use. No hidden fees or subscription required.',
  },
  {
    question: 'Is my consultation private and confidential?',
    answer: 'Absolutely. All consultations are end-to-end encrypted. We adhere to strict privacy policies and your data is never shared with third parties.',
  },
  {
    question: 'Can I choose a lawyer who speaks my language?',
    answer: 'Yes, you can filter lawyers by language. Our platform supports multiple languages to ensure you can communicate comfortably with your legal advisor.',
  },
  {
    question: 'What if I\'m not satisfied with my consultation?',
    answer: 'We have a satisfaction guarantee policy. If you\'re not happy with the consultation, you can request a review and may be eligible for a partial or full refund depending on the circumstances.',
  },
];
export const FAQSection = () => {
  return (
    <>

      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">FAQ</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about using LEGALMATE.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-card transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
};