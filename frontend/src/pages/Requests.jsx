import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Send } from 'lucide-react';

const Requests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [stores, setStores] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        storeId: user?.storeId || '',
        departmentId: user?.departmentId || '',
        date: new Date().toISOString().split('T')[0],
        lines: [{ itemId: '', qtyRequested: 0 }]
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const params = user?.storeId ? { storeId: user.storeId } : {};
            const [reqRes, storeRes, deptRes, itemRes] = await Promise.all([
                api.get('/requests', { params }),
                api.get('/stores'),
                api.get('/departments', { params }),
                api.get('/items')
            ]);
            setRequests(reqRes.data.requests || []);
            setStores(storeRes.data.stores || []);
            setDepartments(deptRes.data.departments || []);
            setItems(itemRes.data.items || []);

            if (user?.storeId || user?.departmentId) {
                setFormData(prev => ({
                    ...prev,
                    storeId: user.storeId || prev.storeId,
                    departmentId: user.departmentId || prev.departmentId
                }));
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data');
        } finally { setLoading(false); }
    };

    const addLine = () => setFormData({ ...formData, lines: [...formData.lines, { itemId: '', qtyRequested: 0 }] });
    const handleLineChange = (index, field, value) => {
        const lines = [...formData.lines];
        lines[index][field] = value;
        setFormData({ ...formData, lines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requests', formData);
            setIsModalOpen(false);
            setFormData({ storeId: '', departmentId: '', date: new Date().toISOString().split('T')[0], lines: [{ itemId: '', qtyRequested: 0 }] });
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to create request'); }
    };

    return (
        <div className="page-container fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="page-title">Stock Requests</h1>
                    <p className="page-subtitle">Manage internal stock requests between departments and stores</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> New Request
                </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? <div className="loading-state">Loading...</div> : (
                <div className="table-container glass-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Req No</th>
                                <th>Date</th>
                                <th>From (Dept)</th>
                                <th>To (Store)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req._id}>
                                    <td className="font-bold">{req.requestNo}</td>
                                    <td>{new Date(req.date).toLocaleDateString()}</td>
                                    <td>{req.departmentId?.name || '-'}</td>
                                    <td>{req.storeId?.name || '-'}</td>
                                    <td>
                                        <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' :
                                                req.status === 'SUBMITTED' ? 'badge-warning' :
                                                    req.status === 'PARTIALLY_ISSUED' ? 'badge-info' :
                                                        req.status === 'CLOSED' ? 'bg-slate-500 text-white' :
                                                            'badge-danger'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="glass-modal-overlay">
                    <div className="glass-modal-card glass-card scale-in-center overflow-y-auto max-h-[90vh]">
                        <div className="modal-vibrant-header">
                            <h2>New Stock Request</h2>
                            <button className="close-vibrant-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="vibrant-form-group">
                                    <label className="vibrant-label">Source Department</label>
                                    <select className="vibrant-input" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} required>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="vibrant-form-group">
                                    <label className="vibrant-label">Target Store</label>
                                    <select className="vibrant-input" value={formData.storeId} onChange={(e) => setFormData({ ...formData, storeId: e.target.value })} required>
                                        <option value="">Select Store</option>
                                        {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="vibrant-form-group">
                                <label className="vibrant-label">Request Date</label>
                                <input type="date" className="vibrant-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                            </div>

                            <div className="mt-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <h3 className="mb-6 text-orange-400 font-bold flex items-center gap-3">Requested Items</h3>
                                {formData.lines.map((line, index) => (
                                    <div key={index} className="flex gap-4 mb-4 items-end slide-in-bottom">
                                        <div className="flex-[2]">
                                            <select className="vibrant-input" value={line.itemId} onChange={(e) => handleLineChange(index, 'itemId', e.target.value)} required>
                                                <option value="">Select Item</option>
                                                {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <input type="number" className="vibrant-input" placeholder="Qty" value={line.qtyRequested} onChange={(e) => handleLineChange(index, 'qtyRequested', e.target.value)} required />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="text-orange-400 text-sm font-bold p-3 hover:bg-white/5 rounded-xl transition-all" onClick={addLine}>+ Add Item</button>
                            </div>

                            <div className="vibrant-modal-actions mt-10">
                                <button type="button" className="btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary flex-1" style={{ justifyContent: 'center' }}><Send size={18} /> Send Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requests;
