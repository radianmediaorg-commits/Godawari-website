"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeadershipPage() {
  const [activeModalImg, setActiveModalImg] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModalImg(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-light min-h-screen" style={{ background: '#0a0a0a', color: '#ffffff' }}>
      {/* Navigation Bar */}
      <nav className="navbar scrolled" style={{ background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="container nav-container">
          <Link href="/" className="logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img 
              src="/logo-white-text.png" 
              alt="Godavari Hospitality & Realities" 
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>
          <ul className="nav-links">
            <li><Link href="/" style={{ color: '#ffffff' }}>Home</Link></li>
            <li><Link href="/leadership" style={{ color: 'var(--accent-color, #d4af37)', fontWeight: 600 }}>Leadership</Link></li>
            <li><Link href="/properties" className="btn-outline" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>Properties</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Leadership Section */}
      <section className="directors-section" style={{ paddingTop: '160px', minHeight: '85vh' }}>
        <div className="container">
          {/* Breadcrumb Navigation */}
          <div style={{ marginBottom: '30px' }}>
            <Link 
              href="/" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--accent-color, #d4af37)', 
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'opacity 0.2s'
              }}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="directors-header">
            <div className="directors-eyebrow">
              <span className="directors-eyebrow-line"></span>
              <span>Executive Leadership</span>
              <span className="directors-eyebrow-line"></span>
            </div>
            <h1 className="directors-title">
              Guiding Our <span>Heritage &amp; Vision</span>
            </h1>
            <p className="directors-subtitle">
              Driven by integrity, refined by aesthetics, and backed by over 15 years of industry mastery. Meet the directors steering Godawari Hospitality &amp; Real Estate toward benchmark standards in land development, luxury residences, and curated living.
            </p>
          </div>

          <div className="directors-grid">
            {/* Director 1: Ayessha Sarang */}
            <div className="director-card">
              <div className="director-card-inner">
                <div 
                  className="director-poster-wrapper"
                  onClick={() => setActiveModalImg({ src: '/directors/ayessha-sarang.png', title: 'Ayessha Sarang - Partner Director' })}
                  title="Click to view full portrait"
                >
                  <img 
                    src="/directors/ayessha-sarang.png" 
                    alt="Ayessha Sarang - Partner Director" 
                    className="director-poster-img"
                  />
                  <div className="director-poster-overlay">
                    <span className="director-zoom-btn">
                      <i className="fa-solid fa-expand"></i>
                      <span>View Full Profile</span>
                    </span>
                  </div>
                </div>

                <div className="director-card-body">
                  <span className="director-role-badge">
                    <i className="fa-solid fa-crown" style={{ fontSize: '0.7rem' }}></i>
                    <span>Partner Director</span>
                  </span>

                  <h2 className="director-name">Ayessha Sarang</h2>
                  <p className="director-tagline">Strategic Market Vision &amp; Human-Centric Development</p>

                  <div className="director-quote">
                    <i className="fa-solid fa-quote-left"></i>
                    With over 15 years of experience in running businesses and working with people, my background as a professional psychologist gives me a unique advantage in understanding market needs and delivering the right solutions. Through Godawari Hospitality and Real Estate, we aim to elevate the hospitality and real estate sectors by helping people discover their dream properties in serene and thoughtfully selected locations.
                  </div>

                  <div className="director-pillars-title">Core Expertise &amp; Leadership</div>
                  <div className="director-pillars-list">
                    <span className="director-pillar-pill">
                      <i className="fa-solid fa-brain"></i>
                      <span>Market Psychology</span>
                    </span>
                    <span className="director-pillar-pill">
                      <i className="fa-solid fa-award"></i>
                      <span>15+ Years Experience</span>
                    </span>
                    <span className="director-pillar-pill">
                      <i className="fa-solid fa-compass"></i>
                      <span>Curated Prime Locations</span>
                    </span>
                    <span className="director-pillar-pill">
                      <i className="fa-solid fa-hotel"></i>
                      <span>Luxury Hospitality</span>
                    </span>
                  </div>

                  <div className="director-card-footer">
                    <span className="director-mantra">
                      Portfolio: <strong>Godawari Hospitality &amp; Realities</strong>
                    </span>
                    <a 
                      href="https://www.godawarirealty.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="director-pillar-pill"
                      style={{ textDecoration: 'none' }}
                    >
                      <i className="fa-solid fa-globe"></i>
                      <span>godawarirealty.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Director 2: Mrs. Tanvi Shashikant Adhav */}
            <div className="director-card">
              <div className="director-card-inner">
                <div 
                  className="director-poster-wrapper"
                  onClick={() => setActiveModalImg({ src: '/directors/tanvi-adhav.png', title: 'Mrs. Tanvi Shashikant Adhav - Director' })}
                  title="Click to view full portrait"
                >
                  <img 
                    src="/directors/tanvi-adhav.png" 
                    alt="Mrs. Tanvi Shashikant Adhav - Director" 
                    className="director-poster-img"
                  />
                  <div className="director-poster-overlay">
                    <span className="director-zoom-btn">
                      <i className="fa-solid fa-expand"></i>
                      <span>View Full Profile</span>
                    </span>
                  </div>
                </div>

                <div className="director-card-body">
                  <span className="director-role-badge">
                    <i className="fa-solid fa-gem" style={{ fontSize: '0.7rem' }}></i>
                    <span>Director &amp; Entrepreneur</span>
                  </span>

                  <h2 className="director-name">Mrs. Tanvi Shashikant Adhav</h2>
                  <p className="director-tagline">From Designs to Dream Homes — Two Passions, One Vision</p>

                  <div className="director-quote">
                    <i className="fa-solid fa-quote-left"></i>
                    I am a creative soul with a strong business mindset. After building a successful career as a Fashion Designer, I am now stepping into the world of Real Estate — creating spaces where people don&#39;t just live, but build their dreams.
                  </div>

                  <div className="director-pillars-title">Core Values &amp; Creative Vision</div>
                  <div className="director-pillars-list">
                    <span className="director-pillar-pill">
                      <i className="fa-solid fa-scissors"></i>
                      <span>Fashion Designer</span>
                    </span>
                    <span className="director-pillar-pill">
                      <i className="fa-solid fa-building"></i>
                      <span>Real Estate Entrepreneur</span>
                    </span>
                    <span className="director-pillar-pill">
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      <span>Bespoke Lifestyle</span>
                    </span>
                    <span className="director-pillar-pill">
                      <i className="fa-solid fa-shield-heart"></i>
                      <span>Creativity &amp; Trust</span>
                    </span>
                  </div>

                  <div className="director-card-footer">
                    <span className="director-mantra">
                      Philosophy: <strong>Fashion &times; Real Estate &times; A Better Tomorrow</strong>
                    </span>
                    <span className="director-pillar-pill" style={{ color: '#d4af37' }}>
                      <i className="fa-solid fa-heart"></i>
                      <span>Same Vision, Bigger Impact</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ position: 'relative', zIndex: 10, background: '#0a0a0a', color: '#ffffff' }}>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <Link href="/" className="logo footer-logo" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                background: 'rgba(255, 255, 255, 0.94)', 
                padding: '8px 18px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)', 
                border: '1px solid rgba(212, 175, 55, 0.3)',
                marginBottom: '16px' 
              }}>
                <img 
                  src="/logo.png" 
                  alt="Godavari Hospitality &amp; Realities" 
                  style={{ height: '42px', width: 'auto', objectFit: 'contain', display: 'block' }} 
                />
              </Link>
              <p style={{ color: '#ffffff', fontWeight: 300, opacity: 0.9 }}>Excellence in luxury real estate, bespoke construction, and distinguished hospitality.</p>
              <div className="social-links">
                <a href="#" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}><i className="fa-brands fa-twitter"></i></a>
                <a href="#" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}><i className="fa-brands fa-instagram"></i></a>
              </div>
            </div>
            <div className="footer-links">
              <h4 style={{ color: '#ffffff' }}>Quick Links</h4>
              <ul>
                <li><Link href="/" style={{ color: '#ffffff' }}>Home</Link></li>
                <li><Link href="/leadership" style={{ color: 'var(--accent-color, #d4af37)' }}>Leadership</Link></li>
                <li><Link href="/properties" style={{ color: '#ffffff' }}>Properties</Link></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4 style={{ color: '#ffffff' }}>Services</h4>
              <ul>
                <li><a href="#" style={{ color: '#ffffff' }}>Hospitality</a></li>
                <li><a href="#" style={{ color: '#ffffff' }}>Real Estate</a></li>
                <li><a href="#" style={{ color: '#ffffff' }}>Construction</a></li>
                <li><a href="#" style={{ color: '#ffffff' }}>Land Development</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom" style={{ borderTopColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
            <p style={{ color: '#ffffff' }}>&copy; 2026 Godawari Hospitality &amp; Real Estate. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {activeModalImg && (
        <div 
          className="director-modal-backdrop"
          onClick={() => setActiveModalImg(null)}
        >
          <div 
            className="director-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              className="director-modal-close"
              onClick={() => setActiveModalImg(null)}
              title="Close (Esc)"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img 
              src={activeModalImg.src} 
              alt={activeModalImg.title} 
              className="director-modal-img" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
