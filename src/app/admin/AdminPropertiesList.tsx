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
  const [viewingLeadsId, setViewingLeadsId] = useState<string | null>(null);
  const router = useRouter();

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
        <button 
          onClick={() => handleOpenModal()} 
          className="admin-btn-gold"
        >
          <i className="fa-solid fa-plus"></i>
          <span>Add New Property</span>
        </button>
      </div>

      {/* Empty State */}
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
            onClick={() => handleOpenModal()}
            className="admin-btn-gold"
            style={{ width: 'auto', display: 'inline-flex' }}
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add First Property</span>
          </button>
        </div>
      )}

      {/* Mobile Card Layout (Visible on screens <= 768px) */}
      <div className="admin-mobile-list">
        {properties.map(p => {
          const cover = getCoverImage(p.images);
          return (
            <div key={p.id} className="admin-prop-card">
              <div className="admin-prop-card-top">
                {cover ? (
                  <img src={cover} alt={p.title} className="admin-prop-img" />
                ) : (
                  <div className="admin-prop-img-placeholder">
                    <i className="fa-solid fa-building"></i>
                  </div>
                )}
                <div className="admin-prop-meta">
                  <div className="admin-prop-tags">
                    <span className="admin-pill-cat">{p.category}</span>
                    <span className={`admin-pill-status ${p.status === 'AVAILABLE' ? 'status-available' : 'status-sold'}`}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="admin-prop-title">{p.title}</h3>
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
                <button
                  onClick={() => setViewingLeadsId(p.id)}
                  className="admin-action-btn btn-leads"
                >
                  <i className="fa-solid fa-users"></i>
                  <span>Leads ({p.leads?.length || 0})</span>
                </button>
                <button
                  onClick={() => handleOpenModal(p)}
                  className="admin-action-btn btn-edit"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="admin-action-btn btn-delete"
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
      {properties.length > 0 && (
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
              {properties.map(p => {
                const cover = getCoverImage(p.images);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-table-item">
                        {cover ? (
                          <img src={cover} alt={p.title} className="admin-table-thumb" />
                        ) : (
                          <div className="admin-table-thumb-placeholder">
                            <i className="fa-solid fa-building"></i>
                          </div>
                        )}
                        <div>
                          <div className="admin-table-title">{p.title}</div>
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
                      <span className={`admin-pill-status ${p.status === 'AVAILABLE' ? 'status-available' : 'status-sold'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {p.units?.length || 0} Unit{p.units?.length === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setViewingLeadsId(p.id)}
                        className="admin-action-btn btn-leads"
                        style={{ padding: '6px 12px' }}
                      >
                        <i className="fa-solid fa-users"></i>
                        <span>{p.leads?.length || 0} Lead{p.leads?.length === 1 ? '' : 's'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleOpenModal(p)} 
                          className="admin-action-btn btn-edit"
                          title="Edit Property"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>Edit</span>
                        </button>
                        <button 
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

      {/* Leads Viewer Modal */}
      {viewingLeadsId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-dialog">
            {/* Leads Modal Header */}
            <div className="admin-modal-header">
              <div style={{ paddingRight: '16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#38bdf8', marginBottom: '2px' }}>
                  Client Inquiries
                </div>
                <h3 className="admin-modal-title" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                  {properties.find(p => p.id === viewingLeadsId)?.title}
                </h3>
              </div>
              <button 
                onClick={() => setViewingLeadsId(null)} 
                className="admin-modal-close"
              >
                &times;
              </button>
            </div>
            
            {/* Leads Modal Body */}
            <div className="admin-modal-body">
              {properties.find(p => p.id === viewingLeadsId)?.leads?.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '1.25rem' }}>
                    <i className="fa-solid fa-inbox"></i>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0 0 6px 0', fontWeight: 500 }}>No Inquiries Yet</h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                    Inquiries submitted from the property catalog will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {properties.find(p => p.id === viewingLeadsId)?.leads?.map((lead: any) => (
                    <div key={lead.id} style={{
                      padding: '16px',
                      background: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>{lead.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(lead.createdAt).toLocaleString()}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {lead.email && (
                          <a 
                            href={`mailto:${lead.email}`} 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'rgba(56, 189, 248, 0.1)',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              color: '#7dd3fc',
                              fontSize: '0.75rem',
                              textDecoration: 'none'
                            }}
                          >
                            <i className="fa-solid fa-envelope"></i>
                            <span>{lead.email}</span>
                          </a>
                        )}
                        {lead.phone && (
                          <a 
                            href={`tel:${lead.phone}`} 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#6ee7b7',
                              fontSize: '0.75rem',
                              textDecoration: 'none'
                            }}
                          >
                            <i className="fa-solid fa-phone"></i>
                            <span>{lead.phone}</span>
                          </a>
                        )}
                      </div>

                      {lead.message && (
                        <div style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '12px',
                          fontSize: '0.8rem',
                          color: '#cbd5e1'
                        }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Message</span>
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{lead.message}</p>
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
                onClick={() => setViewingLeadsId(null)}
                className="admin-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
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
