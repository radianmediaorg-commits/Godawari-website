export const dynamic = "force-dynamic";
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminPropertiesList from './AdminPropertiesList';
import Link from 'next/link';
import './admin.css';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: { leads: { orderBy: { createdAt: 'desc' } }, units: true }
  });

  const totalLeads = properties.reduce((acc, p) => acc + (p.leads?.length || 0), 0);
  const availableCount = properties.filter(p => p.status === 'AVAILABLE').length;

  return (
    <div className="admin-wrapper">
      <div className="admin-container">
        {/* Luxury Header Card */}
        <header className="admin-header-card">
          <div className="admin-header-top">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <img 
                  src="/logo-white-text.png" 
                  alt="Godavari Hospitality & Realities" 
                  style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
                />
                <div className="admin-badge" style={{ margin: 0 }}>
                  <span className="admin-badge-dot"></span>
                  <span>Executive Portal</span>
                </div>
              </div>
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">Godawari Hospitality & Real Estate Portfolio Management</p>
            </div>

            <div className="admin-header-actions">
              <div className="admin-user-pill">
                <i className="fa-solid fa-shield-halved"></i>
                <span>{session.user?.email}</span>
              </div>
              <Link 
                href="/" 
                target="_blank"
                className="admin-btn-secondary"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                <span>View Site</span>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button 
                  type="submit" 
                  className="admin-btn-danger"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card stat-gold">
              <div>
                <span className="admin-stat-label">Total Properties</span>
                <span className="admin-stat-number">{properties.length}</span>
              </div>
              <i className="fa-solid fa-building-columns admin-stat-icon"></i>
            </div>
            <div className="admin-stat-card stat-emerald">
              <div>
                <span className="admin-stat-label">Available Listings</span>
                <span className="admin-stat-number">{availableCount}</span>
              </div>
              <i className="fa-solid fa-circle-check admin-stat-icon"></i>
            </div>
            <div className="admin-stat-card stat-blue">
              <div>
                <span className="admin-stat-label">Inquiry Leads</span>
                <span className="admin-stat-number">{totalLeads}</span>
              </div>
              <i className="fa-solid fa-envelope-open-text admin-stat-icon"></i>
            </div>
          </div>
        </header>

        <main>
          <AdminPropertiesList initialProperties={properties} />
        </main>
      </div>
    </div>
  );
}
