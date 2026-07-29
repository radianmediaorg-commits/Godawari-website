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

      // 2. Upload property images if new ones selected
      let propertyImageUrls = [...formData.existingImages];
      if (newImageFiles && newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map(uploadFile);
        const newUrls = await Promise.all(uploadPromises);
        propertyImageUrls = [...propertyImageUrls, ...newUrls];
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Manage Properties</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary" style={{ padding: '10px 20px' }}>+ Add New Property</button>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--primary-color)', color: 'white' }}>
            <tr>
              <th style={{ padding: '15px' }}>Title</th>
              <th style={{ padding: '15px' }}>Category</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Leads</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{p.title}</td>
                <td style={{ padding: '15px' }}>{p.category}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '5px 10px', borderRadius: '4px', background: p.status === 'AVAILABLE' ? '#e8f5e9' : '#ffebee', color: p.status === 'AVAILABLE' ? '#2e7d32' : '#c62828', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '5px 10px', borderRadius: '4px', background: '#e3f2fd', color: '#1565c0', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {p.leads?.length || 0} Lead{p.leads?.length === 1 ? '' : 's'}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button onClick={() => setViewingLeadsId(p.id)} style={{ background: 'none', border: 'none', color: '#1565c0', cursor: 'pointer', marginRight: '15px' }}><i className="fa-solid fa-users"></i> Leads</button>
                  <button onClick={() => handleOpenModal(p)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginRight: '15px' }}><i className="fa-solid fa-pen-to-square"></i> Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i> Delete</button>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)' }}>No properties found. Click "Add New Property" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>{editingId ? 'Edit Property' : 'Add New Property'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Property Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="e.g. 123 Main St, City" />
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Construction">Construction</option>
                    <option value="Land Development">Land Development</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="SOLD">SOLD</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Brochure (PDF)</label>
                  {formData.existingBrochure && (
                    <div style={{ marginBottom: '5px' }}>
                      <a href={formData.existingBrochure} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-color)' }}>View Current Brochure</a>
                    </div>
                  )}
                  <input type="file" accept="application/pdf" onChange={e => setNewBrochureFile(e.target.files ? e.target.files[0] : null)} />
                  <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '5px' }}>Upload a new PDF to replace the existing one.</small>
                </div>
                <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Contact Phone</label>
                  <input type="text" placeholder="+1234567890" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Images</label>
                {formData.existingImages.length > 0 && (
                  <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
                    {formData.existingImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative', minWidth: '80px', height: '60px' }}>
                        <img src={img} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                        <button type="button" onClick={() => setFormData({...formData, existingImages: formData.existingImages.filter((_, idx) => idx !== i)})} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
                {newImageFiles.length > 0 && (
                  <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
                    {newImageFiles.map((file, i) => (
                      <div key={i} style={{ position: 'relative', minWidth: '80px', height: '60px' }}>
                        <img src={URL.createObjectURL(file)} alt={`New Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                        <button type="button" onClick={() => setNewImageFiles(newImageFiles.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" multiple accept="image/*" onChange={e => {
                  if (e.target.files) {
                    setNewImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                  e.target.value = '';
                }} />
                <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '5px' }}>Upload new images (they will be added to the existing ones).</small>
              </div>
              
              <div style={{ marginTop: '30px', marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Sub-properties / Units</h4>
                  <button type="button" onClick={() => setFormData({...formData, units: [...formData.units, { title: '', description: '', price: '', size: '', existingImages: [], newImagesFiles: [], status: 'AVAILABLE' }]})} style={{ background: 'white', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ Add Unit</button>
                </div>
                
                {formData.units.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '0.9rem' }}>No units added yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {formData.units.map((unit, index) => (
                      <div key={index} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <strong>Unit #{index + 1}</strong>
                          <button type="button" onClick={() => setFormData({...formData, units: formData.units.filter((_, i) => i !== index)})} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>&times; Remove</button>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Title (e.g. Penthouse, 2BHK)</label>
                            <input type="text" value={unit.title} onChange={(e) => { const newUnits = [...formData.units]; newUnits[index].title = e.target.value; setFormData({...formData, units: newUnits}); }} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} required />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Size (e.g. 1200 sqft)</label>
                            <input type="text" value={unit.size || ''} onChange={(e) => { const newUnits = [...formData.units]; newUnits[index].size = e.target.value; setFormData({...formData, units: newUnits}); }} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                          <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Price</label>
                            <input type="number" value={unit.price || ''} onChange={(e) => { const newUnits = [...formData.units]; newUnits[index].price = e.target.value; setFormData({...formData, units: newUnits}); }} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Status</label>
                            <select value={unit.status} onChange={(e) => { const newUnits = [...formData.units]; newUnits[index].status = e.target.value; setFormData({...formData, units: newUnits}); }} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                              <option value="AVAILABLE">AVAILABLE</option>
                              <option value="SOLD">SOLD</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Unit Images</label>
                          {unit.existingImages?.length > 0 && (
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
                              {unit.existingImages.map((img: string, i: number) => (
                                <div key={i} style={{ position: 'relative', minWidth: '60px', height: '40px' }}>
                                  <img src={img} alt={`Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                  <button type="button" onClick={() => { const newUnits = [...formData.units]; newUnits[index].existingImages = newUnits[index].existingImages.filter((_: any, idx: number) => idx !== i); setFormData({...formData, units: newUnits}); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '15px', height: '15px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                                </div>
                              ))}
                            </div>
                          )}
                          {unit.newImagesFiles?.length > 0 && (
                            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
                              {unit.newImagesFiles.map((file: File, i: number) => (
                                <div key={i} style={{ position: 'relative', minWidth: '60px', height: '40px' }}>
                                  <img src={URL.createObjectURL(file)} alt={`New Preview ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                  <button type="button" onClick={() => { const newUnits = [...formData.units]; newUnits[index].newImagesFiles = newUnits[index].newImagesFiles.filter((_: any, idx: number) => idx !== i); setFormData({...formData, units: newUnits}); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '15px', height: '15px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                                </div>
                              ))}
                            </div>
                          )}
                          <input type="file" multiple accept="image/*" onChange={(e) => { 
                            if (e.target.files) {
                              const newUnits = [...formData.units]; 
                              newUnits[index].newImagesFiles = [...(newUnits[index].newImagesFiles || []), ...Array.from(e.target.files)]; 
                              setFormData({...formData, units: newUnits}); 
                            }
                            e.target.value = '';
                          }} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary w-100" disabled={loading}>
                {loading ? 'Uploading & Saving...' : 'Save Property'}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewingLeadsId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>
                Leads for {properties.find(p => p.id === viewingLeadsId)?.title}
              </h3>
              <button onClick={() => setViewingLeadsId(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            {properties.find(p => p.id === viewingLeadsId)?.leads?.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)', background: '#f8f9fa', borderRadius: '8px' }}>
                No leads received for this property yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {properties.find(p => p.id === viewingLeadsId)?.leads?.map((lead: any) => (
                  <div key={lead.id} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>{lead.name}</h4>
                      <small style={{ color: 'var(--text-light)' }}>{new Date(lead.createdAt).toLocaleString()}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <a href={`mailto:${lead.email}`} style={{ color: 'var(--accent-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fa-solid fa-envelope"></i> {lead.email}
                      </a>
                      <a href={`tel:${lead.phone}`} style={{ color: 'var(--accent-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fa-solid fa-phone"></i> {lead.phone}
                      </a>
                    </div>
                    <div style={{ background: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #eee' }}>
                      <strong>Message:</strong>
                      <p style={{ margin: '5px 0 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-light)' }}>{lead.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
