"use client";
import React, { useState } from 'react';

export default function PropertyContactForm({ propertyTitle, propertyId, units }: { propertyTitle: string, propertyId: string, units?: any[] }) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  
  const generateMessage = (unitTitle: string) => {
    return unitTitle 
      ? `I am interested in ${propertyTitle} (Specifically: ${unitTitle}). Please contact me with more information.`
      : `I am interested in ${propertyTitle}. Please contact me with more information.`;
  };

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: generateMessage('') });

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUnit(val);
    setFormData({...formData, message: generateMessage(val)});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, propertyId }),
      });
      if (res.ok) {
        setFormState('success');
        setSelectedUnit('');
        setFormData({ name: '', email: '', phone: '', message: generateMessage('') });
        setTimeout(() => setFormState('idle'), 3000);
      } else {
        setFormState('idle');
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      setFormState('idle');
      alert('Error sending message.');
    }
  };

  return (
    <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Interested in this property?</h3>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <input type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
        </div>
        {units && units.length > 0 && (
          <div className="form-group">
            <select value={selectedUnit} onChange={handleUnitChange} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', background: '#f8f9fa' }}>
              <option value="">Interested in any unit</option>
              {units.map((u: any) => (
                <option key={u.id} value={u.title}>{u.title} {u.price ? `(₹${u.price.toLocaleString()})` : ''}</option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <textarea rows={4} placeholder="I am interested in..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required></textarea>
        </div>
        <button 
          type="submit" 
          className="btn-primary w-100" 
          disabled={formState !== 'idle'}
          style={formState === 'success' ? { background: '#28a745', borderColor: '#28a745' } : {}}
        >
          {formState === 'sending' ? 'Sending...' : formState === 'success' ? 'Sent Successfully!' : 'Request Details'}
        </button>
      </form>
    </div>
  );
}
