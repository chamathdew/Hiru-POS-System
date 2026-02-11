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
        <div className="fade-up">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Inventory Items</h1>
                    <p className="page-subtitle">Manage products, stock levels and categories</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Item
                </button>
            </header>

            {error && <div className="alert-error">{error}</div>}

            {loading ? <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading items...</div> : (
                <div className="table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Unit</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item._id}>
                                    <td><span className="id-tag">{item.code}</span></td>
                                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                                    <td>
                                        <span className="badge-flat success" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-dim)' }}>{item.unit.toUpperCase()}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="action-icon delete" title="Delete Item" onClick={async () => {
                                            if (window.confirm("Permanent delete?")) {
                                                try {
                                                    await api.delete(`/items/${item._id}`);
                                                    fetchItems();
                                                } catch (err) { setError('Failed to delete item'); }
                                            }
                                        }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-sheet">
                        <X className="close-cross" size={20} onClick={() => setIsModalOpen(false)} />
                        <h2 className="modal-title">Add New Inventory Item</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="field-group">
                                <label className="field-label">Item Name</label>
                                <input type="text" className="field-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="field-group">
                                    <label className="field-label">Item Code</label>
                                    <input type="text" className="field-input" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Auto-generated" />
                                </div>
                                <div className="field-group">
                                    <label className="field-label">Unit Type</label>
                                    <select className="field-input" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="l">Liters (l)</option>
                                        <option value="pkt">Packets (pkt)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field-group">
                                <label className="field-label">Category</label>
                                <input type="text" className="field-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Hardware" />
                            </div>
                            <div className="modal-btns">
                                <button type="button" className="btn-secondary full-width" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary full-width" style={{ justifyContent: 'center' }}>Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Items;
