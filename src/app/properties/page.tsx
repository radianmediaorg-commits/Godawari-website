export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="bg-light min-h-screen">
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

      <section className="section" style={{ paddingTop: '150px' }}>
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Available Properties</h2>
            <div className="title-underline center"></div>
            <p>Explore our premium portfolio of land, commercial, and residential properties.</p>
          </div>

          {properties.length === 0 ? (
            <div className="text-center" style={{ padding: '50px 0', color: 'var(--text-light)' }}>
              <p>No properties available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="services-grid">
              {properties.map((property) => {
                let images = [];
                try {
                  images = JSON.parse(property.images || '[]');
                } catch (e) {
                  images = typeof property.images === 'string' ? [property.images] : [];
                }
                const coverImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                
                return (
                  <div key={property.id} className="service-card">
                    <div className="service-img" style={{ height: '250px' }}>
                      <img src={coverImage} alt={property.title} />
                      {property.status === 'SOLD' && (
                        <div style={{ position: 'absolute', top: 15, right: 15, zIndex: 10 }}>
                          <span className="badge badge-danger">SOLD</span>
                        </div>
                      )}
                    </div>
                    <div className="service-content">
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{property.title}</h3>
                      {property.address && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '10px' }}>
                          <i className="fa-solid fa-location-dot" style={{ marginRight: '5px' }}></i> {property.address}
                        </p>
                      )}
                      <p style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {property.description}
                      </p>
                      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>{property.category}</span>
                        <Link href={`/properties/${property.id}`} className="read-more">View Details <i className="fa-solid fa-arrow-right"></i></Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container text-center">
          <p>&copy; 2026 Godawari Hospitality & Real Estate. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
