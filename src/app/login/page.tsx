"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid credentials');
        setLoading(false);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "var(--font-body, 'Inter', sans-serif)"
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '20px',
        padding: '40px 32px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '18px' }}>
            <img 
              src="/logo-white-text.png" 
              alt="Godavari Hospitality & Realities" 
              style={{ height: '56px', width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }} 
            />
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '100px',
            marginBottom: '16px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37', boxShadow: '0 0 10px #d4af37' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#f3e8c8' }}>Executive Portal</span>
          </div>

          <h2 style={{
            fontSize: '1.9rem',
            fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: '0 0 8px 0'
          }}>
            Admin Sign In
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, fontWeight: 300 }}>
            Godawari Hospitality & Real Estate
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#cbd5e1',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="admin@godawari.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#cbd5e1',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              marginTop: '10px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link 
            href="/" 
            style={{ 
              color: '#94a3b8', 
              fontSize: '0.85rem', 
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
          >
            &larr; Return to Godawari Main Website
          </Link>
        </div>
      </div>
    </div>
  );
}
