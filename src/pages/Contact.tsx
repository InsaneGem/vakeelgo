import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare, ArrowLeft
} from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Message Sent!',
      description: 'We will get back to you within 24 hours.',
    });

    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
        {/* Ambient Grid Lines & Glow Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-slate-800/10 to-transparent blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4">
            Communications Desk
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            Contact Us
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed font-light tracking-wide">
            Initialize communication pathways to our support network or log direct inquiries regarding custom platform configurations.
          </p>
        </div>
      </section>

      {/* MAIN PREMIUM LIGHT CANVAS AREA */}
      <main className="container mx-auto px-4 max-w-6xl py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Informational Channel Parameters */}
          <div className="space-y-4">
            <div className="pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Directory Channels</span>
              <h2 className="font-serif text-xl font-bold text-slate-900 tracking-tight mb-3">
                Get in Touch
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
                Whether diagnosing technical runtime anomalies or processing account parameters, select your optimized contact point.
              </p>
            </div>

            {/* Email Card */}
            <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:border-slate-300 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-3xs">
                    <Mail className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-900 tracking-tight">Email Network</h3>
                    <p className="text-slate-600 text-xs font-mono font-light tracking-tight select-all">support@legalmate.com</p>
                    <p className="text-slate-400 text-xs font-mono font-light tracking-tight select-all">info@legalmate.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:border-slate-300 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-3xs">
                    <Phone className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-900 tracking-tight">Voice Hotline</h3>
                    <p className="text-slate-600 text-xs font-mono font-light tracking-tight">+1 (800) 123-4567</p>
                    <p className="text-slate-400 text-xs font-mono font-light tracking-tight">+1 (800) 987-6543</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Location Card */}
            <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:border-slate-300 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-3xs">
                    <MapPin className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-900 tracking-tight">Physical Headquarters</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      123 Legal Avenue, Suite 500<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational Clock Card */}
            <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:border-slate-300 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-3xs">
                    <Clock className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-900 tracking-tight">Operational Hours</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Input Matrix */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-3xs">
                    <MessageSquare className="h-4 w-4 text-slate-700" />
                  </div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Send us a Message
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-slate-400 h-10 text-xs sm:text-sm rounded-xl transition-all shadow-3xs"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-slate-400 h-10 text-xs sm:text-sm rounded-xl transition-all shadow-3xs"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-slate-400 h-10 text-xs sm:text-sm rounded-xl transition-all shadow-3xs"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-slate-400 h-10 text-xs sm:text-sm rounded-xl transition-all shadow-3xs"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-slate-400 text-xs sm:text-sm rounded-xl resize-none min-h-[150px] transition-all shadow-3xs p-3 font-light"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full md:w-auto bg-slate-950 text-white hover:bg-slate-900 font-medium text-xs h-10 px-6 tracking-wide rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        'Sending Transmissions...'
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 text-slate-400" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Contact;