import { useState, useEffect } from 'react';
import axios from '../services/api';
import { Plus, Trash2, X, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '' });
    const [error, setError] = useState(null);

    useEffect(() => { fetchStores(); }, []);

    const fetchStores = async () => {
        try {
            const response = await axios.get('/stores');
            setStores(response.data.stores || []);
        } catch (err) { setError('Failed to fetch stores'); } finally { setLoading(false); }
    };

    const handleExportPDF = () => {
        const columns = [
            { header: 'ID', key: 'code' },
            { header: 'Store Name', key: 'name' },
            { header: 'Location', key: 'location' },
            { header: 'Created At', key: 'createdAt' }
        ];
        const data = stores.map(s => ({
            ...s,
            createdAt: new Date(s.createdAt).toLocaleDateString()
        }));
        exportToPDF("Stores Report", columns, data, "stores_report.pdf");
    };

    const handleExportExcel = () => {
        const data = stores.map(s => ({
            ID: s.code,
            Name: s.name,
            Location: s.location,
            CreatedAt: new Date(s.createdAt).toLocaleDateString()
        }));
        exportToExcel(data, "stores_report.xlsx");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/stores', formData);
            setIsModalOpen(false);
            setFormData({ name: '', location: '' });
            fetchStores();
        } catch (err) { setError(err.response?.data?.message || 'Failed to create store'); }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Stores Management</h1>
                    <p className="page-subtitle">Manage all physical store locations</p>
                </div>
                <div className="flex gap-2 mb-2">
                    <button className="btn-secondary" onClick={handleExportPDF} title="Export PDF">
                        <FileText size={18} /> <span className="hidden-mobile">PDF</span>
                    </button>
                    <button className="btn-secondary" onClick={handleExportExcel} title="Export Excel">
                        <FileSpreadsheet size={18} /> <span className="hidden-mobile">Excel</span>
                    </button>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} /> Add New Store
                    </button>
                </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? <div className="loading-state">Loading stores...</div> : (
                <div className="table-container fade-in">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Store Name</th>
                                <th>Location</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store._id}>
                                    <td className="id-cell">{store.code}</td>
                                    <td style={{ fontWeight: 600 }}>{store.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{store.location}</td>
                                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                        {new Date(store.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className="action-btn delete" title="Delete Store" onClick={async () => {
                                            if (window.confirm("Are you sure you want to delete this store?")) {
                                                try {
                                                    await axios.delete(`/stores/${store._id}`);
                                                    fetchStores();
                                                } catch (err) { setError('Failed to delete store'); }
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
                            <h2>Add New Store</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Store Name</label>
                                <input type="text" className="input-glass" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Colombo Central" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input type="text" className="input-glass" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required placeholder="e.g. No 123, Galle Road" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary w-full" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary w-full" style={{ justifyContent: 'center' }}>Create Store</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stores;
