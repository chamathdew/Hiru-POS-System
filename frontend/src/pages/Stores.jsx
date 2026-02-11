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
        <div className="fade-up">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Stores</h1>
                    <p className="page-subtitle">Manage branch locations and inventory centers</p>
                </div>
                <div className="flex-row-center gap-medium">
                    <button className="btn-secondary" onClick={handleExportPDF} title="Download PDF Report">
                        <FileText size={16} /> <span className="hide-on-mobile">Export PDF</span>
                    </button>
                    <button className="btn-secondary" onClick={handleExportExcel} title="Download Excel Sheet">
                        <FileSpreadsheet size={16} /> <span className="hide-on-mobile">Excel Sheet</span>
                    </button>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> New Store
                    </button>
                </div>
            </header>

            {error && <div className="alert-error">{error}</div>}

            {loading ? <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading store data...</div> : (
                <div className="table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Branch Name</th>
                                <th>Full Location</th>
                                <th>Date Added</th>
                                <th style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store._id}>
                                    <td><span className="id-tag">{store.code}</span></td>
                                    <td style={{ fontWeight: 500 }}>{store.name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{store.location}</td>
                                    <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                        {new Date(store.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="action-icon delete" title="Remove Branch" onClick={async () => {
                                            if (window.confirm("Delete this store? This cannot be undone.")) {
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
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-sheet">
                        <X className="close-cross" size={20} onClick={() => setIsModalOpen(false)} />
                        <h2 className="modal-title">Register New Store</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="field-group">
                                <label className="field-label">Store Name</label>
                                <input type="text" className="field-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Main Hub" />
                            </div>
                            <div className="field-group">
                                <label className="field-label">Location Address</label>
                                <input type="text" className="field-input" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required placeholder="No. 45, Highlevel Road..." />
                            </div>
                            <div className="modal-btns">
                                <button type="button" className="btn-secondary full-width" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary full-width" style={{ justifyContent: 'center' }}>Create Hub</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stores;
