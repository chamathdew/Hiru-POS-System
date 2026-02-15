import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X, Package } from 'lucide-react';

const Items = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', category: '', unit: 'pcs' });

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const response = await api.get('/items');
            setItems(response.data.items || []);
        } catch (err) { setError('Failed to fetch items'); } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/items', formData);
            setIsModalOpen(false);
            setFormData({ name: '', code: '', category: '', unit: 'pcs' });
            fetchItems();
        } catch (err) { setError(err.response?.data?.message || 'Failed to create item'); }
    };

    return (
        <div className="fade-in">
            <header className="flex-between-vibrant" style={{ marginBottom: '3.5rem' }}>
                <div>
                    <h1 className="page-title">Inventory Analytics</h1>
                    <p className="page-subtitle">Track products, supplies and raw material inventory</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={22} /> Add New Product
                </button>
            </header>

            {error && <div className="vibrant-error-alert">{error}</div>}

            {loading ? (
                <div className="glass-card fade-in" style={{ padding: '6rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Syncing warehouse data...</div>
                </div>
            ) : (
                <div className="glass-card table-container fade-in">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Unit Scale</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item._id}>
                                    <td className="text-orange-vibrant font-bold">{item.code}</td>
                                    <td style={{ fontWeight: 600, color: 'white' }}>{item.name}</td>
                                    <td>
                                        <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-dim)' }}>{item.unit.toUpperCase()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="action-btn delete" title="Delete Item" onClick={async () => {
                                            if (window.confirm("Remove this item from inventory?")) {
                                                try {
                                                    await api.delete(`/items/${item._id}`);
                                                    fetchItems();
                                                } catch (err) { setError('Failed to delete item'); }
                                            }
                                        }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="glass-modal-overlay">
                    <div className="glass-card glass-modal-card">
                        <div className="modal-vibrant-header">
                            <h2>Add Inventory Item</h2>
                            <button className="close-vibrant-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Product Name</label>
                                <input type="text" className="vibrant-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="vibrant-form-group">
                                    <label className="vibrant-label">Custom Code</label>
                                    <input type="text" className="vibrant-input" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Auto-gen" />
                                </div>
                                <div className="vibrant-form-group">
                                    <label className="vibrant-label">Unit Scale</label>
                                    <select className="vibrant-input" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="l">Liters (l)</option>
                                        <option value="pkt">Packets (pkt)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Category</label>
                                <input type="text" className="vibrant-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Raw Materials" />
                            </div>
                            <div className="vibrant-modal-actions">
                                <button type="button" className="btn-secondary w-full-vibrant" style={{ justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary w-full-vibrant" style={{ justifyContent: 'center' }}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Items;
