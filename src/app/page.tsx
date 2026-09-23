"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [formState, setFormState] = useState('idle');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Extend scroll height to 500vh for a slower, more cinematic journey
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Background overlay slowly gets darker to bring focus to text
  const bgOverlayOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [0.3, 0.6, 0.9]);

  // Framer Motion mappings for ultra-premium blur & scale typography

  // Scene 1: The Hook (0 - 0.2)
  const s1Op = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const s1Blur = useTransform(scrollYProgress, [0, 0.1, 0.2], ["blur(0px)", "blur(0px)", "blur(20px)"]);
  const s1Scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2]);
  
  // Scene 2: The Legacy (0.2 - 0.45)
  const s2Op = useTransform(scrollYProgress, [0.15, 0.25, 0.35, 0.45], [0, 1, 1, 0]);
  const s2Blur = useTransform(scrollYProgress, [0.15, 0.25, 0.35, 0.45], ["blur(20px)", "blur(0px)", "blur(0px)", "blur(20px)"]);
  const s2Scale = useTransform(scrollYProgress, [0.15, 0.25, 0.35, 0.45], [0.9, 1, 1, 1.1]);

  // Scene 3: The Lifestyle (0.45 - 0.7)
  const s3Op = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.7], [0, 1, 1, 0]);
  const s3Blur = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.7], ["blur(20px)", "blur(0px)", "blur(0px)", "blur(20px)"]);
  const s3Scale = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.7], [0.9, 1, 1, 1.1]);

  // Scene 4: The Invitation (0.7 - 1.0)
  const s4Op = useTransform(scrollYProgress, [0.65, 0.8, 1], [0, 1, 1]);
  const s4Blur = useTransform(scrollYProgress, [0.65, 0.8], ["blur(20px)", "blur(0px)"]);
  const s4Y = useTransform(scrollYProgress, [0.65, 0.8], [50, 0]);

  // Scroll Progress Line Indicator
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuActive(!menuActive);
  const closeMenu = () => setMenuActive(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => setFormState('idle'), 3000);
    }, 1500);
  };

  return (
    <>
      {/* Navbar stays the same */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} style={{ zIndex: 10000, background: isScrolled ? 'rgba(0,0,0,0.8)' : 'transparent', backdropFilter: 'blur(10px)' }}>
        <div className="container nav-container">
          <Link href="/" className="logo" style={{ color: 'white', letterSpacing: '2px', fontWeight: 300 }}>
            <span className="logo-icon" style={{ color: 'var(--accent-color)' }}><i className="fa-solid fa-building-columns"></i></span>
            GODAWARI
          </Link>
          <ul className={`nav-links ${menuActive ? 'active' : ''}`}>
            <li><a href="#home" onClick={closeMenu} style={{ color: 'white' }}>Home</a></li>
            <li><a href="#contact" onClick={closeMenu} style={{ color: 'white' }}>Contact</a></li>
            <li><Link href="/properties" className="btn-outline" onClick={closeMenu} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Properties</Link></li>
          </ul>
          <div className={`hamburger ${menuActive ? 'active' : ''}`} onClick={toggleMenu}>
            <div className="bar" style={{ background: 'white' }}></div>
            <div className="bar" style={{ background: 'white' }}></div>
            <div className="bar" style={{ background: 'white' }}></div>
          </div>
        </div>
      </nav>

      {/* Cinematic Scroll Container */}
      <div ref={containerRef} style={{ height: '500vh', position: 'relative' }} id="home">
        
        {/* Sticky Viewport */}
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#000' }}>
          
          {/* High-End Drone Video (YouTube embed prevents 403 blocks) */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100vw', height: '100vh', transform: 'translate(-50%, -50%)', pointerEvents: 'none', overflow: 'hidden' }}>
            <iframe
              src="https://www.youtube.com/embed/2v_7UH_nLv4?autoplay=1&mute=1&controls=0&loop=1&playlist=2v_7UH_nLv4&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
              style={{
                width: '100vw',
                height: '56.25vw', /* 16:9 aspect ratio */
                minHeight: '100vh',
                minWidth: '177.77vh', /* 16:9 aspect ratio */
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: 'none',
              }}
              allow="autoplay; encrypted-media"
              title="Drone Background"
            ></iframe>
          </div>
          
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

          {/* Cinematic Progress Indicator (Hidden on small mobile for cleaner look) */}
          <div className="hidden md:block" style={{ position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', height: '30vh', width: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 10 }}>
            <motion.div style={{ width: '100%', background: 'var(--accent-color)', height: progressHeight }} />
          </div>

          {/* Scene 1: The Hook */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              opacity: s1Op,
              scale: s1Scale,
              filter: s1Blur
            }}
          >
            <div className="container text-center px-4">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-extralight text-white leading-tight mb-4" style={{ letterSpacing: '-0.02em', textShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
                Building Dreams.<br/>Curating Experiences.
              </h1>
              <p className="text-sm md:text-lg lg:text-xl text-white/60 font-light tracking-widest uppercase">
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              opacity: s2Op,
              scale: s2Scale,
              filter: s2Blur
            }}
          >
            <div className="container text-center px-4">
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-extralight text-white leading-tight mb-6">
                A legacy of <span className="font-normal" style={{ background: 'var(--gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>unmatched luxury</span>.
              </h2>
              <p className="text-base md:text-lg lg:text-2xl text-white/70 max-w-4xl mx-auto font-light leading-relaxed">
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
              opacity: s3Op,
              scale: s3Scale,
              filter: s3Blur
            }}
          >
            <div className="container text-center px-4">
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-extralight text-white leading-tight mb-8">
                We don't just build.<br/>We curate <span className="font-normal text-white border-b-2" style={{ borderColor: 'var(--accent-color)' }}>lifestyles</span>.
              </h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mt-8 md:mt-12">
                <div>
                  <h3 className="text-5xl md:text-7xl font-extralight text-white m-0">50+</h3>
                  <span className="text-white/50 uppercase text-xs md:text-sm tracking-widest">Landmarks</span>
                </div>
                <div>
                  <h3 className="text-5xl md:text-7xl font-extralight text-white m-0">100%</h3>
                  <span className="text-white/50 uppercase text-xs md:text-sm tracking-widest">Commitment</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scene 4: The Invitation & Contact */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              opacity: s4Op,
              y: s4Y,
              filter: s4Blur
            }}
            id="contact"
          >
            <div className="container px-4">
              <div className="flex flex-col lg:flex-row rounded-2xl md:rounded-[30px] overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
                <div className="flex-1 p-8 md:p-12 lg:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <h2 className="text-3xl md:text-5xl font-extralight text-white mb-4 md:mb-6 leading-tight">Ready to invest in perfection?</h2>
                  <p className="text-base md:text-xl text-white/60 font-light mb-8 md:mb-12">
                    Explore our exclusive portfolio of properties or contact our experts to begin your journey.
                  </p>
                  <Link href="/properties" className="btn-primary inline-flex self-start py-4 px-8 text-sm md:text-lg tracking-widest">
                    View Premium Listings
                  </Link>
                </div>
                
                <div className="flex-1 p-8 md:p-12 lg:p-20" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <h3 className="text-2xl md:text-4xl text-white font-light mb-6 md:mb-10">Inquire</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                      <input type="text" placeholder="Full Name" required className="bg-transparent border-b text-white text-base md:text-lg py-3 outline-none w-full placeholder-white/50" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                      <input type="email" placeholder="Email Address" required className="bg-transparent border-b text-white text-base md:text-lg py-3 outline-none w-full placeholder-white/50" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                    </div>
                    <textarea rows={3} placeholder="Your Message" required className="bg-transparent border-b text-white text-base md:text-lg py-3 outline-none w-full mb-8 resize-none placeholder-white/50" style={{ borderColor: 'rgba(255,255,255,0.3)' }}></textarea>
                    <button type="submit" className="btn-outline w-full py-4 text-sm md:text-lg" disabled={formState !== 'idle'} style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>
                      {formState === 'sending' ? 'Sending...' : formState === 'success' ? 'Message Sent Successfully!' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer stays normal at the bottom */}
      <footer className="footer" style={{ position: 'relative', zIndex: 10, background: '#0a0a0a' }}>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <a href="#" className="logo footer-logo" style={{ color: 'white' }}>
                <span className="logo-icon" style={{ color: 'var(--accent-color)' }}><i className="fa-solid fa-building-columns"></i></span>
                GODAWARI
              </a>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>Building dreams and curating exceptional experiences across hospitality, real estate, and construction.</p>
              <div className="social-links">
                <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#"><i className="fa-brands fa-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
              </div>
            </div>
            <div className="footer-links">
              <h4 style={{ color: 'white' }}>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4 style={{ color: 'white' }}>Services</h4>
              <ul>
                <li><a href="#">Hospitality</a></li>
                <li><a href="#">Real Estate</a></li>
                <li><a href="#">Construction</a></li>
                <li><a href="#">Land Development</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom" style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>&copy; 2026 Godawari Hospitality & Real Estate. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
