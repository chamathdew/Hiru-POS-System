import { useState, useEffect } from 'react';
import axios from '../services/api';
import { Plus, Trash2, FileText, FileSpreadsheet, X, Store as StoreIcon } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import '../styles/Table.css';
import '../styles/Common.css';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await axios.get('/stores');
            setStores(response.data.stores || []);
        } catch (err) {
            setError('Failed to fetch stores. Please check connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const headers = ["ID", "Store Name", "Location", "Created"];
        const data = stores.map(s => [s.code, s.name, s.location, new Date(s.createdAt).toLocaleDateString()]);
        exportToPDF("Stores_Report", "Hiru POS - Store Locations", headers, data);
    };

    const handleExportExcel = () => {
        const data = stores.map(s => ({
            "Store ID": s.code,
            "Name": s.name,
            "Location": s.location,
            "Created Date": new Date(s.createdAt).toLocaleDateString()
        }));
        exportToExcel(data, "Stores_Inventory");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/stores', formData);
            setIsModalOpen(false);
            setFormData({ name: '', location: '' });
            fetchStores();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create store');
        }
    };

    return (
        <div className="fade-in">
            <header className="flex-between-vibrant" style={{ marginBottom: '3.5rem', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Stores Management</h1>
                    <p className="page-subtitle">Track and manage your physical retail locations</p>
                </div>
                <div className="flex-between-vibrant gap-vibrant">
                    <button className="btn-secondary" onClick={handleExportPDF}>
                        <FileText size={20} /> <span className="hide-on-tablet">Report PDF</span>
                    </button>
                    <button className="btn-secondary" onClick={handleExportExcel}>
                        <FileSpreadsheet size={20} /> <span className="hide-on-tablet">Export Excel</span>
                    </button>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={22} /> Register Hub
                    </button>
                </div>
            </header>

            {error && <div className="vibrant-error-alert">{error}</div>}

            {loading ? (
                <div className="glass-card fade-in" style={{ padding: '6rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Fetching store registry...</div>
                </div>
            ) : (
                <div className="glass-card glass-table-container fade-in">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Registry ID</th>
                                <th>Store Identity</th>
                                <th>Location Hub</th>
                                <th>Registry Date</th>
                                <th style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store._id}>
                                    <td className="code-accent">{store.code}</td>
                                    <td style={{ fontWeight: 600, color: 'white' }}>{store.name}</td>
                                    <td>{store.location}</td>
                                    <td style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                                        {new Date(store.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="glass-action-btn danger" title="Delete Store" onClick={async () => {
                                            if (window.confirm("Confirm removal of this store location?")) {
                                                try {
                                                    await axios.delete(`/stores/${store._id}`);
                                                    fetchStores();
                                                } catch (err) { setError('Failed to delete store'); }
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
                            <h2>Register Store</h2>
                            <button className="close-vibrant-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Store Identity / Name</label>
                                <input type="text" className="vibrant-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Colombo Operations Center" />
                            </div>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Logistical Location</label>
                                <input type="text" className="vibrant-input" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required placeholder="e.g. 123 Highlevel Rd, Colombo 06" />
                            </div>
                            <div className="vibrant-modal-actions">
                                <button type="button" className="btn-secondary w-full-vibrant" style={{ justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary w-full-vibrant" style={{ justifyContent: 'center' }}>Establish Store</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stores;
