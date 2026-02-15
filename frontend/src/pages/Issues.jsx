import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, X, PackageCheck, AlertCircle } from 'lucide-react';

const Issues = () => {
    const { user } = useAuth();
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
            const params = user?.storeId ? { storeId: user.storeId } : {};
            const [issueRes, reqRes] = await Promise.all([
                api.get('/issues', { params }),
                api.get('/requests', { params })
            ]);
            setIssues(issueRes.data.issues || []);
            // Only show APPROVED or PARTIALLY_ISSUED requests that can be issued
            setRequests(reqRes.data.requests?.filter(r =>
                ['APPROVED', 'PARTIALLY_ISSUED'].includes(r.status)
            ) || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data');
        } finally { setLoading(false); }
    };

    const handleRequestChange = async (requestId) => {
        if (!requestId) {
            setSelectedRequest(null);
            setFormData({ ...formData, requestId: '', lines: [] });
            return;
        }

        const req = requests.find(r => r._id === requestId);
        setSelectedRequest(req);

        try {
            // Fetch detailed request with lines
            const detailRes = await api.get(`/requests/${requestId}`);
            const detailLines = detailRes.data.lines || [];

            // For each item, fetch available stock lots
            const linesWithLots = await Promise.all(detailLines.map(async (l) => {
                const itemId = l.itemId._id || l.itemId;
                const lotRes = await api.get('/stock/lots', {
                    params: { storeId: req.storeId, itemId }
                });

                const lots = lotRes.data.lots || [];
                const bestLot = lots[0]; // Pick oldest available lot (FIFO)

                return {
                    requestLineId: l._id,
                    itemId: itemId,
                    itemName: l.itemId.name || 'Unknown Item',
                    qtyRequested: l.qtyRequested,
                    qtyApproved: l.qtyApproved,
                    qtyRemaining: Math.max(0, (l.qtyApproved || 0) - (l.qtyIssued || 0)),
                    qtyIssued: Math.max(0, (l.qtyApproved || 0) - (l.qtyIssued || 0)), // Default to full remaining
                    stockLotId: bestLot?._id || '',
                    lotBalance: bestLot?.qtyBalance || 0,
                    availableLots: lots
                };
            }));

            setFormData({
                ...formData,
                requestId,
                storeId: req.storeId,
                departmentId: req.departmentId,
                lines: linesWithLots
            });
        } catch (err) {
            console.error(err);
            setError('Failed to load request details or stock lots');
        }
    };

    const handleQtyChange = (index, value) => {
        const lines = [...formData.lines];
        const qty = Number(value);

        // Ensure not exceeding lot balance or remaining approved qty
        lines[index].qtyIssued = qty;
        setFormData({ ...formData, lines });
    };

    const handleLotChange = (index, lotId) => {
        const lines = [...formData.lines];
        const selectedLot = lines[index].availableLots.find(lot => lot._id === lotId);
        lines[index].stockLotId = lotId;
        lines[index].lotBalance = selectedLot?.qtyBalance || 0;
        setFormData({ ...formData, lines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Map qtyIssued to qty for backend
            const submissionData = {
                ...formData,
                lines: formData.lines.map(l => ({
                    requestLineId: l.requestLineId,
                    itemId: l.itemId,
                    stockLotId: l.stockLotId,
                    qty: l.qtyIssued
                })).filter(l => l.qty > 0)
            };

            await api.post('/issues', submissionData);
            setIsModalOpen(false);
            setFormData({ requestId: '', date: new Date().toISOString().split('T')[0], notes: '', lines: [] });
            setSelectedRequest(null);
            fetchData();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to process issue');
        }
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
                                    <td>
                                        <div className="text-sm font-medium">{issue.requestId?.requestNo || '-'}</div>
                                        <div className="text-[10px] text-dim">{issue.departmentId?.name || '-'}</div>
                                    </td>
                                    <td>{issue.issuedBy?.name || 'System'}</td>
                                    <td className="font-semibold">{issue.lines?.length || 0} Items</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="glass-modal-overlay">
                    <div className="glass-card glass-modal-card scale-in-center max-w-3xl overflow-y-auto max-h-[90vh]">
                        <div className="modal-vibrant-header">
                            <h2>Process Stock Issue</h2>
                            <button className="close-vibrant-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="vibrant-form-group">
                                    <label className="vibrant-label">Select Pending Request</label>
                                    <select className="vibrant-input" value={formData.requestId} onChange={(e) => handleRequestChange(e.target.value)} required>
                                        <option value="">Select Request No</option>
                                        {requests.map(r => <option key={r._id} value={r._id}>{r.requestNo} ({r.departmentId?.name})</option>)}
                                    </select>
                                </div>
                                <div className="vibrant-form-group">
                                    <label className="vibrant-label">Issue Date</label>
                                    <input type="date" className="vibrant-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                            </div>

                            {selectedRequest && (
                                <div className="mt-6">
                                    <h3 className="mb-6 text-orange-400 font-bold flex items-center gap-3"><PackageCheck size={22} /> Allocation Details</h3>
                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                                        {formData.lines.map((line, index) => (
                                            <div key={index} className="flex flex-col gap-4 mb-8 last:mb-0 slide-in-bottom border-b border-slate-100 pb-6 last:border-0">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm font-bold text-slate-800">{line.itemName}</div>
                                                    <div className="text-[10px] px-3 py-1 bg-orange-100 text-orange-600 rounded-full font-bold uppercase tracking-wider">
                                                        Remaining: {line.qtyRemaining}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="vibrant-form-group mb-0">
                                                        <label className="text-[10px] text-dim uppercase mb-1 block">Stock Lot (FIFO)</label>
                                                        <select
                                                            className="vibrant-input py-2 text-sm"
                                                            value={line.stockLotId}
                                                            onChange={(e) => handleLotChange(index, e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select Lot</option>
                                                            {line.availableLots.map(lot => (
                                                                <option key={lot._id} value={lot._id}>
                                                                    {lot.grnNo} (Bal: {lot.qtyBalance})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="vibrant-form-group mb-0">
                                                        <label className="text-[10px] text-dim uppercase mb-1 block">Lot Balance</label>
                                                        <div className="vibrant-input py-2 text-sm bg-slate-50 text-center font-bold">
                                                            {line.lotBalance}
                                                        </div>
                                                    </div>

                                                    <div className="vibrant-form-group mb-0">
                                                        <label className="text-[10px] text-orange-400 uppercase mb-1 block">Issuing Now</label>
                                                        <input
                                                            type="number"
                                                            className="vibrant-input py-2 text-sm text-center font-bold"
                                                            value={line.qtyIssued}
                                                            onChange={(e) => handleQtyChange(index, e.target.value)}
                                                            max={Math.min(line.qtyRemaining, line.lotBalance)}
                                                            min="0"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="vibrant-form-group mt-8">
                                <label className="vibrant-label">Internal Notes</label>
                                <textarea className="vibrant-input" rows="2" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add any relevant tracking notes..."></textarea>
                            </div>

                            <div className="vibrant-modal-actions mt-10">
                                <button type="button" className="btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary flex-1" style={{ justifyContent: 'center' }} disabled={!selectedRequest}>Complete Issue</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Issues;
