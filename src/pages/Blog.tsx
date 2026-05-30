// import { useNavigate } from 'react-router-dom';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//     Newspaper,
//     Calendar,
//     ArrowRight,
//     Scale,
//     Shield,
//     Landmark,
//     Gavel,
//     TrendingUp,
//     BookOpen,
// } from 'lucide-react';

// // Static Data Definitions (Declared outside to prevent re-creation on re-renders)
// const featuredArticle = {
//     title: 'Supreme Court Expands Digital Privacy Protections in India',
//     category: 'Constitutional Law',
//     date: 'May 2026',
//     readTime: '6 min read',
//     image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop',
//     excerpt: 'The Supreme Court reaffirmed the importance of digital privacy rights, emphasizing stronger safeguards for personal data collection and online surveillance.',
// };

// const latestBlogs = [
//     {
//         title: 'Consumer Rights in Online Shopping: What Changed in 2026',
//         category: 'Consumer Law',
//         date: 'May 2026',
//         icon: Shield,
//         description: 'New e-commerce regulations now strengthen refund rights, seller transparency, and grievance redressal systems.',
//     },
//     {
//         title: 'Important Property Registration Updates Across Indian States',
//         category: 'Property Law',
//         date: 'April 2026',
//         icon: Landmark,
//         description: 'Several states introduced online registration systems and digital verification for property transactions.',
//     },
//     {
//         title: 'How Recent Labour Law Reforms Affect Employees & Startups',
//         category: 'Employment Law',
//         date: 'April 2026',
//         icon: TrendingUp,
//         description: 'The latest labour reforms simplify compliance requirements while strengthening worker protections.',
//     },
//     {
//         title: 'Motor Accident Compensation Rules Explained',
//         category: 'Insurance Law',
//         date: 'March 2026',
//         icon: Gavel,
//         description: 'Recent tribunal judgments have clarified compensation calculations and claim filing procedures.',
//     },
//     {
//         title: 'Understanding Data Protection Laws for Businesses',
//         category: 'Technology Law',
//         date: 'March 2026',
//         icon: Shield,
//         description: 'Indian businesses handling customer data must comply with new privacy and cybersecurity standards.',
//     },
//     {
//         title: 'Women’s Rights & Workplace Safety: Legal Developments',
//         category: 'Women Rights',
//         date: 'February 2026',
//         icon: Scale,
//         description: 'Courts are emphasizing stricter enforcement of workplace harassment prevention policies.',
//     },
// ];

// const trendingTopics = [
//     'Digital Privacy Rights',
//     'Consumer Protection Rules',
//     'Online Fraud Protection',
//     'Property Registration',
//     'Startup Compliance',
//     'Labour Law Reforms',
// ];

// const Blog = () => {
//     const navigate = useNavigate();

//     return (
//         <>

//             <main className="min-h-screen bg-background text-foreground">
//                 {/* Hero Section */}
//                 <header className="hero-gradient py-20">
//                     <div className="container mx-auto px-4 text-center">
//                         <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
//                             <Newspaper className="h-4 w-4 text-white" />
//                             <span className="text-white/90 text-sm font-medium">
//                                 Latest Legal Insights & News
//                             </span>
//                         </div>
//                         <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
//                             Legal Blog & Insights
//                         </h1>
//                         <p className="text-white/80 text-lg max-w-3xl mx-auto animate-fade-in">
//                             Stay informed with the latest legal developments, Supreme Court
//                             judgments, law amendments, policy reforms, and expert legal
//                             analysis from across India.
//                         </p>
//                     </div>
//                 </header>

//                 {/* Featured Article Section */}
//                 <section className="py-20">
//                     <div className="container mx-auto px-4 max-w-6xl">
//                         <div className="flex items-center gap-3 mb-10">
//                             <BookOpen className="h-7 w-7 text-primary" />
//                             <h2 className="font-serif text-3xl font-bold">
//                                 Featured Article
//                             </h2>
//                         </div>

