import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react';

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account on VakeelGo?',
        a: 'Creating an account is simple. Click on "Get Started" or "Sign Up" button, enter your email address, create a password, and fill in your basic details. You can sign up as a client seeking legal advice or as a lawyer offering services.'
      },
      {
        q: 'Is VakeelGo free to use?',
        a: 'Creating an account and browsing lawyer profiles is completely free. You only pay when you book a consultation with a lawyer. Each lawyer sets their own consultation rates, which are clearly displayed on their profile.'
      },
      {
        q: 'How do I find the right lawyer for my case?',
        a: 'You can search for lawyers by practice area, experience level, language, ratings, and availability. Each lawyer profile includes their qualifications, specializations, client reviews, and consultation rates to help you make an informed decision.'
      },
      {
        q: 'Are the lawyers on VakeelGo verified?',
        a: 'Yes, all lawyers on our platform undergo a thorough verification process. We verify their Bar Council registration, educational qualifications, and professional credentials before they can offer consultations.'
      }
    ]
  },
  {
    id: 'consultations',
    title: 'Consultations',
    questions: [
      {
        q: 'What types of consultations are available?',
        a: 'We offer three types of consultations: Chat (text-based messaging), Audio Call (voice conversation), and Video Call (face-to-face video conference). Choose based on your preference and the complexity of your legal matter.'
      },
      {
        q: 'How long is a typical consultation?',
        a: 'Consultation duration varies based on the lawyer and type of consultation. Most consultations range from 15 minutes to 1 hour. You can see the exact duration and pricing before booking.'
      },
      {
        q: 'Can I share documents during a consultation?',
        a: 'Yes, you can share documents securely during chat consultations. For audio and video calls, you can share your screen or upload documents beforehand for the lawyer to review.'
      },
      {
        q: 'Are consultations recorded?',
        a: 'Consultations can be recorded with mutual consent for your reference. All recordings are stored securely and are only accessible to you and your lawyer. You can request to have recordings deleted at any time.'
      },
      {
        q: 'What if I miss my scheduled consultation?',
        a: 'If you miss a scheduled consultation without prior notice, you may be charged a no-show fee. We recommend rescheduling at least 2 hours before your appointment if you cannot make it.'
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Billing',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards, UPI, net banking, and popular digital wallets. All payments are processed through secure, encrypted payment gateways.'
      },
      {
        q: 'How is the consultation fee calculated?',
        a: 'Each lawyer sets their own rates, either per session or per minute. The total cost is displayed before you confirm your booking. For per-minute billing, you will only be charged for the actual duration of the consultation.'
      },
      {
        q: 'Can I get a refund if I am not satisfied?',
        a: 'Yes, we have a fair refund policy. If you experience technical issues that prevent the consultation, or if the lawyer fails to join, you will receive a full refund. For other concerns, please contact our support team.'
      },
      {
        q: 'Will I receive an invoice for my consultation?',
        a: 'Yes, you will receive a detailed invoice via email after each consultation. You can also access all your invoices from your dashboard under the billing section.'
      }
    ]
  },
  {
    id: 'lawyers',
    title: 'For Lawyers',
    questions: [
      {
        q: 'How can I join VakeelGo as a lawyer?',
        a: 'Click on "Join as Lawyer" and complete the registration process. You will need to provide your Bar Council registration number, educational qualifications, and practice details. Our team will verify your credentials within 24-48 hours.'
      },
      {
        q: 'How do I set my consultation rates?',
        a: 'Once verified, you can set your own consultation rates from your dashboard. You can choose between per-session or per-minute pricing for different consultation types.'
      },
      {
        q: 'When and how do I receive payments?',
        a: 'Payments are processed weekly. You can withdraw your earnings to your bank account once you have reached the minimum withdrawal threshold. All transactions are tracked in your wallet.'
      },
      {
        q: 'What is the platform commission?',
        a: 'VakeelGo charges a small commission on each consultation to maintain the platform and provide support services. The exact rate is disclosed during registration.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Support',
    questions: [
      {
        q: 'What browsers are supported?',
        a: 'VakeelGo works best on the latest versions of Chrome, Firefox, Safari, and Edge. For video consultations, we recommend using Chrome or Firefox for the best experience.'
      },
      {
        q: 'I am having issues with video/audio. What should I do?',
        a: 'First, ensure your browser has permission to access your camera and microphone. Check your internet connection and try refreshing the page. If issues persist, try using a different browser or contact our support team.'
      },
      {
        q: 'Is my data secure on VakeelGo?',
        a: 'Absolutely. We use industry-standard encryption for all communications and data storage. Your conversations are protected by end-to-end encryption, and we comply with all applicable data protection regulations.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Click on "Forgot Password" on the login page and enter your registered email address. You will receive a password reset link that is valid for 24 hours.'
      }
    ]
  }
];

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50/60 min-h-screen text-slate-600 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
      <button
        onClick={() => navigate(-1)}
        className="hidden md:flex absolute top-20 left-8 z-50 items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>
      {/* EXOTIC PREMIUM DARK HERO SECTION */}
      <section className="relative bg-slate-950 py-16 sm:py-24 overflow-hidden border-b border-slate-900">
        {/* Ambient Grid Lines & Accent Blur */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4">
            Operations Matrix
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Review documented core runtime frameworks, transaction parameters, and procedural infrastructure blueprints for the platform.
          </p>
        </div>
      </section>

      {/* MAIN FAQS WHITE CANVAS AREA */}
      <main className="container mx-auto px-4 max-w-3xl py-16 sm:py-24">
        {faqCategories.map((category) => (
          <div
            key={category.id}
            id={category.id}
            className="mb-16 scroll-mt-24"
          >
            {/* Category Header Bar */}
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200/80 pb-4">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <HelpCircle className="h-4 w-4 text-slate-700" />
              </div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {category.title}
              </h2>
            </div>

            {/* Accordion List Component */}
            <Accordion type="single" collapsible className="space-y-3.5">
              {category.questions.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`${category.id}-${index}`}
                  className="border border-slate-200/80 rounded-xl px-5 bg-white data-[state=open]:border-slate-300 shadow-2xs transition-all duration-200 overflow-hidden"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4 text-slate-900 hover:text-slate-950 text-xs sm:text-sm font-semibold tracking-tight gap-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 text-xs sm:text-sm leading-relaxed pb-5 border-t border-slate-100 pt-4 font-light">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </main>

      {/* FOOTER TRIAGE ADVISORY PANEL */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100 pointer-events-none" />

        <div className="container mx-auto px-4 text-center max-w-xl relative z-10">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <MessageCircle className="h-4 w-4 text-slate-700" />
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
            Still Have Questions?
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-8 font-light">
            If your structural configuration requirement lacks documented parameter resolution, initialize direct routing vectors to support systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto bg-slate-950 text-white hover:bg-slate-900 font-medium text-xs px-5 h-10 tracking-wide rounded-lg shadow-sm transition-colors group"
            >
              Contact Support
              <ChevronRight className="ml-1 h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/help')}
              className="w-full sm:w-auto border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium text-xs px-5 h-10 tracking-wide rounded-lg shadow-2xs transition-colors"
            >
              Visit Help Center
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FAQ;