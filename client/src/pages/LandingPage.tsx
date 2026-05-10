/** 
 * LandingPage: A high-fidelity, interactive portal for the Clamber academic platform, 
 * featuring burnout prevention showcases, student testimonials, and a roadmap to academic success.
 */
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mountain, ArrowRight, CheckCircle2,
  MessageSquare, Zap, Clock, Target, 
  Sparkles, Heart, Users, BarChart3, GraduationCap, 
  Menu, Globe, Book, PenTool, Brain, Coffee, Calculator,
  Mail
} from 'lucide-react';

import heroIllustration from '../assets/hero-illustration.png';
import student1 from '../assets/testimonials/student1.png';
import student2 from '../assets/testimonials/student2.png';
import student3 from '../assets/testimonials/student3.png';
import student4 from '../assets/testimonials/student4.png';
import NeuralBackground from '../components/shared/NeuralBackground';
import '../styles/pages/LandingPage.css';

const LandingPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className={`landing-page force-default-theme ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      <div className="antigravity-bg">
        <NeuralBackground color="#7CB9E8" />
      </div>

      <header className="landing-header">
        <div className="landing-logo">
          <Mountain size={32} color="var(--active-accent)" />
          <span>Clamber</span>
        </div>
        
        <nav className="nav-links desktop-only">
          <a href="#features">Features</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="nav-auth desktop-only">
          <Link to="/login" className="nav-login">Log In</Link>
          <Link to="/signup" className="btn-primary btn-shine btn-nav-cta">Get Started</Link>
        </div>

        <button 
          className="mobile-menu-icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <ArrowRight /> : <Menu />}
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <nav className="mobile-nav-links">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#roadmap" onClick={() => setIsMobileMenuOpen(false)}>Roadmap</a>
              <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
              <hr className="mobile-divider" />
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
            </nav>
          </div>
        )}
      </header>

      <section className="hero-section centered-hero">
        <div className="hero-doodles">
          <div className="doodle d1"><Book size={56} /></div>
          <div className="doodle d2"><GraduationCap size={64} /></div>
          <div className="doodle d3"><PenTool size={44} /></div>
          <div className="doodle d4"><Brain size={60} /></div>
          <div className="doodle d5"><Coffee size={52} /></div>
          <div className="doodle d6"><Calculator size={54} /></div>
        </div>

        <div className="hero-content">
          <div className="hero-pill-badge highlight-pill">
            <Sparkles size={14} /> Beat Burnout with AI
          </div>
          <h1 className="hero-title">Stop guessing. <br/>Start <span className="text-accent">succeeding</span>.</h1>
          <p className="hero-description">
            The AI academic planner that predicts burnout, plans your grades, and builds study schedules that actually work.
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn-hero-primary btn-shine">
              Start Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-hero-secondary btn-shine">View Demo</Link>
          </div>
          <div className="trust-badges">
            <div className="trust-pill"><CheckCircle2 size={14} /> Free forever</div>
            <div className="trust-pill">
              <div className="avatar-stack">
                <img src={student1} alt="Clamber Student Sarah Ahmed" />
                <img src={student2} alt="Clamber Student Ali Raza" />
                <img src={student3} alt="Clamber Student Fatima Khan" />
                <div className="avatar-more">+</div>
              </div>
              <span>10,000+ students</span>
            </div>
          </div>
        </div>
      </section>

      <section className="partners-section">
        <p className="partners-title">Trusted by students at world-class institutions</p>
        <div className="partners-grid">
          {['NUST', 'FAST-NUCES', 'GIKI', 'IBA', 'LUMS', 'NED', 'UET'].map(p => (
            <span key={p} className="partner-logo">{p}</span>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-bg-overlay"></div>
        <h2 className="section-title-relative">Real Impact, <span className="text-italic">Real Results</span></h2>
        <div className="stats-grid-relative">
          <StatCard icon={<Clock size={24} color="var(--accent-blue-deep)" />} number="500K+" label="Study Hours Logged" />
          <StatCard icon={<Zap size={24} color="var(--accent-peach-deep)" />} number="92%" label="Deadline Accuracy" />
          <StatCard icon={<BarChart3 size={24} color="var(--active-accent)" />} number="3.2 → 3.8" label="Avg GPA Improvement" />
          <StatCard icon={<Brain size={24} color="var(--accent-lavender-deep)" />} number="120K+" label="AI Focus Sessions" />
        </div>
      </section>

      <section id="products" className="features-section">
        <h2 className="section-title">Everything you need in <span className="text-accent">one place</span></h2>
        <p className="section-subtitle">A comprehensive suite of tools designed to maximize your academic potential.</p>
        <div className="features-grid">
          <FeatureCard icon={<Zap />} title="AI Burnout Prevention" desc="Predict exhaustion before it happens with our advanced cognitive load tracking." variant="blue" />
          <FeatureCard icon={<Target />} title="Smart Study Planner" desc="Automated schedules that adapt to your pace and upcoming deadlines." variant="lavender" />
          <FeatureCard icon={<GraduationCap />} title="Personalized Grade Planner" desc="Map out your path to a 4.0 GPA with step-by-step target tracking." variant="mint" />
          <FeatureCard icon={<Clock />} title="Wellness Reminders" desc="Gentle nudges to stay hydrated, rest, and maintain mental clarity." variant="peach" />
          <FeatureCard icon={<BarChart3 />} title="Productivity Insights" desc="Deep analytics into your study habits to optimize performance." variant="mint" />
          <FeatureCard icon={<Heart />} title="Tailored Support" desc="Mental health and academic support resources when you need them most." variant="pink" />
        </div>
      </section>

      <section id="roadmap" className="roadmap-section">
        <h2 className="section-title">Your Academic <span className="text-accent">Roadmap</span></h2>
        <p className="section-subtitle">A data-driven path from enrollment to graduation.</p>
        <div className="roadmap-container">
          <div className="roadmap-line"></div>
          <div className="roadmap-items">
            {[
              { t: 'Semester Setup', d: 'Import your courses and set your target GPA goals.' },
              { t: 'AI Scheduling', d: 'Clamber builds a dynamic schedule around your life.', a: true },
              { t: 'Mid-term Analytics', d: 'Track progress and adjust study intensity based on burnout risk.' },
              { t: 'Final Mastery', d: 'Finalize your grades and archive the semester for future insights.' }
            ].map((item, idx) => (
              <div key={idx} className="roadmap-item">
                <div className={`roadmap-dot ${item.a ? 'active' : ''}`}></div>
                <div className="roadmap-content">
                  <h4>{item.t}</h4>
                  <p>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-deep-dive">
        <div className="deep-dive-grid">
          <div className="deep-dive-image">
            <img src={heroIllustration} alt="Clamber Product Dashboard Showcase" loading="lazy" />
          </div>
          <div className="deep-dive-text">
            <h3>Designed for the modern student.</h3>
            <p>Clamber isn't just a calendar. It's a cognitive companion that understands the weight of a full course load.</p>
            <ul className="check-list">
              <li><CheckCircle2 size={16} /> Real-time stress monitoring</li>
              <li><CheckCircle2 size={16} /> Automated deadline prioritization</li>
              <li><CheckCircle2 size={16} /> Integrated Pomodoro focus sessions</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <h2 className="section-title">Common <span className="text-accent">Questions</span></h2>
        <div className="faq-grid">
          {[
            { q: 'Is Clamber really free?', a: 'Yes! Our core features including the planner and AI assistant are free for all students.' },
            { q: 'How does burnout prediction work?', a: 'We analyze your sleep hours, stress levels, and upcoming task density to calculate a risk score.' },
            { q: 'Can I export my data?', a: 'Absolutely. You can export your full academic record as a PDF or JSON at any time.' },
            { q: 'Does it work on mobile?', a: 'Clamber is fully responsive and works beautifully on all mobile browsers.' }
          ].map((item, idx) => (
            <div key={idx} className="faq-item">
              <h5>{item.q}</h5>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="testimonials-section-v2">
        <h2 className="section-title-centered">What <span className="text-pastel-green">students</span> are saying</h2>
        <p className="section-subtitle-centered">Trusted by students at top universities nationwide</p>
        <div className="testimonials-masonry">
          <div className="testimonial-column">
            <TestimonialCard name="Sarah Ahmed" uni="NUST" img={student1} text="Clamber helped me go from a 2.8 to a 3.6 GPA in one semester. The burnout alerts saved me during finals week." variant="pink" />
            <TestimonialCard name="Ali Raza" uni="UET" img={student2} text="I was struggling with time management in first year. Clamber AI scheduler completely changed how I study." variant="lavender" />
          </div>
          <div className="testimonial-column offset-up">
            <TestimonialCard name="Hassan Ali" uni="LUMS" img={student4} text="The grade planner is incredible. I know exactly what I need to score on every exam. No more guessing or stress." variant="blue" />
            <TestimonialCard name="Zain Abbas" uni="GIKI" img={student2} text="Incredible AI features. My team actually enjoys using this platform!" variant="peach" />
          </div>
          <div className="testimonial-column">
            <TestimonialCard name="Fatima Khan" uni="AKU" img={student3} text="Prayer time blocking is a game-changer. Finally, an app that respects my schedule and religious commitments." variant="lavender" />
            <TestimonialCard name="Maya Hussain" uni="IBA KARACHI" img={student1} text="Simple, elegant, and powerful. Exactly what we needed for academic planning." variant="mint" />
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-banner">
          <h2 className="cta-banner-title">Ready to stop stressing?</h2>
          <p className="cta-banner-desc">Join <span className="highlight">10,000+ students</span> who are studying smarter, not harder.</p>
          <div className="cta-banner-action">
            <Link to="/signup" className="btn-primary btn-shine btn-cta-large">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="comprehensive-footer">
        <div className="footer-grid-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <Mountain size={32} color="var(--active-accent)" />
              <span>Clamber</span>
            </div>
            <p className="footer-pitch">A cognitive academic companion built for students who want to climb higher without the burnout.</p>
            <div className="footer-socials">
              <a href="#" className="social-icon"><Globe size={20} /></a>
              <a href="#" className="social-icon"><MessageSquare size={20} /></a>
              <a href="#" className="social-icon"><Mail size={20} /></a>
            </div>
          </div>
          <div className="footer-column">
            <h5>Product</h5>
            <a href="#products">AI Planner</a>
            <a href="#roadmap">2026 Roadmap</a>
            <a href="/login">Burnout Predictor</a>
          </div>
          <div className="footer-column">
            <h5>Resources</h5>
            <a href="#">Academic Blog</a>
            <a href="#">Study Guides</a>
            <a href="#">Developer API</a>
          </div>
          <div className="footer-column">
            <h5>Company</h5>
            <a href="#">About Clamber</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Clamber. Built with ❤️ for students in Pakistan.</p>
          <div className="footer-badges">
            <span className="badge-item"><CheckCircle2 size={14} /> 256-bit SSL Secured</span>
            <span className="badge-item"><Sparkles size={14} /> AI-Verified System</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatCard = memo(({ icon, number, label }: any) => (
  <div className="stat-card">
    <div className="stat-icon-wrapper-centered">{icon}</div>
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
));

const FeatureCard = memo(({ icon, title, desc, variant }: any) => (
  <div className={`feature-card variant-${variant}`}>
    <div className="feature-icon-wrapper">
      {React.cloneElement(icon, { size: 28, className: 'feature-icon' })}
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
));

const TestimonialCard = memo(({ name, uni, img, text, variant }: any) => (
  <div className={`testimonial-card-v2 variant-${variant}`}>
    <div className="t-avatar-wrapper">
      <img src={img} alt={name} loading="lazy" />
    </div>
    <div className="t-content">
      <h5>{name}</h5>
      <span className="t-uni">{uni}</span>
      <p className="t-text">"{text}"</p>
    </div>
  </div>
));

export default LandingPage;
