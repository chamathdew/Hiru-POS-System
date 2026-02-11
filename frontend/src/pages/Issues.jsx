import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, X, PackageCheck, AlertCircle } from 'lucide-react';

const Issues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formData, setFormData] = useState({
        requestId: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        lines: []
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [issueRes, reqRes] = await Promise.all([
                api.get('/issues'),
                api.get('/requests')
            ]);
            setIssues(issueRes.data.issues || []);
            // Only show pending requests that can be issued
            setRequests(reqRes.data.requests?.filter(r => r.status === 'PENDING') || []);
        } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
    };

    const handleRequestChange = async (requestId) => {
        const req = requests.find(r => r._id === requestId);
        setSelectedRequest(req);
        if (req) {
            setFormData({
                ...formData,
                requestId,
                lines: req.lines.map(l => ({
                    itemId: l.itemId._id,
                    itemName: l.itemId.name,
                    qtyRequested: l.qtyRequested,
                    qtyIssued: l.qtyRequested // Default to full issue
                }))
            });
        }
    };

    const handleQtyChange = (index, value) => {
        const lines = [...formData.lines];
        lines[index].qtyIssued = value;
        setFormData({ ...formData, lines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/issues', formData);
            setIsModalOpen(false);
            setFormData({ requestId: '', date: new Date().toISOString().split('T')[0], notes: '', lines: [] });
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to process issue'); }
    };

    return (
        <div className="page-container fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="page-title">Stock Issues</h1>
                    <p className="page-subtitle">Process and fulfill pending stock requests</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Process Request
                </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? <div className="loading-state">Loading issues...</div> : (
                <div className="table-container glass-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Issue No</th>
                                <th>Date</th>
                                <th>Request Ref</th>
                                <th>Issued By</th>
                                <th>Total Items</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map(issue => (
                                <tr key={issue._id}>
                                    <td className="font-bold text-orange-400">{issue.issueNo}</td>
                                    <td>{new Date(issue.date).toLocaleDateString()}</td>
                                    <td className="text-dim">{issue.requestId?.requestNo || '-'}</td>
                                    <td>{issue.issuedBy?.name || 'System'}</td>
                                    <td className="font-bold text-white">{issue.lines?.length || 0} Items</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card scale-in-center max-w-3xl">
                        <div className="modal-header">
                            <h2>Process Stock Issue</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Select Pending Request</label>
                                    <select className="input-glass" value={formData.requestId} onChange={(e) => handleRequestChange(e.target.value)} required>
                                        <option value="">Select Request No</option>
                                        {requests.map(r => <option key={r._id} value={r._id}>{r.requestNo} ({r.departmentId?.name})</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Issue Date</label>
                                    <input type="date" className="input-glass" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                            </div>

                            {selectedRequest && (
                                <div className="mt-6">
                                    <h3 className="mb-4 text-orange-400 font-bold flex items-center gap-2"><PackageCheck size={18} /> Allocation Details</h3>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        {formData.lines.map((line, index) => (
                                            <div key={index} className="flex gap-4 items-center mb-3">
                                                <div className="flex-1 text-sm text-dim">{line.itemName}</div>
                                                <div className="w-24 text-center">
                                                    <div className="text-[10px] text-dim uppercase">Requested</div>
                                                    <div className="font-bold text-white">{line.qtyRequested}</div>
                                                </div>
                                                <div className="w-32">
                                                    <div className="text-[10px] text-orange-400 uppercase">Issuing Ahora</div>
                                                    <input type="number" className="input-glass text-center font-bold" value={line.qtyIssued} onChange={(e) => handleQtyChange(index, e.target.value)} max={line.qtyRequested} min="0" required />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-group mt-4">
                                <label>Notes</label>
                                <textarea className="input-glass" rows="2" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Internal notes..."></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary w-full" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary w-full" disabled={!selectedRequest}>Complete Issue</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Issues;