//                         <Card className="overflow-hidden card-premium">
//                             <div className="grid lg:grid-cols-2">
//                                 <div className="h-full">
//                                     <img
//                                         src={featuredArticle.image}
//                                         alt={featuredArticle.title}
//                                         className="w-full h-full object-cover min-h-[320px]"
//                                     />
//                                 </div>
//                                 <div className="p-8 flex flex-col justify-center">
//                                     <div className="flex flex-wrap items-center gap-3 mb-4">
//                                         <span className="text-xs uppercase tracking-wider font-medium text-primary">
//                                             {featuredArticle.category}
//                                         </span>
//                                         <span className="text-xs text-muted-foreground flex items-center gap-1">
//                                             <Calendar className="h-3 w-3" />
//                                             {featuredArticle.date}
//                                         </span>
//                                         <span className="text-xs text-muted-foreground">
//                                             {featuredArticle.readTime}
//                                         </span>
//                                     </div>
//                                     <h3 className="font-serif text-3xl font-bold mb-4 leading-snug">
//                                         {featuredArticle.title}
//                                     </h3>
//                                     <p className="text-muted-foreground leading-relaxed mb-6">
//                                         {featuredArticle.excerpt}
//                                     </p>
//                                     <Button className="w-fit gap-2">
//                                         Read Full Article
//                                         <ArrowRight className="h-4 w-4" />
//                                     </Button>
//                                 </div>
//                             </div>
//                         </Card>
//                     </div>
//                 </section>

//                 {/* Latest Articles Section */}
//                 <section className="py-20 bg-secondary">
//                     <div className="container mx-auto px-4 max-w-6xl">
//                         <div className="flex items-center gap-3 mb-10">
//                             <TrendingUp className="h-7 w-7 text-primary" />
//                             <h2 className="font-serif text-3xl font-bold">
//                                 Latest Articles
//                             </h2>
//                         </div>

//                         <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
//                             {latestBlogs.map((blog, index) => {
//                                 const IconComponent = blog.icon;
//                                 return (
//                                     <Card
//                                         key={blog.title}
//                                         className="card-premium h-full animate-slide-up"
//                                         style={{ animationDelay: `${index * 0.05}s` }}
//                                     >
//                                         <CardContent className="pt-6 flex flex-col h-full">
//                                             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
//                                                 <IconComponent className="h-6 w-6 text-primary" />
//                                             </div>
//                                             <div className="flex items-center gap-3 mb-3">
//                                                 <span className="text-xs uppercase tracking-wider font-medium text-primary">
//                                                     {blog.category}
//                                                 </span>
//                                                 <span className="text-xs text-muted-foreground">
//                                                     {blog.date}
//                                                 </span>
//                                             </div>
//                                             <h3 className="font-serif text-xl font-bold mb-3 leading-snug">
//                                                 {blog.title}
//                                             </h3>
//                                             <p className="text-sm text-muted-foreground leading-relaxed flex-1">
//                                                 {blog.description}
//                                             </p>
//                                             <Button
//                                                 variant="ghost"
//                                                 className="justify-start px-0 mt-5 gap-2"
//                                             >
//                                                 Read More
//                                                 <ArrowRight className="h-4 w-4" />
//                                             </Button>
//                                         </CardContent>
//                                     </Card>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Trending Topics Section */}
//                 <section className="py-20">
//                     <div className="container mx-auto px-4 max-w-5xl">
//                         <div className="flex items-center gap-3 mb-10">
//                             <Scale className="h-7 w-7 text-primary" />
//                             <h2 className="font-serif text-3xl font-bold">
//                                 Trending Legal Topics
//                             </h2>
//                         </div>

//                         <div className="flex flex-wrap gap-4">
//                             {trendingTopics.map((topic) => (
//                                 <div
//                                     key={topic}
//                                     className="px-5 py-3 rounded-full bg-secondary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
//                                 >
//                                     {topic}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* CTA Section */}
//                 <section className="py-20 border-t">
//                     <div className="container mx-auto px-4 text-center">
//                         <Scale className="h-12 w-12 text-primary mx-auto mb-5" />
//                         <h2 className="font-serif text-3xl font-bold mb-4">
//                             Need Professional Legal Guidance?
//                         </h2>
//                         <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
//                             Connect with experienced lawyers on LEGALMATE for personalized legal
//                             advice and consultations.
//                         </p>
//                         <Button
//                             size="lg"
//                             className="gap-2"
//                             onClick={() => navigate('/signup?role=client')}
//                         >
//                             Consult a Lawyer
//                             <ArrowRight className="h-4 w-4" />
//                         </Button>
//                     </div>
//                 </section>
//             </main>
//         </>
//     );
// };

// export default Blog;
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Newspaper,
    Calendar,
    ArrowRight,
    Scale,
    Shield,
    Landmark,
    Gavel,
    TrendingUp,
    BookOpen,
    ChevronRight, ArrowLeft
} from 'lucide-react';

const featuredArticle = {
    title: 'Supreme Court Expands Digital Privacy Protections in India',
    category: 'Constitutional Law',
    date: 'May 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'The Supreme Court reaffirmed the importance of digital privacy rights, emphasizing stronger safeguards for personal data collection and online surveillance.',
};

