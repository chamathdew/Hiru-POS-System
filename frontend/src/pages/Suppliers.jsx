import { useState, useEffect } from 'react';
import axios from '../services/api';
import { Plus, Trash2, X, Phone } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact: '', address: '' });
    const [error, setError] = useState(null);

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/suppliers');
            setSuppliers(response.data.suppliers || []);
        } catch (err) { setError('Failed to fetch suppliers'); } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/suppliers', formData);
            setIsModalOpen(false);
            setFormData({ name: '', contact: '', address: '' });
            fetchSuppliers();
        } catch (err) { setError(err.response?.data?.message || 'Failed to add supplier'); }
    };

    return (
        <div className="page-container fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="page-title">Suppliers</h1>
                    <p className="page-subtitle">Manage vendor information</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Add Supplier
                </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? <div className="loading-state">Loading...</div> : (
                <div className="table-container glass-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Supplier Name</th>
                                <th>Contact Info</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(supplier => (
                                <tr key={supplier._id}>
                                    <td className="font-mono text-xs text-orange-400">{supplier.code}</td>
                                    <td className="font-bold text-white">{supplier.name}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-orange-400" /> {supplier.contact || supplier.phone}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="action-btn delete" onClick={async () => {
                                            if (window.confirm("Delete?")) {
                                                await axios.delete(`/suppliers/${supplier._id}`);
                                                fetchSuppliers();
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
                    <div className="glass-card glass-modal-card scale-in-center">
                        <div className="modal-vibrant-header">
                            <h2>New Supplier</h2>
                            <button className="close-vibrant-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Supplier Name</label>
                                <input type="text" className="vibrant-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Contact Number / Email</label>
                                <input type="text" className="vibrant-input" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} required />
                            </div>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Address</label>
                                <textarea className="vibrant-input" rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}></textarea>
                            </div>
                            <div className="vibrant-modal-actions mt-10">
                                <button type="button" className="btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary flex-1" style={{ justifyContent: 'center' }}>Add Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
