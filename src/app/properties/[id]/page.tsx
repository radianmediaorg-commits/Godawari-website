export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyContactForm from '@/components/PropertyContactForm';

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { units: true }
  });

  if (!property) {
    notFound();
  }

  let images = [];
  try {
    images = JSON.parse(property.images || '[]');
  } catch (e) {
    images = typeof property.images === 'string' ? [property.images] : [];
  }
  const coverImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="bg-light min-h-screen">
      <nav className="navbar scrolled">
        <div className="container nav-container">
          <Link href="/" className="logo">
            <span className="logo-icon"><i className="fa-solid fa-building-columns"></i></span>
            Godawari
          </Link>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/properties" className="btn-outline">Properties</Link></li>
          </ul>
        </div>
      </nav>

      <section className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <Link href="/properties" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Properties
          </Link>
          
          <div style={{ position: 'relative', height: '500px', borderRadius: '12px', overflow: 'hidden', marginBottom: '40px' }}>
            <img src={coverImage} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {property.status === 'SOLD' && (
              <div style={{ position: 'absolute', top: 20, right: 20, background: 'red', color: 'white', padding: '10px 20px', borderRadius: '4px', fontSize: '1.2rem', fontWeight: 'bold', zIndex: 10 }}>SOLD</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1.5', minWidth: '300px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '5px' }}>{property.title}</h1>
                {property.address && (
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', margin: 0 }}>
                    <i className="fa-solid fa-location-dot" style={{ marginRight: '5px', color: 'var(--accent-color)' }}></i> {property.address}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-block', background: 'var(--primary-color)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                  {property.category}
                </span>
                {property.brochure && (
                  <a href={property.brochure} target="_blank" rel="noopener noreferrer" download="Brochure.pdf" style={{ color: 'var(--accent-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                    <i className="fa-solid fa-file-pdf"></i> Download Brochure
                  </a>
                )}
                {property.contactPhone && (
                  <a href={`tel:${property.contactPhone}`} style={{ color: 'var(--primary-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                    <i className="fa-solid fa-phone"></i> {property.contactPhone}
                  </a>
                )}
              </div>
              
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Description</h3>
              <div style={{ color: 'var(--text-light)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {property.description}
              </div>

              {property.units && property.units.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Available Units</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {property.units.map((unit: any) => {
                      let unitImages = [];
                      try {
                        unitImages = JSON.parse(unit.images || '[]');
                      } catch (e) {
                        unitImages = typeof unit.images === 'string' ? [unit.images] : [];
                      }
                      return (
                        <div key={unit.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>{unit.title}</h4>
                              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                {unit.size && <span style={{ marginRight: '15px' }}><i className="fa-solid fa-ruler-combined"></i> {unit.size}</span>}
                                <span style={{ color: unit.status === 'AVAILABLE' ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>{unit.status}</span>
                              </div>
                            </div>
                            <div style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                              {unit.price ? `₹${unit.price.toLocaleString()}` : 'Price on Request'}
                            </div>
                          </div>
                          {unitImages.length > 0 && (
                            <div style={{ marginTop: '15px' }}>
                              <img src={unitImages[0]} alt={`${unit.title}`} style={{ height: '150px', width: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                            </div>
                          )}
                          <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <Link href={`/properties/${property.id}/units/${unit.id}`} className="btn-outline" style={{ display: 'inline-block', padding: '8px 20px' }}>
                              View Unit Details &rarr;
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            <div style={{ flex: '1', minWidth: '300px' }}>
              <PropertyContactForm propertyTitle={property.title} propertyId={property.id} units={property.units} />
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
