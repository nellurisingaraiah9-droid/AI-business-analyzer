import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Target, Package, Shield, Map, BarChart3, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: Target, title: 'Feasibility Analysis', desc: 'Market assumptions, revenue scenarios, break-even estimates and risk assessment.' },
  { icon: Package, title: 'Equipment Finder', desc: 'Machinery recommendations with specs, pricing estimates, and supplier information.' },
  { icon: BarChart3, title: 'Budget Calculator', desc: 'Deterministic cost breakdown across all startup categories with scenario analysis.' },
  { icon: Shield, title: 'License Advisor', desc: 'Location-aware regulatory requirements with official government sources.' },
  { icon: Map, title: 'Setup Roadmap', desc: 'Step-by-step dependency-aware business setup plan with task tracking.' },
  { icon: Sparkles, title: 'AI-Powered Insights', desc: 'LLM-generated recommendations with structured, validated outputs.' },
];

const steps = [
  { num: '01', title: 'Describe Your Business', desc: 'Enter your business idea, location, budget, and requirements.' },
  { num: '02', title: 'AI Analysis', desc: 'Our AI analyzes feasibility, equipment, licenses, and budget needs.' },
  { num: '03', title: 'Detailed Report', desc: 'Receive a comprehensive report with actionable recommendations.' },
  { num: '04', title: 'Track & Execute', desc: 'Use the interactive roadmap and checklists to launch your business.' },
];

const industries = [
  'Manufacturing', 'Food Processing', 'Restaurants', 'Agriculture', 'Water Treatment',
  'IT & Software', 'Retail', 'Warehousing', 'Healthcare', 'Education', 'Services', 'Startups',
];

const faqs = [
  { q: 'What industries does BizPilot AI support?', a: 'BizPilot AI supports a wide range of industries including manufacturing, food processing, restaurants, agriculture, water treatment, IT, retail, warehousing, healthcare, and more. The platform is not restricted to a single industry.' },
  { q: 'Are the equipment prices accurate?', a: 'Equipment prices are planning estimates based on industry data. They are clearly labeled as estimates. We always recommend obtaining actual quotations from suppliers before making purchase decisions.' },
  { q: 'How reliable is the license information?', a: 'License information references official government portals where available. However, regulations change frequently. Each requirement includes a verification status, and we always recommend confirming current requirements with the competent authority.' },
  { q: 'Is my business data secure?', a: 'Yes. We use encrypted connections, secure authentication, and your analyses are only accessible to you. We never share your business data with third parties.' },
  { q: 'Do I need to pay to use BizPilot AI?', a: 'BizPilot AI is currently free to use during the beta period. Some advanced features may require a subscription in the future.' },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-bg-primary" />
            </div>
            <span className="text-lg font-bold text-text-primary">BizPilot AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" /> AI-Powered Business Intelligence for India
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Turn Your Business Idea Into a{' '}
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              Complete Setup Plan
            </span>
          </h1>
          
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
            Enter your business idea, location, and budget. Get a comprehensive analysis covering feasibility, 
            equipment, licenses, budgeting, and a step-by-step setup roadmap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2 rounded-xl">
              Analyze My Business <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-3 rounded-xl">
              See How It Works
            </a>
          </div>

          {/* Example */}
          <div className="mt-16 card max-w-2xl mx-auto text-left">
            <p className="text-xs text-text-secondary mb-2 uppercase tracking-wider">Example Business Idea</p>
            <p className="text-text-primary text-sm leading-relaxed">
              "I want to start a <span className="text-accent font-medium">packaged drinking water manufacturing plant</span> in 
              <span className="text-accent font-medium"> Guntur, Andhra Pradesh, India</span>, with a budget of 
              <span className="text-accent font-medium"> ₹20 lakh</span>."
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge badge-accent">🏭 Manufacturing</span>
              <span className="badge badge-accent">📍 Guntur, AP</span>
              <span className="badge badge-accent">💰 ₹20,00,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Everything You Need to Launch</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Comprehensive business intelligence from idea to operations.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card group hover:border-accent/40 transition-all duration-300" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary mb-3">How It Works</h2>
            <p className="text-text-secondary">Four simple steps from idea to execution.</p>
          </div>
          
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-5 card">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-bold text-sm">{s.num}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">{s.title}</h3>
                  <p className="text-sm text-text-secondary">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">Multi-Industry Support</h2>
          <p className="text-text-secondary mb-10">Analyze any business across India.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((ind) => (
              <span key={ind} className="px-4 py-2 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-secondary hover:text-accent hover:border-accent/30 transition-colors cursor-default">
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-text-primary pr-4">{faq.q}</h3>
                  <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed animate-fadeIn">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Ready to Analyze Your Business?</h2>
          <p className="text-text-secondary mb-8">Start your free business analysis in minutes.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3.5 rounded-xl inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-text-primary">BizPilot AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-secondary">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
          </div>
          <p className="text-xs text-text-secondary">© 2024 BizPilot AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
