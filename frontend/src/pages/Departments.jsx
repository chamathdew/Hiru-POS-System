import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { Plus, Trash2, X } from 'lucide-react';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', storeId: '' });
    const [error, setError] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [deptRes, storeRes] = await Promise.all([
                axios.get('/departments'),
                axios.get('/stores')
            ]);
            setDepartments(deptRes.data.departments || []);
            setStores(storeRes.data.stores || []);
        } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/departments', formData);
            setIsModalOpen(false);
            setFormData({ name: '', storeId: '' });
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to create department'); }
    };

    return (
        <div className="page-container fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="page-title">Departments</h1>
                    <p className="page-subtitle">Manage departments across stores</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Add Department
                </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? <div className="loading-state">Loading...</div> : (
                <div className="table-container glass-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Department Name</th>
                                <th>Store</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(dept => (
                                <tr key={dept._id}>
                                    <td className="font-mono text-xs text-orange-400">{dept.code}</td>
                                    <td className="font-bold text-white">{dept.name}</td>
                                    <td>{dept.storeId?.name || "N/A"}</td>
                                    <td>
                                        <button className="action-btn delete" onClick={async () => {
                                            if (window.confirm("Delete?")) {
                                                await axios.delete(`/departments/${dept._id}`);
                                                fetchData();
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
                            <h2>New Department</h2>
                            <button className="close-vibrant-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Store</label>
                                <select className="vibrant-input" value={formData.storeId} onChange={(e) => setFormData({ ...formData, storeId: e.target.value })} required>
                                    <option value="">Select a Store</option>
                                    {stores.map(store => <option key={store._id} value={store._id}>{store.name}</option>)}
                                </select>
                            </div>

                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Department Name</label>
                                <input type="text" className="vibrant-input" placeholder="e.g. Sales, HR" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>

                            <div className="vibrant-modal-actions mt-10">
                                <button type="button" className="btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary flex-1" style={{ justifyContent: 'center' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