const latestBlogs = [
    { title: 'Consumer Rights in Online Shopping: What Changed in 2026', category: 'Consumer Law', date: 'May 2026', icon: Shield, description: 'New e-commerce regulations now strengthen refund rights, seller transparency, and grievance redressal systems.' },
    { title: 'Important Property Registration Updates Across Indian States', category: 'Property Law', date: 'April 2026', icon: Landmark, description: 'Several states introduced online registration systems and digital verification for property transactions.' },
    { title: 'How Recent Labour Law Reforms Affect Employees & Startups', category: 'Employment Law', date: 'April 2026', icon: TrendingUp, description: 'The latest labour reforms simplify compliance requirements while strengthening worker protections.' },
    { title: 'Motor Accident Compensation Rules Explained', category: 'Insurance Law', date: 'March 2026', icon: Gavel, description: 'Recent tribunal judgments have clarified compensation calculations and claim filing procedures.' },
    { title: 'Understanding Data Protection Laws for Businesses', category: 'Technology Law', date: 'March 2026', icon: Shield, description: 'Indian businesses handling customer data must comply with new privacy and cybersecurity standards.' },
    { title: 'Women’s Rights & Workplace Safety: Legal Developments', category: 'Women Rights', date: 'February 2026', icon: Scale, description: 'Courts are emphasizing stricter enforcement of workplace harassment prevention policies.' },
];

const trendingTopics = ['Digital Privacy Rights', 'Consumer Protection Rules', 'Online Fraud Protection', 'Property Registration', 'Startup Compliance', 'Labour Law Reforms'];

const Blog = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50/60 min-h-screen text-slate-600 font-sans antialiased">
            {/* BACK BUTTON: Changed to absolute so it scrolls away with the header */}
            <button
                onClick={() => navigate(-1)}
                className="hidden md:flex absolute top-20 left-8 z-50 items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-800"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
            </button>
            {/* EXOTIC PREMIUM DARK HEADER */}
            <header className="relative bg-slate-950 py-16 sm:py-24 overflow-hidden border-b border-slate-900">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
                <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/90 border border-slate-800/60 text-slate-400 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4">
                        <Newspaper className="h-3 w-3" />
                        <span>Legal Intelligence Hub</span>
                    </div>
                    <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">Legal Blog & Insights</h1>
                    <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                        Stay informed with the latest legal developments, Supreme Court judgments, and expert analysis curated for precision.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 max-w-5xl py-16 space-y-24">
                {/* Featured Article */}
                <section>
                    <div className="flex items-center gap-3 mb-10">
                        <BookOpen className="h-6 w-6 text-slate-900" />
                        <h2 className="font-serif text-2xl font-bold text-slate-900">Featured Article</h2>
                    </div>
                    <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300">
                        <div className="grid lg:grid-cols-2">
                            <div className="relative w-full h-64 lg:h-full min-h-[300px]">
                                <img src={featuredArticle.image} alt={featuredArticle.title} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            <div className="p-8 flex flex-col justify-center bg-white">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-primary mb-3 block">{featuredArticle.category}</span>
                                <h3 className="font-serif text-2xl font-bold mb-4 text-slate-900">{featuredArticle.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-light">{featuredArticle.excerpt}</p>
                                <Button variant="outline" className="w-fit rounded-xl gap-2 font-medium">Read Full Article <ArrowRight className="h-3.5 w-3.5" /></Button>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Latest Articles */}
                <section>
                    <div className="flex items-center gap-3 mb-10">
                        <TrendingUp className="h-6 w-6 text-slate-900" />
                        <h2 className="font-serif text-2xl font-bold text-slate-900">Latest Updates</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {latestBlogs.map((blog) => {
                            const Icon = blog.icon;
                            return (
                                <Card key={blog.title} className="border border-slate-200/80 bg-white shadow-none rounded-xl p-6 hover:border-slate-300 transition-all">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                                        <Icon className="h-5 w-5 text-slate-700" />
                                    </div>
                                    <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{blog.title}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed font-light mb-4">{blog.description}</p>
                                    <button className="text-xs font-bold text-primary flex items-center gap-1 group">
                                        Read More <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-slate-950 text-slate-200 rounded-2xl p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
                    <div className="relative z-10 max-w-lg mx-auto">
                        <Scale className="h-10 w-10 text-white mx-auto mb-6" />
                        <h2 className="font-serif text-2xl font-bold text-white mb-3">Need Legal Guidance?</h2>
                        <p className="text-slate-400 text-sm mb-8 font-light">Connect with verified experts for personalized legal support.</p>
                        <Button onClick={() => navigate('/signup?role=client')} className="bg-white text-slate-950 hover:bg-slate-100 rounded-xl px-6">Consult a Lawyer</Button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Blog;