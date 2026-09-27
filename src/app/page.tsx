"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [activeModalImg, setActiveModalImg] = useState<{ src: string; title: string } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModalImg(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = containerRef.current.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const currentScroll = -rect.top;
      // Strictly clamp progress between 0 and 1 so it NEVER resets or wraps at the end of the scroll
      const progress = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
      scrollProgress.set(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [scrollProgress]);

  // Background overlay slowly gets darker to bring focus to text
  const bgOverlayOpacity = useTransform(scrollProgress, [0, 0.8, 1], [0.3, 0.6, 0.9], { clamp: true });

  // Framer Motion mappings for ultra-premium blur & scale typography

  // Scene 1: The Hook (0 - 0.2)
  const s1Op = useTransform(scrollProgress, [0, 0.1, 0.2, 0.21, 1], [1, 1, 0, 0, 0], { clamp: true });
  const s1Blur = useTransform(scrollProgress, [0, 0.1, 0.2], ["blur(0px)", "blur(0px)", "blur(20px)"], { clamp: true });
  const s1Scale = useTransform(scrollProgress, [0, 0.2], [1, 1.2], { clamp: true });
  const s1Display = useTransform(scrollProgress, (v) => (v < 0.21 ? 'flex' : 'none'));

  // Scene 2: The Legacy (0.2 - 0.45)
  const s2Op = useTransform(scrollProgress, [0, 0.15, 0.25, 0.35, 0.45, 1], [0, 0, 1, 1, 0, 0], { clamp: true });
  const s2Blur = useTransform(scrollProgress, [0.15, 0.25, 0.35, 0.45], ["blur(20px)", "blur(0px)", "blur(0px)", "blur(20px)"], { clamp: true });
  const s2Scale = useTransform(scrollProgress, [0.15, 0.25, 0.35, 0.45], [0.9, 1, 1, 1.1], { clamp: true });
  const s2Display = useTransform(scrollProgress, (v) => (v >= 0.15 && v < 0.47 ? 'flex' : 'none'));

  // Scene 3: The Lifestyle (0.45 - 0.7)
  const s3Op = useTransform(scrollProgress, [0, 0.4, 0.5, 0.6, 0.7, 1], [0, 0, 1, 1, 0, 0], { clamp: true });
  const s3Blur = useTransform(scrollProgress, [0.4, 0.5, 0.6, 0.7], ["blur(20px)", "blur(0px)", "blur(0px)", "blur(20px)"], { clamp: true });
  const s3Scale = useTransform(scrollProgress, [0.4, 0.5, 0.6, 0.7], [0.9, 1, 1, 1.1], { clamp: true });
  const s3Display = useTransform(scrollProgress, (v) => (v >= 0.4 && v < 0.72 ? 'flex' : 'none'));

  // Scene 4: The Invitation (0.7 - 1.0)
  const s4Op = useTransform(scrollProgress, [0, 0.65, 0.8, 1], [0, 0, 1, 1], { clamp: true });
  const s4Blur = useTransform(scrollProgress, [0.65, 0.8], ["blur(20px)", "blur(0px)"], { clamp: true });
  const s4Y = useTransform(scrollProgress, [0.65, 0.8], [50, 0], { clamp: true });
  const s4Display = useTransform(scrollProgress, (v) => (v >= 0.65 ? 'flex' : 'none'));

  // Scroll Progress Line Indicator
  const progressHeight = useTransform(scrollProgress, [0, 1], ["0%", "100%"], { clamp: true });

  const toggleMenu = () => setMenuActive(!menuActive);
  const closeMenu = () => setMenuActive(false);

  return (
    <>
      {/* Navbar stays the same */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} style={{ zIndex: 10000, background: isScrolled ? 'rgba(0,0,0,0.8)' : 'transparent', backdropFilter: 'blur(10px)' }}>
        <div className="container nav-container">
          <Link href="/" className="logo" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: 'rgba(255, 255, 255, 0.94)', 
            backdropFilter: 'blur(8px)', 
            padding: '5px 14px', 
            borderRadius: '10px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)', 
            border: '1px solid rgba(212, 175, 55, 0.3)' 
          }}>
            <img 
              src="/logo.png" 
              alt="Godavari Hospitality & Realities" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }} 
            />
          </Link>
          <ul className={`nav-links ${menuActive ? 'active' : ''}`}>
            <li><a href="#home" onClick={closeMenu} style={{ color: '#ffffff' }}>Home</a></li>
            <li><a href="#directors" onClick={closeMenu} style={{ color: '#ffffff' }}>Leadership</a></li>
            <li><Link href="/properties" onClick={closeMenu} style={{ color: '#ffffff' }}>Properties</Link></li>
            <li><Link href="/properties" className="btn-outline" onClick={closeMenu} style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>View Properties</Link></li>
          </ul>
          <div className={`hamburger ${menuActive ? 'active' : ''}`} onClick={toggleMenu}>
            <div className="bar" style={{ background: '#ffffff' }}></div>
            <div className="bar" style={{ background: '#ffffff' }}></div>
            <div className="bar" style={{ background: '#ffffff' }}></div>
          </div>
        </div>
      </nav>

      {/* Cinematic Scroll Container */}
      <div ref={containerRef} style={{ height: '500vh', position: 'relative' }} id="home">
        
        {/* Sticky Viewport */}
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#000' }}>
          
          {/* Local Cinematic Video Background */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="/cinematic-drone.mp4" type="video/mp4" />
          </video>
          
          {/* Dynamic Dark Overlay */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
              opacity: bgOverlayOpacity,
              zIndex: 1
            }}
          />

          {/* Cinematic Progress Indicator */}
          <div className="hidden md:block" style={{ position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', height: '30vh', width: '2px', background: 'rgba(255,255,255,0.2)', zIndex: 10 }}>
            <motion.div style={{ width: '100%', background: '#ffffff', height: progressHeight }} />
          </div>

          {/* Scene 1: The Hook */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: s1Display,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              opacity: s1Op,
              scale: s1Scale,
              filter: s1Blur
            }}
          >
            <div className="container text-center px-4" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 65%)', padding: '10vh 0' }}>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-extralight text-white leading-tight mb-4" style={{ color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                Building Dreams.<br/>Curating Experiences.
              </h1>
              <p className="text-sm md:text-lg lg:text-xl text-white font-normal tracking-widest uppercase mt-6" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
                Scroll to explore
              </p>
            </div>
          </motion.div>

          {/* Scene 2: The Legacy */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: s2Display,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              opacity: s2Op,
              scale: s2Scale,
              filter: s2Blur
            }}
          >
            <div className="container text-center px-4" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 65%)', padding: '10vh 0' }}>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-extralight text-white leading-tight mb-6" style={{ color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                A legacy of <span className="font-normal" style={{ color: '#ffffff' }}>unmatched luxury</span>.
              </h2>
              <p className="text-base md:text-lg lg:text-2xl text-white max-w-3xl mx-auto font-light leading-relaxed" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
                For over 15 years, we have been the vanguard of meticulous land development and state-of-the-art construction, delivering perfection in every square foot.
              </p>
            </div>
          </motion.div>

          {/* Scene 3: The Lifestyle */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: s3Display,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
              opacity: s3Op,
              scale: s3Scale,
              filter: s3Blur
            }}
          >
            <div className="container text-center px-4" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 65%)', padding: '10vh 0' }}>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-extralight text-white leading-tight mb-8" style={{ color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                We don't just build.<br/>We curate <span className="font-normal text-white border-b-2" style={{ color: '#ffffff', borderColor: '#ffffff' }}>lifestyles</span>.
              </h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mt-8 md:mt-12">
                <div>
                  <h3 className="text-5xl md:text-7xl font-extralight text-white m-0" style={{ color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>50+</h3>
                  <span className="uppercase text-xs md:text-sm tracking-widest font-medium" style={{ color: '#ffffff' }}>Landmarks</span>
                </div>
                <div>
                  <h3 className="text-5xl md:text-7xl font-extralight text-white m-0" style={{ color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>100%</h3>
                  <span className="uppercase text-xs md:text-sm tracking-widest font-medium" style={{ color: '#ffffff' }}>Commitment</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scene 4: The Invitation & Call to Action */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: s4Display,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              opacity: s4Op,
              y: s4Y,
              filter: s4Blur
            }}
            id="properties"
          >
            <div 
              className="container text-center px-4 flex flex-col items-center justify-center" 
              style={{ 
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 65%)', 
                padding: '10vh 0',
                width: '100%'
              }}
            >
              <h2 
                className="text-3xl md:text-5xl lg:text-7xl font-extralight text-white mb-6 leading-tight max-w-4xl mx-auto text-center" 
                style={{ 
                  color: '#ffffff', 
                  letterSpacing: '-0.02em', 
                  textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                  textAlign: 'center'
                }}
              >
                Ready to invest in perfection?
              </h2>
              <p 
                className="text-base md:text-lg lg:text-2xl text-white font-light mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed text-center" 
                style={{ 
                  color: '#ffffff', 
                  textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                  textAlign: 'center'
                }}
              >
                Explore our exclusive portfolio of landmark land developments, luxury estates, and premium properties.
              </p>
              <Link 
                href="/properties" 
                className="inline-flex items-center justify-center gap-5 py-5 md:py-6 px-12 md:px-16 text-sm md:text-lg tracking-[0.2em] uppercase font-medium rounded-full transition-all duration-300 hover:scale-105 mt-2 md:mt-4"
                style={{ 
                  color: '#ffffff', 
                  border: '1.5px solid rgba(255,255,255,0.85)', 
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 35px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.25)',
                  minWidth: '280px'
                }}
              >
                <span>View Properties</span>
                <i className="fa-solid fa-arrow-right text-base md:text-xl"></i>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Visionary Leadership / Directors Section */}
      <section id="directors" className="directors-section">
        <div className="container">
          <div className="directors-header">
            <div className="directors-eyebrow">
              <span className="directors-eyebrow-line"></span>
              <span>Visionary Leadership</span>
              <span className="directors-eyebrow-line"></span>
            </div>
            <h2 className="directors-title">
              Guiding Our <span>Heritage &amp; Vision</span>
            </h2>
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

                  <h3 className="director-name">Ayessha Sarang</h3>
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

                  <h3 className="director-name">Mrs. Tanvi Shashikant Adhav</h3>
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

      {/* Footer stays normal at the bottom */}
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
                <li><a href="#home" style={{ color: '#ffffff' }}>Home</a></li>
                <li><a href="#directors" style={{ color: '#ffffff' }}>Leadership</a></li>
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
    </>
  );
}
