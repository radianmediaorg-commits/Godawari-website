export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyContactForm from '@/components/PropertyContactForm';
import PhotoGallery from '@/components/PhotoGallery';

export default async function UnitDetailsPage({ params }: { params: Promise<{ id: string, unitId: string }> }) {
  const { id, unitId } = await params;
  
  const unit = await prisma.propertyUnit.findUnique({
    where: { id: unitId },
    include: { property: true }
  });

  if (!unit || unit.propertyId !== id) {
    notFound();
  }

  let images = [];
  try {
    images = JSON.parse(unit.images || '[]');
  } catch (e) {
    images = typeof unit.images === 'string' ? [unit.images] : [];
  }
  const coverImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="bg-light min-h-screen">
      <style>{`
        .unit-gallery-img { transition: transform 0.3s ease; }
        .unit-gallery-img:hover { transform: scale(1.05); }
      `}</style>
      <nav className="navbar scrolled">
        <div className="container nav-container">
          <Link href="/" className="logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img 
              src="/logo-white-text.png" 
              alt="Godavari Hospitality & Realities" 
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/properties" className="btn-outline">Properties</Link></li>
          </ul>
        </div>
      </nav>

      <section className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <Link href={`/properties/${id}`} style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Property
          </Link>
          
          <PhotoGallery 
            images={images} 
            title={`${unit.title} (${unit.property.title})`} 
            variant="hero" 
            status={unit.status} 
            coverImage={coverImage} 
            heroHeight="420px" 
          />

          <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1.5', minWidth: '300px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '5px' }}>{unit.title}</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', margin: 0 }}>
                  <i className="fa-solid fa-building" style={{ marginRight: '5px', color: 'var(--accent-color)' }}></i> 
                  Part of <strong>{unit.property.title}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                {unit.size && (
                  <span style={{ display: 'inline-block', background: '#e3f2fd', color: '#1565c0', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <i className="fa-solid fa-ruler-combined"></i> {unit.size}
                  </span>
                )}
                <span style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                  {unit.price ? `₹${unit.price.toLocaleString()}` : 'Price on Request'}
                </span>
                <span style={{ display: 'inline-block', background: unit.status === 'AVAILABLE' ? '#e8f5e9' : '#ffebee', color: unit.status === 'AVAILABLE' ? '#2e7d32' : '#c62828', padding: '5px 15px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {unit.status}
                </span>
              </div>
              
              {unit.description && (
                <>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Unit Description</h3>
                  <div style={{ color: 'var(--text-light)', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '40px' }}>
                    {unit.description}
                  </div>
                </>
              )}

              {images.length > 0 && (
                <PhotoGallery 
                  images={images} 
                  title={unit.title} 
                  variant="grid" 
                />
              )}
            </div>

            <div style={{ flex: '1', minWidth: '300px' }}>
              <PropertyContactForm propertyTitle={unit.property.title} propertyId={unit.propertyId} units={[unit]} />
            </div>
          </div>
        </div>
      </section>
      
      <footer className="footer" style={{ marginTop: '80px' }}>
        <div className="container text-center">
          <p>&copy; 2026 Godawari Hospitality & Real Estate. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
