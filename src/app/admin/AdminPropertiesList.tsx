"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPropertiesList({ initialProperties }: { initialProperties: any[] }) {
  const [properties, setProperties] = useState(initialProperties);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    title: '', description: '', category: 'Real Estate', status: 'AVAILABLE', address: '',
    contactPhone: '', 
    existingBrochure: '', 
    existingImages: [] as string[],
    units: [] as any[] 
  });
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newBrochureFile, setNewBrochureFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [viewingLeadsPropertyId, setViewingLeadsPropertyId] = useState<string | 'ALL' | null>(null);
  const [leadsDatePreset, setLeadsDatePreset] = useState<'all' | 'today' | '7days' | '30days' | 'month' | 'custom'>('all');
  const [leadsStartDate, setLeadsStartDate] = useState<string>('');
  const [leadsEndDate, setLeadsEndDate] = useState<string>('');
  const [leadsSearch, setLeadsSearch] = useState<string>('');
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);
  const [propertyTab, setPropertyTab] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const activePropertiesCount = properties.filter(p => p.status !== 'ARCHIVED').length;
  const archivedPropertiesCount = properties.filter(p => p.status === 'ARCHIVED').length;

  const displayedProperties = properties.filter(p => {
    if (propertyTab === 'ACTIVE') return p.status !== 'ARCHIVED';
    if (propertyTab === 'ARCHIVED') return p.status === 'ARCHIVED';
    return true;
  });

  const handleToggleArchive = async (property: any) => {
    const isCurrentlyArchived = property.status === 'ARCHIVED';
    const nextStatus = isCurrentlyArchived ? 'AVAILABLE' : 'ARCHIVED';
    const confirmMsg = isCurrentlyArchived
      ? `Restore "${property.title}" to active public listings?`
      : `Archive "${property.title}"?\n\nThis will immediately hide the property from the public website, but all leads, sub-units, photos, and records will be preserved safely.`;

    if (!confirm(confirmMsg)) return;

    setArchiveLoadingId(property.id);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        setProperties(properties.map(p => p.id === property.id ? { ...p, status: nextStatus } : p));
        router.refresh();
      } else {
        alert('Failed to update property status. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating property status.');
    } finally {
      setArchiveLoadingId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'AVAILABLE') {
      return <span className="admin-pill-status status-available">AVAILABLE</span>;
    }
    if (status === 'SOLD') {
      return <span className="admin-pill-status status-sold">SOLD</span>;
    }
    if (status === 'ARCHIVED') {
      return <span className="admin-pill-status status-archived">ARCHIVED</span>;
    }
    return <span className="admin-pill-status">{status}</span>;
  };

  const handleOpenLeads = (propId: string | 'ALL' = 'ALL') => {
    setViewingLeadsPropertyId(propId);
    setLeadsDatePreset('all');
    setLeadsStartDate('');
    setLeadsEndDate('');
    setLeadsSearch('');
  };

  const handleSelectDatePreset = (preset: 'all' | 'today' | '7days' | '30days' | 'month' | 'custom') => {
    setLeadsDatePreset(preset);
    const now = new Date();
    const formatYMD = (d: Date) => d.toISOString().slice(0, 10);

    if (preset === 'all') {
      setLeadsStartDate('');
      setLeadsEndDate('');
    } else if (preset === 'today') {
      const today = formatYMD(now);
      setLeadsStartDate(today);
      setLeadsEndDate(today);
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setLeadsStartDate(formatYMD(past));
      setLeadsEndDate(formatYMD(now));
    } else if (preset === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setLeadsStartDate(formatYMD(past));
      setLeadsEndDate(formatYMD(now));
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setLeadsStartDate(formatYMD(firstDay));
      setLeadsEndDate(formatYMD(now));
    }
  };

  // Compile all leads flattened across properties
  const allLeads = properties.flatMap(p => 
    (p.leads || []).map((lead: any) => ({
      ...lead,
      propertyId: p.id,
      propertyTitle: p.title,
      propertyCategory: p.category
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter leads based on selected property, date range, and search query
  const filteredLeads = allLeads.filter(lead => {
    if (viewingLeadsPropertyId && viewingLeadsPropertyId !== 'ALL') {
      if (lead.propertyId !== viewingLeadsPropertyId) return false;
    }
    if (leadsStartDate) {
      const start = new Date(leadsStartDate);
      start.setHours(0, 0, 0, 0);
      if (new Date(lead.createdAt) < start) return false;
    }
    if (leadsEndDate) {
      const end = new Date(leadsEndDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(lead.createdAt) > end) return false;
    }
    if (leadsSearch.trim()) {
      const q = leadsSearch.toLowerCase().trim();
      const matchName = lead.name?.toLowerCase().includes(q);
      const matchEmail = lead.email?.toLowerCase().includes(q);
      const matchPhone = lead.phone?.toLowerCase().includes(q);
      const matchMsg = lead.message?.toLowerCase().includes(q);
      const matchProp = lead.propertyTitle?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchMsg && !matchProp) return false;
    }
    return true;
  });

  // Export filtered contacts list to CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      alert('No leads to export with the current date/filter selection.');
      return;
    }

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const val = String(str).replace(/"/g, '""');
      return `"${val}"`;
    };

    const headers = [
      'Submission Date',
      'Client Name',
      'Phone Number',
      'Email Address',
      'Property',
      'Category',
      'Inquiry Message'
    ];

    const rows = filteredLeads.map(l => [
      escapeCsv(new Date(l.createdAt).toLocaleString()),
      escapeCsv(l.name),
      escapeCsv(l.phone),
      escapeCsv(l.email),
      escapeCsv(l.propertyTitle),
      escapeCsv(l.propertyCategory),
      escapeCsv(l.message)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    // Add UTF-8 BOM so Excel opens with proper accents and formatting
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    const dateStr = new Date().toISOString().slice(0, 10);
    const propName = viewingLeadsPropertyId && viewingLeadsPropertyId !== 'ALL'
      ? properties.find(p => p.id === viewingLeadsPropertyId)?.title.replace(/[^a-zA-Z0-9]/g, '_')
      : 'All_Properties';

    link.setAttribute('download', `Godavari_Contacts_${propName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyContact = (lead: any) => {
    const text = `${lead.name} | Phone: ${lead.phone || 'N/A'} | Email: ${lead.email || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedLeadId(lead.id);
    setTimeout(() => setCopiedLeadId(null), 2000);
  };

  const handleOpenModal = (property?: any) => {
    if (property) {
      setEditingId(property.id);
      setFormData({
        title: property.title,
        description: property.description,
        category: property.category,
        status: property.status,
        address: property.address || '',
        contactPhone: property.contactPhone || '',
        existingBrochure: property.brochure || '',
        existingImages: (() => {
          if (!property.images) return [];
          try { return JSON.parse(property.images); }
          catch(e) { return typeof property.images === 'string' ? [property.images] : []; }
        })(),
        units: property.units ? property.units.map((u: any) => ({
          ...u,
          existingImages: (() => {
            if (!u.images) return [];
            try { return JSON.parse(u.images); }
            catch(e) { return typeof u.images === 'string' ? [u.images] : []; }
          })(),
          newImagesFiles: []
        })) : []
      });
    } else {
      setEditingId(null);
      setFormData({ 
        title: '', description: '', category: 'Real Estate', status: 'AVAILABLE', address: '',
        contactPhone: '', existingBrochure: '', existingImages: [], units: [] 
      });
    }
    setNewImageFiles([]);
    setNewBrochureFile(null);
    setIsModalOpen(true);
  };

  const uploadFile = async (file: File) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
    }

    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: fd
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Upload failed for ${file.name}`);
    }
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload brochure if new one selected
      let brochureUrl = formData.existingBrochure;
      if (newBrochureFile) {
        brochureUrl = await uploadFile(newBrochureFile);
      }

      let propertyImageUrls = [...formData.existingImages];
      if (newImageFiles && newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map(uploadFile);
        const newUrls = await Promise.all(uploadPromises);
        propertyImageUrls = [newUrls[0]]; // Only keep the newest uploaded photo
      }

      // 3. Upload unit images
      const processedUnits = await Promise.all(formData.units.map(async (u) => {
        let unitImageUrls = [...(u.existingImages || [])];
        if (u.newImagesFiles && u.newImagesFiles.length > 0) {
          const unitUploadPromises = u.newImagesFiles.map((file: File) => uploadFile(file));
          const newUnitUrls = await Promise.all(unitUploadPromises);
          unitImageUrls = [...unitImageUrls, ...newUnitUrls];
        }
        return {
          title: u.title,
          description: u.description || null,
          price: u.price || null,
          size: u.size || null,
          status: u.status,
          images: unitImageUrls
        };
      }));

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        address: formData.address,
        contactPhone: formData.contactPhone,
        brochure: brochureUrl,
        images: propertyImageUrls,
        units: processedUnits
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/properties/${editingId}` : '/api/properties';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
        window.location.reload(); // Simple reload to get fresh data
      } else {
        throw new Error('Failed to save property to database');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error saving property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      setProperties(properties.filter(p => p.id !== id));
      router.refresh();
    }
  };

  const getCoverImage = (imagesStr: any) => {
    if (!imagesStr) return null;
    try {
      const parsed = typeof imagesStr === 'string' ? JSON.parse(imagesStr) : imagesStr;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch {
      return typeof imagesStr === 'string' ? imagesStr : null;
    }
  };

  return (
    <div>
      {/* Action Toolbar */}
      <div className="admin-toolbar">
        <div>
          <h2 style={{
            fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
            fontSize: '1.5rem',
            color: '#ffffff',
            margin: '0 0 4px 0',
            fontWeight: 400
          }}>
            Manage Properties
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 300 }}>
            Curate, edit, and monitor your luxury real estate developments and inquiries.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => handleOpenLeads('ALL')}
            className="admin-btn-cyan"
            title="Inspect all inquiries, filter by dates, and export contacts"
          >
            <i className="fa-solid fa-address-book"></i>
            <span>Leads & Contacts ({allLeads.length})</span>
          </button>
          <button 
            type="button"
            onClick={() => handleOpenModal()} 
            className="admin-btn-gold"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* Property Status Filter Tabs */}
      <div className="admin-tab-bar">
        <button
          type="button"
          onClick={() => setPropertyTab('ACTIVE')}
          className={`admin-tab-btn ${propertyTab === 'ACTIVE' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-list-check"></i>
          <span>Active Listings ({activePropertiesCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setPropertyTab('ARCHIVED')}
          className={`admin-tab-btn ${propertyTab === 'ARCHIVED' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-box-archive"></i>
          <span>Archived ({archivedPropertiesCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setPropertyTab('ALL')}
          className={`admin-tab-btn ${propertyTab === 'ALL' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-layer-group"></i>
          <span>All Properties ({properties.length})</span>
        </button>
      </div>

      {/* Empty State (Total Portfolio) */}
      {properties.length === 0 && (
        <div className="admin-empty-card">
          <div className="admin-empty-icon">
            <i className="fa-solid fa-hotel"></i>
          </div>
          <h3 className="admin-empty-title">No Properties Listed Yet</h3>
          <p className="admin-empty-desc">
            Your portfolio is currently empty. Begin by publishing your first landmark land development, estate, or suite.
          </p>
          <button 
            type="button"
            onClick={() => handleOpenModal()}
            className="admin-btn-gold"
            style={{ width: 'auto', display: 'inline-flex' }}
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add First Property</span>
          </button>
        </div>
      )}

      {/* Empty State for Filtered Tab */}
      {properties.length > 0 && displayedProperties.length === 0 && (
        <div className="admin-empty-card" style={{ padding: '36px 20px', marginBottom: '24px' }}>
          <div className="admin-empty-icon" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
            <i className={propertyTab === 'ARCHIVED' ? "fa-solid fa-box-archive" : "fa-solid fa-hotel"}></i>
          </div>
          <h3 className="admin-empty-title" style={{ fontSize: '1.1rem' }}>
            {propertyTab === 'ARCHIVED' ? 'No Archived Properties' : 'No Properties Found'}
          </h3>
          <p className="admin-empty-desc" style={{ fontSize: '0.85rem' }}>
            {propertyTab === 'ARCHIVED' 
              ? 'Properties you archive will appear here safely hidden from the public website, preserving leads, sub-units, and photos.'
              : 'There are currently no properties matching the active tab view.'}
          </p>
        </div>
      )}

      {/* Mobile Card Layout (Visible on screens <= 768px) */}
      <div className="admin-mobile-list">
        {displayedProperties.map(p => {
          const cover = getCoverImage(p.images);
          const isArchived = p.status === 'ARCHIVED';
          return (
            <div key={p.id} className="admin-prop-card" style={{ opacity: isArchived ? 0.85 : 1 }}>
              <div className="admin-prop-card-top">
                {cover ? (
                  <a 
                    href={`/properties/${p.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Open live property in new tab"
                    style={{ display: 'block' }}
                  >
                    <img src={cover} alt={p.title} className="admin-prop-img" />
                  </a>
                ) : (
                  <div className="admin-prop-img-placeholder">
                    <i className="fa-solid fa-building"></i>
                  </div>
                )}
                <div className="admin-prop-meta">
                  <div className="admin-prop-tags">
                    <span className="admin-pill-cat">{p.category}</span>
                    {renderStatusBadge(p.status)}
                  </div>
                  <h3 className="admin-prop-title">
                    <a 
                      href={`/properties/${p.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="admin-prop-title-link"
                      title="Open live property in a new tab"
                    >
                      <span>{p.title}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px', opacity: 0.7 }}></i>
                    </a>
                  </h3>
                  {p.address && (
                    <p className="admin-prop-address">
                      <i className="fa-solid fa-location-dot" style={{ fontSize: '10px', color: '#d4af37' }}></i>
                      <span>{p.address}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="admin-prop-card-stats">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-layer-group" style={{ color: '#d4af37' }}></i>
                  <span>{p.units?.length || 0} Sub-unit{p.units?.length === 1 ? '' : 's'}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7dd3fc' }}>
                  <i className="fa-solid fa-envelope-open-text"></i>
                  <span>{p.leads?.length || 0} Lead{p.leads?.length === 1 ? '' : 's'}</span>
                </span>
              </div>

              <div className="admin-prop-card-actions">
                <a
                  href={`/properties/${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-action-btn btn-view"
                  title="Open live property page in a new tab"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  <span>View</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleOpenLeads(p.id)}
                  className="admin-action-btn btn-leads"
                  title="View leads for this property"
                >
                  <i className="fa-solid fa-users"></i>
                  <span>Leads ({p.leads?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleArchive(p)}
                  disabled={archiveLoadingId === p.id}
                  className={`admin-action-btn ${isArchived ? 'btn-restore' : 'btn-archive'}`}
                  title={isArchived ? 'Restore to live website' : 'Archive and hide from public website'}
                >
                  <i className={archiveLoadingId === p.id ? "fa-solid fa-spinner fa-spin" : (isArchived ? "fa-solid fa-arrow-rotate-left" : "fa-solid fa-box-archive")}></i>
                  <span>{isArchived ? 'Restore' : 'Archive'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenModal(p)}
                  className="admin-action-btn btn-edit"
                  title="Edit Property"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="admin-action-btn btn-delete"
                  title="Delete Property"
                >
                  <i className="fa-solid fa-trash"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout (Visible on screens > 768px) */}
      {displayedProperties.length > 0 && (
        <div className="admin-desktop-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Category</th>
                <th>Status</th>
                <th>Sub-units</th>
                <th>Leads</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProperties.map(p => {
                const cover = getCoverImage(p.images);
                const isArchived = p.status === 'ARCHIVED';
                return (
                  <tr key={p.id} style={{ opacity: isArchived ? 0.8 : 1 }}>
                    <td>
                      <div className="admin-table-item">
                        {cover ? (
                          <a 
                            href={`/properties/${p.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="admin-table-thumb-link"
                            title="Open live property in a new tab"
                          >
                            <img src={cover} alt={p.title} className="admin-table-thumb" />
                          </a>
                        ) : (
                          <div className="admin-table-thumb-placeholder">
                            <i className="fa-solid fa-building"></i>
                          </div>
                        )}
                        <div>
                          <div className="admin-table-title">
                            <a 
                              href={`/properties/${p.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="admin-table-title-link"
                              title="Open live property in a new tab"
                            >
                              <span>{p.title}</span>
                              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px', opacity: 0.7 }}></i>
                            </a>
                          </div>
                          {p.address && (
                            <div className="admin-table-address">
                              <i className="fa-solid fa-location-dot" style={{ fontSize: '10px', color: '#d4af37', marginRight: '4px' }}></i>
                              {p.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-pill-cat">{p.category}</span>
                    </td>
                    <td>
                      {renderStatusBadge(p.status)}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {p.units?.length || 0} Unit{p.units?.length === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleOpenLeads(p.id)}
                        className="admin-action-btn btn-leads"
                        style={{ padding: '6px 12px' }}
                        title="View leads and export contacts"
                      >
                        <i className="fa-solid fa-users"></i>
                        <span>{p.leads?.length || 0} Lead{p.leads?.length === 1 ? '' : 's'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <a 
                          href={`/properties/${p.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="admin-action-btn btn-view"
                          title="Open live property in a new tab"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          <span>View</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleToggleArchive(p)}
                          disabled={archiveLoadingId === p.id}
                          className={`admin-action-btn ${isArchived ? 'btn-restore' : 'btn-archive'}`}
                          title={isArchived ? 'Restore to live website' : 'Archive (hide from public)'}
                        >
                          <i className={archiveLoadingId === p.id ? "fa-solid fa-spinner fa-spin" : (isArchived ? "fa-solid fa-arrow-rotate-left" : "fa-solid fa-box-archive")}></i>
                          <span>{isArchived ? 'Restore' : 'Archive'}</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleOpenModal(p)} 
                          className="admin-action-btn btn-edit"
                          title="Edit Property"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>Edit</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(p.id)} 
                          className="admin-action-btn btn-delete"
                          title="Delete Property"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Add Property Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-dialog">
            {/* Modal Header */}
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  {editingId ? 'Edit Property Listing' : 'Add Luxury Property'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Enter accurate specifications for Godawari's exclusive catalog.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="admin-modal-close"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="admin-modal-body">
              <form id="property-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Property Title *</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="admin-input"
                    placeholder="e.g. Godawari Serenity Estates"
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Description *</label>
                  <textarea 
                    rows={3} 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="admin-textarea"
                    placeholder="Detail the landmark location, architecture, views, and lifestyle amenities..."
                    required
                  ></textarea>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Address</label>
                  <input 
                    type="text" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    className="admin-input"
                    placeholder="e.g. VIP Road, Solapur" 
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Category *</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="admin-select"
                      required
                    >
                      <option value="Hospitality">Hospitality</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Construction">Construction</option>
                      <option value="Land Development">Land Development</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Status *</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})} 
                      className="admin-select"
                      required
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="SOLD">SOLD</option>
                      <option value="ARCHIVED">ARCHIVED (Hidden from Public)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Brochure (PDF)</label>
                    {formData.existingBrochure && (
                      <div style={{ marginBottom: '6px' }}>
                        <a href={formData.existingBrochure} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#d4af37', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa-solid fa-file-pdf"></i>
                          <span>View Current Brochure</span>
                        </a>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={e => setNewBrochureFile(e.target.files ? e.target.files[0] : null)} 
                      style={{ fontSize: '0.8rem', color: '#94a3b8' }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Contact Phone</label>
                    <input 
                      type="text" 
                      placeholder="+91 98765 43210" 
                      value={formData.contactPhone} 
                      onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
                      className="admin-input"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div className="admin-form-group">
                  <label className="admin-label">Property Cover Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {formData.existingImages.length > 0 && newImageFiles.length === 0 && (
                      <img 
                        src={formData.existingImages[0]} 
                        alt="Current Cover" 
                        style={{ width: '90px', height: '65px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(212, 175, 55, 0.4)' }} 
                      />
                    )}
                    {newImageFiles.length > 0 && (
                      <img 
                        src={URL.createObjectURL(newImageFiles[0])} 
                        alt="New Cover Preview" 
                        style={{ width: '90px', height: '65px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #d4af37' }} 
                      />
                    )}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setNewImageFiles([e.target.files[0]]);
                          }
                          e.target.value = '';
                        }} 
                        style={{ fontSize: '0.8rem', color: '#94a3b8' }}
                      />
                      <small style={{ color: '#64748b', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                        Upload high-resolution photography for the hero card.
                      </small>
                    </div>
                  </div>
                </div>
                
                {/* Sub-units Section */}
                <div className="admin-subunits-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>Sub-units / Floor Plans</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Configure individual villas, plots, or suites.</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, units: [...formData.units, { title: '', description: '', price: '', size: '', existingImages: [], newImagesFiles: [], status: 'AVAILABLE' }]})} 
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '8px',
                        color: '#fef08a',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      + Add Unit
                    </button>
                  </div>
                  
                  {formData.units.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                      No sub-units added yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {formData.units.map((unit, index) => (
                        <div key={index} className="admin-unit-item">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px' }}>Unit #{index + 1}</span>
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, units: formData.units.filter((_, i) => i !== index)})} 
                              style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              &times; Remove
                            </button>
                          </div>

                          <div className="admin-grid-2">
                            <div>
                              <label className="admin-label" style={{ fontSize: '0.7rem' }}>Title *</label>
                              <input 
                                type="text" 
                                value={unit.title} 
                                onChange={(e) => { const newUnits = [...formData.units]; newUnits[index].title = e.target.value; setFormData({...formData, units: newUnits}); }} 
                                placeholder="e.g. Royal Villa, 4BHK"
                                className="admin-input" 
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                required 
                              />
                            </div>
                            <div>
                              <label className="admin-label" style={{ fontSize: '0.7rem' }}>Size</label>
                              <input 
                                type="text" 
                                value={unit.size || ''} 
                                onChange={(e) => { const newUnits = [...formData.units]; newUnits[index].size = e.target.value; setFormData({...formData, units: newUnits}); }} 
                                placeholder="e.g. 3,200 sq.ft."
                                className="admin-input" 
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                              />
                            </div>
                          </div>

                          <div className="admin-grid-2">
                            <div>
                              <label className="admin-label" style={{ fontSize: '0.7rem' }}>Price</label>
                              <input 
                                type="number" 
                                value={unit.price || ''} 
                                onChange={(e) => { const newUnits = [...formData.units]; newUnits[index].price = e.target.value; setFormData({...formData, units: newUnits}); }} 
                                placeholder="Amount in ₹"
                                className="admin-input" 
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                              />
                            </div>
                            <div>
                              <label className="admin-label" style={{ fontSize: '0.7rem' }}>Status</label>
                              <select 
                                value={unit.status} 
                                onChange={(e) => { const newUnits = [...formData.units]; newUnits[index].status = e.target.value; setFormData({...formData, units: newUnits}); }} 
                                className="admin-select"
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                              >
                                <option value="AVAILABLE">AVAILABLE</option>
                                <option value="SOLD">SOLD</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="admin-label" style={{ fontSize: '0.7rem' }}>Unit Photos</label>
                            {(unit.existingImages?.length > 0 || unit.newImagesFiles?.length > 0) && (
                              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
                                {unit.existingImages?.map((img: string, i: number) => (
                                  <div key={i} style={{ position: 'relative', width: '60px', height: '45px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <img src={img} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                      type="button" 
                                      onClick={() => { const newUnits = [...formData.units]; newUnits[index].existingImages = newUnits[index].existingImages.filter((_: any, idx: number) => idx !== i); setFormData({...formData, units: newUnits}); }} 
                                      style={{ position: 'absolute', top: 2, right: 2, width: '16px', height: '16px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                                {unit.newImagesFiles?.map((file: File, i: number) => (
                                  <div key={i} style={{ position: 'relative', width: '60px', height: '45px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #d4af37' }}>
                                    <img src={URL.createObjectURL(file)} alt={`New ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                      type="button" 
                                      onClick={() => { const newUnits = [...formData.units]; newUnits[index].newImagesFiles = newUnits[index].newImagesFiles.filter((_: any, idx: number) => idx !== i); setFormData({...formData, units: newUnits}); }} 
                                      style={{ position: 'absolute', top: 2, right: 2, width: '16px', height: '16px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              onChange={(e) => { 
                                if (e.target.files) {
                                  const newUnits = [...formData.units]; 
                                  newUnits[index].newImagesFiles = [...(newUnits[index].newImagesFiles || []), ...Array.from(e.target.files)]; 
                                  setFormData({...formData, units: newUnits}); 
                                }
                                e.target.value = '';
                              }} 
                              style={{ fontSize: '0.75rem', color: '#94a3b8' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="property-form"
                disabled={loading}
                className="admin-btn-gold"
                style={{ width: 'auto', padding: '10px 24px' }}
              >
                {loading ? 'Saving...' : 'Save Property'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Leads & Contacts Management Modal */}
      {viewingLeadsPropertyId !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-dialog" style={{ maxWidth: '820px' }}>
            {/* Leads Modal Header */}
            <div className="admin-modal-header">
              <div style={{ paddingRight: '16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#38bdf8', marginBottom: '2px' }}>
                  Client Inquiries & Contacts
                </div>
                <h3 className="admin-modal-title" style={{ fontSize: '1.25rem' }}>
                  {viewingLeadsPropertyId === 'ALL' 
                    ? 'All Client Inquiries' 
                    : properties.find(p => p.id === viewingLeadsPropertyId)?.title}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setViewingLeadsPropertyId(null)} 
                className="admin-modal-close"
                title="Close"
              >
                &times;
              </button>
            </div>
            
            {/* Leads Modal Body */}
            <div className="admin-modal-body">
              {/* Filter & Controls Card */}
              <div className="admin-leads-filter-card">
                {/* Row 1: Property Selector & Search */}
                <div className="admin-grid-2">
                  <div>
                    <label className="admin-label" style={{ fontSize: '0.72rem' }}>Filter by Property</label>
                    <select
                      value={viewingLeadsPropertyId || 'ALL'}
                      onChange={(e) => setViewingLeadsPropertyId(e.target.value)}
                      className="admin-select"
                      style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                    >
                      <option value="ALL">All Properties ({allLeads.length} Total Inquiries)</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.leads?.length || 0} leads)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label" style={{ fontSize: '0.72rem' }}>Search Inquiries</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search by name, phone, email, keyword..."
                        value={leadsSearch}
                        onChange={(e) => setLeadsSearch(e.target.value)}
                        className="admin-input"
                        style={{ fontSize: '0.85rem', padding: '8px 12px 8px 34px' }}
                      />
                      <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.8rem' }}></i>
                    </div>
                  </div>
                </div>

                {/* Row 2: Date Presets & Custom Date Range */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <label className="admin-label" style={{ margin: 0, fontSize: '0.72rem' }}>Filter by Submission Date</label>
                    <div className="admin-preset-pills">
                      <button
                        type="button"
                        onClick={() => handleSelectDatePreset('all')}
                        className={`admin-preset-pill ${leadsDatePreset === 'all' ? 'active' : ''}`}
                      >
                        All Time
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectDatePreset('today')}
                        className={`admin-preset-pill ${leadsDatePreset === 'today' ? 'active' : ''}`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectDatePreset('7days')}
                        className={`admin-preset-pill ${leadsDatePreset === '7days' ? 'active' : ''}`}
                      >
                        Last 7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectDatePreset('30days')}
                        className={`admin-preset-pill ${leadsDatePreset === '30days' ? 'active' : ''}`}
                      >
                        Last 30 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectDatePreset('month')}
                        className={`admin-preset-pill ${leadsDatePreset === 'month' ? 'active' : ''}`}
                      >
                        This Month
                      </button>
                    </div>
                  </div>

                  {/* Custom Date Pickers & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
                    <div className="admin-date-picker-group">
                      <label>From:</label>
                      <input
                        type="date"
                        value={leadsStartDate}
                        onChange={(e) => {
                          setLeadsStartDate(e.target.value);
                          setLeadsDatePreset('custom');
                        }}
                        className="admin-date-input"
                      />
                      <label>To:</label>
                      <input
                        type="date"
                        value={leadsEndDate}
                        onChange={(e) => {
                          setLeadsEndDate(e.target.value);
                          setLeadsDatePreset('custom');
                        }}
                        className="admin-date-input"
                      />
                      {(leadsStartDate || leadsEndDate || leadsDatePreset !== 'all' || leadsSearch) && (
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectDatePreset('all');
                            setLeadsSearch('');
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            marginLeft: '4px'
                          }}
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>

                    {/* Export Contacts Button */}
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      disabled={filteredLeads.length === 0}
                      className="admin-btn-emerald"
                      title="Download filtered leads contact list as CSV for Excel or Google Sheets"
                      style={{ opacity: filteredLeads.length === 0 ? 0.5 : 1, cursor: filteredLeads.length === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      <i className="fa-solid fa-file-arrow-down"></i>
                      <span>Export Contacts ({filteredLeads.length})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '0 4px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>
                  Showing <strong style={{ color: '#ffffff' }}>{filteredLeads.length}</strong> of {allLeads.length} total inquiries
                </span>
                {leadsDatePreset !== 'all' && (
                  <span style={{ color: '#d4af37', fontWeight: 500 }}>
                    Active Date Filter: {leadsDatePreset.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Inquiries List */}
              {filteredLeads.length === 0 ? (
                <div style={{ padding: '50px 16px', textAlign: 'center', background: 'rgba(2, 6, 23, 0.4)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '1.25rem' }}>
                    <i className="fa-solid fa-filter-circle-xmark"></i>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0 0 6px 0', fontWeight: 500 }}>No Inquiries Found</h4>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 16px 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                    No client inquiries match the selected date range or search keyword. Try clearing dates or selecting "All Time".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectDatePreset('all');
                      setLeadsSearch('');
                      setViewingLeadsPropertyId('ALL');
                    }}
                    className="admin-btn-secondary"
                    style={{ display: 'inline-flex', padding: '8px 16px' }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredLeads.map((lead: any) => (
                    <div key={lead.id} style={{
                      padding: '18px',
                      background: 'rgba(2, 6, 23, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {/* Top Lead Info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0' }}>
                            {lead.name}
                          </h4>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', color: '#fce892' }}>
                            <i className="fa-solid fa-building" style={{ fontSize: '10px' }}></i>
                            <span>{lead.propertyTitle}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>
                            {new Date(lead.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>

                      {/* Contact Channels */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {lead.phone && (
                          <a 
                            href={`tel:${lead.phone}`} 
                            className="lead-contact-btn phone"
                            title="Call phone number"
                          >
                            <i className="fa-solid fa-phone"></i>
                            <span>{lead.phone}</span>
                          </a>
                        )}

                        {lead.email && (
                          <a 
                            href={`mailto:${lead.email}`} 
                            className="lead-contact-btn email"
                            title="Send email"
                          >
                            <i className="fa-solid fa-envelope"></i>
                            <span>{lead.email}</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyContact(lead)}
                          className="lead-contact-btn copy"
                          title="Copy contact details to clipboard"
                        >
                          <i className={`fa-solid ${copiedLeadId === lead.id ? 'fa-check' : 'fa-copy'}`}></i>
                          <span>{copiedLeadId === lead.id ? 'Copied!' : 'Copy Info'}</span>
                        </button>
                      </div>

                      {/* Lead Message */}
                      {lead.message && (
                        <div style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          fontSize: '0.82rem',
                          color: '#cbd5e1'
                        }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Client Requirement</span>
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{lead.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leads Modal Footer */}
            <div className="admin-modal-footer">
              <button 
                type="button"
                onClick={handleExportCSV}
                disabled={filteredLeads.length === 0}
                className="admin-btn-emerald"
                style={{ marginRight: 'auto', opacity: filteredLeads.length === 0 ? 0.5 : 1 }}
              >
                <i className="fa-solid fa-file-arrow-down"></i>
                <span>Export ({filteredLeads.length})</span>
              </button>

              <button 
                type="button"
                onClick={() => setViewingLeadsPropertyId(null)}
                className="admin-btn-secondary"
              >
                Close Inquiries
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
