"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [formState, setFormState] = useState('idle'); // idle, sending, success

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    animateElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
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
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#" className="logo">
            <span className="logo-icon"><i className="fa-solid fa-building-columns"></i></span>
            Godawari
          </a>
          <ul className={`nav-links ${menuActive ? 'active' : ''}`}>
            <li><a href="#home" onClick={closeMenu}>Home</a></li>
            <li><a href="#about" onClick={closeMenu}>About</a></li>
            <li><a href="#services" onClick={closeMenu}>Services</a></li>
            <li><a href="/properties" className="btn-outline" onClick={closeMenu}>Properties</a></li>
          </ul>
          <div className={`hamburger ${menuActive ? 'active' : ''}`} onClick={toggleMenu}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="fade-in-up">Building Dreams, Curating Experiences.</h1>
          <p className="fade-in-up delay-1">Premium services across Hospitality, Real Estate, Construction, and Land Development.</p>
          <div className="hero-buttons fade-in-up delay-2">
            <a href="#services" className="btn-primary">Explore Services</a>
            <a href="/properties" className="btn-secondary">View Properties</a>
          </div>
        </div>
      </section>

      <section id="about" className="about section">
        <div className="container about-container">
          <div className="about-text slide-in-left">
            <h2 className="section-title">About Godawari</h2>
            <div className="title-underline"></div>
            <p>At Godawari Hospitality & Real Estate, we believe in creating spaces that inspire and experiences that linger. With a rich legacy in the industry, we have established ourselves as pioneers in multifaceted domains.</p>
            <p>From luxurious hospitality ventures to robust construction projects and meticulous land development, our commitment to quality, integrity, and innovation remains unwavering.</p>
            
            <div className="stats-grid">
              <div className="stat-item">
                <h3>15+</h3>
                <p>Years Experience</p>
              </div>
              <div className="stat-item">
                <h3>50+</h3>
                <p>Projects Completed</p>
              </div>
              <div className="stat-item">
                <h3>100%</h3>
                <p>Client Satisfaction</p>
              </div>
            </div>
          </div>
          <div className="about-image slide-in-right">
            <div className="image-wrapper">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Modern Architecture" />
              <div className="experience-badge">
                <span className="years">Premium</span>
                <span className="text">Quality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services section bg-light">
        <div className="container">
          <div className="section-header text-center fade-in-up">
            <h2 className="section-title">Our Expertise</h2>
            <div className="title-underline center"></div>
            <p>Comprehensive solutions tailored to elevate your lifestyle and investments.</p>
          </div>

          <div className="services-grid">
            <div className="service-card fade-in-up delay-1">
              <div className="service-img">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Hospitality" />
              </div>
              <div className="service-content">
                <div className="service-icon"><i className="fa-solid fa-bell-concierge"></i></div>
                <h3>Hospitality</h3>
                <p>Exceptional guest experiences, luxury accommodations, and world-class service management.</p>
                <a href="#" className="read-more">Learn More <i className="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>

            <div className="service-card fade-in-up delay-2">
              <div className="service-img">
                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Real Estate" />
              </div>
              <div className="service-content">
                <div className="service-icon"><i className="fa-solid fa-house-chimney-window"></i></div>
                <h3>Real Estate</h3>
                <p>Premium residential and commercial properties curated for discerning buyers and investors.</p>
                <a href="/properties" className="read-more">View Listings <i className="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>

            <div className="service-card fade-in-up delay-3">
              <div className="service-img">
                <img src="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Construction" />
              </div>
              <div className="service-content">
                <div className="service-icon"><i className="fa-solid fa-helmet-safety"></i></div>
                <h3>Construction</h3>
                <p>State-of-the-art construction services delivering robust, sustainable, and aesthetic structures.</p>
                <a href="#" className="read-more">Learn More <i className="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>

            <div className="service-card fade-in-up delay-4">
              <div className="service-img">
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Land Development" />
              </div>
              <div className="service-content">
                <div className="service-icon"><i className="fa-solid fa-map-location-dot"></i></div>
                <h3>Land Development</h3>
                <p>Strategic land acquisition, zoning, and meticulous development for future-ready projects.</p>
                <a href="#" className="read-more">Learn More <i className="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner section">
        <div className="container text-center fade-in-up">
          <h2>Retailing and Wholesaling of Land & Property</h2>
          <p>We offer unmatched opportunities in land and property trading, ensuring maximum value and seamless transactions.</p>
          <a href="#contact" className="btn-primary mt-4">Partner With Us</a>
        </div>
      </section>

      <section id="contact" className="contact section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info slide-in-left">
              <h2 className="section-title">Get In Touch</h2>
              <div className="title-underline"></div>
              <p>Ready to start your next project or looking for the perfect investment? Contact our team of experts today.</p>
              
              <div className="info-items">
                <div className="info-item">
                  <div className="icon"><i className="fa-solid fa-location-dot"></i></div>
                  <div>
                    <h4>Head Office</h4>
                    <p>123 Godawari Avenue, Business District, City, Country</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="icon"><i className="fa-solid fa-envelope"></i></div>
                  <div>
                    <h4>Email Us</h4>
                    <p>contact@godawarihospitality.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="icon"><i className="fa-solid fa-phone"></i></div>
                  <div>
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-form-container slide-in-right">
              <form onSubmit={handleSubmit} className="contact-form">
                <h3>Send a Message</h3>
                <div className="form-group">
                  <input type="text" placeholder="Full Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Email Address" required />
                </div>
                <div className="form-group">
                  <select defaultValue="" required>
                    <option value="" disabled>Area of Interest</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="construction">Construction</option>
                    <option value="land_dev">Land Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <textarea rows={4} placeholder="Your Message" required></textarea>
                </div>
                <button type="submit" className="btn-primary w-100" disabled={formState !== 'idle'}>
                  {formState === 'sending' ? 'Sending...' : formState === 'success' ? 'Message Sent Successfully!' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <a href="#" className="logo footer-logo">
                <span className="logo-icon"><i className="fa-solid fa-building-columns"></i></span>
                Godawari
              </a>
              <p>Building dreams and curating exceptional experiences across hospitality, real estate, and construction.</p>
              <div className="social-links">
                <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#"><i className="fa-brands fa-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
              </div>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Services</h4>
              <ul>
                <li><a href="#">Hospitality</a></li>
                <li><a href="#">Real Estate</a></li>
                <li><a href="#">Construction</a></li>
                <li><a href="#">Land Development</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Godawari Hospitality & Real Estate. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
