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
        <div className="page-container fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Items Inventory</h1>
                    <p className="page-subtitle">Manage products and stock items</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Add Item
                </button>
            </header>

            {error && <div className="error-alert">{error}</div>}

            {loading ? <div className="loading-state">Loading inventory...</div> : (
                <div className="table-container fade-in">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID / Code</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Unit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item._id}>
                                    <td className="id-cell">{item.code}</td>
                                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                                    <td>
                                        <span className="status-badge active" style={{ fontSize: '0.7rem' }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{item.unit.toUpperCase()}</td>
                                    <td>
                                        <button className="action-btn delete" title="Delete Item" onClick={async () => {
                                            if (window.confirm("Delete this item?")) {
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
                <div className="modal-overlay">
                    <div className="modal-content scale-in">
                        <div className="modal-header">
                            <h2>New Inventory Item</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Item Name</label>
                                <input type="text" className="input-glass" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Custom Code</label>
                                    <input type="text" className="input-glass" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Auto-generated" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Unit</label>
                                    <select className="input-glass" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="l">Liters (l)</option>
                                        <option value="pkt">Packets (pkt)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <input type="text" className="input-glass" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Raw Materials" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary w-full" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary w-full" style={{ justifyContent: 'center' }}>Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Items;
