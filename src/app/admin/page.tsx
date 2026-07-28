import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminPropertiesList from './AdminPropertiesList';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: { leads: { orderBy: { createdAt: 'desc' } }, units: true }
  });

  return (
    <div style={{ padding: '20px', background: 'var(--bg-light)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: 0 }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{session.user?.email}</span>
            <Link href="/" className="btn-outline">View Site</Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 'bold' }}>Sign Out</button>
            </form>
          </div>
        </div>

        <AdminPropertiesList initialProperties={properties} />
      </div>
    </div>
  );
}
