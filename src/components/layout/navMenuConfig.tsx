export interface NavMenuItem {
    label: string;
    href: string;
    description?: string;
}
export interface NavMenuSection {
    title: string;
    items: NavMenuItem[];
}
export const navMenuConfig: NavMenuSection[] = [
    {
        title: "Find Lawyers",
        items: [
            { label: "By Language", href: "/signup?role=client", description: "Lawyers who speak your language" },
            { label: "Top Rated", href: "/signup?role=client", description: "Highest rated legal professionals" },
            { label: "Available Now", href: "/signup?role=client", description: "Lawyers ready for consultation" },
            { label: "Verified Lawyers", href: "/signup?role=client", description: "Platform-verified attorneys" },
        ],
    },
    {
        title: "Services",
        items: [
            { label: "Consultation", href: "/signup?role=client", description: "One-on-one legal advice sessions" },
            { label: "Document Drafting", href: "/signup?role=client", description: "Legal document preparation" },
            { label: "Case Representation", href: "/signup?role=client", description: "Full case handling & court representation" },
            { label: "Startup Legal Help", href: "/signup?role=client", description: "Incorporation, compliance & contracts" },
            { label: "Property Legal Help", href: "/signup?role=client", description: "Real estate & property disputes" },
            { label: "Criminal Defense", href: "/signup?role=client", description: "Criminal law representation" },
            { label: "Family Law Help", href: "/signup?role=client", description: "Divorce, custody & family matters" },
        ],
    },
    {
        title: "Resources",
        items: [
            { label: "Blog", href: "/blog", description: "Latest legal insights & news" },
            { label: "Legal Guides", href: "/legal-guides", description: "Step-by-step legal how-tos" },
            { label: "FAQs", href: "/faq", description: "Common legal questions answered" },
            { label: "Articles", href: "/articles", description: "In-depth legal analysis" },
        ],
    },
    {
        title: "For Lawyers",
        items: [
            { label: "Join Platform", href: "/signup?role=lawyer", description: "Register as a legal professional" },
            { label: "Benefits", href: "/benefits", description: "Why lawyers choose LegalMate" },
            { label: "Pricing", href: "/pricing", description: "Transparent platform fees" },

        ],
    },
    {
        title: "Company",
        items: [
            { label: "About Us", href: "/aboutus", description: "Our mission & team" },
            { label: "How It Works", href: "/how-it-works", description: "Simple 4-step process" },
            { label: "Contact", href: "/contact", description: "Get in touch with us" },
            { label: "Privacy Policy", href: "/privacy", description: "How we protect your data" },
            { label: "Terms", href: "/terms", description: "Terms of service" },
            { label: "Refund Policy", href: "/refund", description: "Our refund & cancellation policy" },
        ],
    },
];
