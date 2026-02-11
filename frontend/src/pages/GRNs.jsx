import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, X, FileText, Truck } from 'lucide-react';

const GRNs = () => {
    const [grns, setGrns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

    const [stores, setStores] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);

    const [formData, setFormData] = useState({
        storeId: '',
        supplierId: '',
        date: new Date().toISOString().split('T')[0],
        vendorInvoiceNo: '',
        lines: [{ itemId: '', qty: 0, unitCost: 0 }]
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [grnRes, storeRes, supplierRes, itemRes] = await Promise.all([
                api.get('/grns'), api.get('/stores'), api.get('/suppliers'), api.get('/items')
            ]);
            setGrns(grnRes.data.grns || []);
            setStores(storeRes.data.stores || []);
            setSuppliers(supplierRes.data.suppliers || []);
            setItems(itemRes.data.items || []);
        } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
    };

    const addLine = () => setFormData({ ...formData, lines: [...formData.lines, { itemId: '', qty: 0, unitCost: 0 }] });
    const removeLine = (index) => {
        const lines = [...formData.lines];
        lines.splice(index, 1);
        setFormData({ ...formData, lines });
    };

    const handleLineChange = (index, field, value) => {
        const lines = [...formData.lines];
        lines[index][field] = value;
        setFormData({ ...formData, lines });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/grns', formData);
            setIsModalOpen(false);
            setFormData({ storeId: '', supplierId: '', date: new Date().toISOString().split('T')[0], vendorInvoiceNo: '', lines: [{ itemId: '', qty: 0, unitCost: 0 }] });
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to create GRN'); }
    };

    return (
        <div className="page-container fade-in">
            <div className="flex-between mb-6">
                <div>
                    <h1 className="page-title">Goods Received Notes</h1>
                    <p className="page-subtitle">Record and track inventory arrivals from suppliers</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> New GRN
                </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? <div className="loading-state">Loading GRNs...</div> : (
                <div className="table-container glass-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>GRN No</th>
                                <th>Date</th>
                                <th>Store</th>
                                <th>Supplier</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grns.map(grn => (
                                <tr key={grn._id}>
                                    <td className="font-bold text-orange-400">{grn.grnNo}</td>
                                    <td>{new Date(grn.date).toLocaleDateString()}</td>
                                    <td>{grn.storeId?.name || '-'}</td>
                                    <td>{grn.supplierId?.name || grn.vendorInvoiceNo || '-'}</td>
                                    <td className="font-bold text-white">Rs. {grn.totals?.grandTotal?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card scale-in-center overflow-y-auto max-h-[90vh]">
                        <div className="modal-header">
                            <h2>Create New GRN</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Target Store</label>
                                    <select className="input-glass" value={formData.storeId} onChange={(e) => setFormData({ ...formData, storeId: e.target.value })} required>
                                        <option value="">Select Store</option>
                                        {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Supplier</label>
                                    <select className="input-glass" value={formData.supplierId} onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })} required>
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Received Date</label>
                                    <input type="date" className="input-glass" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Invoice Ref</label>
                                    <input type="text" className="input-glass" value={formData.vendorInvoiceNo} onChange={(e) => setFormData({ ...formData, vendorInvoiceNo: e.target.value })} placeholder="Optional" />
                                </div>
                            </div>

                            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="mb-4 text-orange-400 font-bold flex items-center gap-2"><Truck size={18} /> Items Received</h3>
                                {formData.lines.map((line, index) => (
                                    <div key={index} className="flex gap-2 mb-3 items-end">
                                        <div className="flex-1">
                                            <select className="input-glass" value={line.itemId} onChange={(e) => handleLineChange(index, 'itemId', e.target.value)} required>
                                                <option value="">Select Item</option>
                                                {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <input type="number" className="input-glass" placeholder="Qty" value={line.qty} onChange={(e) => handleLineChange(index, 'qty', e.target.value)} required />
                                        </div>
                                        <div className="w-32">
                                            <input type="number" className="input-glass" placeholder="Cost" value={line.unitCost} onChange={(e) => handleLineChange(index, 'unitCost', e.target.value)} required />
                                        </div>
                                        <button type="button" className="action-btn delete p-2" onClick={() => removeLine(index)} disabled={formData.lines.length === 1}><X size={16} /></button>
                                    </div>
                                ))}
                                <button type="button" className="text-orange-400 text-sm font-bold p-2 hover:bg-white/5 rounded-lg" onClick={addLine}>+ Add Item Line</button>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary w-full" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary w-full">Finalize GRN</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GRNs;
