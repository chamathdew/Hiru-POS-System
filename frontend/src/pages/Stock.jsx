import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, Search, TrendingDown, Package, Database } from 'lucide-react';

const Stock = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => { fetchStock(); }, []);

    const fetchStock = async () => {
        try {
            const response = await api.get('/stock');
            setStock(response.data.stock || []);
        } catch (err) { setError('Failed to fetch stock data'); } finally { setLoading(false); }
    };

    const filteredStock = stock.filter(s =>
        s.itemId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.storeId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (qty) => {
        if (qty <= 0) return <span className="badge badge-danger">Out of Stock</span>;
        if (qty < 10) return <span className="badge badge-warning">Low Stock</span>;
        return <span className="badge badge-success">In Stock</span>;
    };

    return (
        <div className="page-container fade-in">
            <div className="flex-between mb-8">
                <div>
                    <h1 className="page-title">Inventory & Stock Levels</h1>
                    <p className="page-subtitle">Real-time monitoring across all stores</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" size={18} />
                        <input type="text" className="input-glass pl-10 w-64" placeholder="Search items or stores..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="stats-grid grid-cols-3 mb-8">
                <div className="stat-card glass-card">
                    <div className="stat-icon-wrapper orange"><Package size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Unique Items</span>
                        <span className="stat-value">{new Set(stock.map(s => s.itemId?._id)).size}</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon-wrapper blue"><Database size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Qty on Hand</span>
                        <span className="stat-value">{stock.reduce((acc, s) => acc + s.qty, 0).toLocaleString()}</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon-wrapper red"><TrendingDown size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Low Stock Alerts</span>
                        <span className="stat-value">{stock.filter(s => s.qty < 10).length}</span>
                    </div>
                </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {loading ? <div className="loading-state">Syncing inventory...</div> : (
                <div className="table-container glass-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Store Location</th>
                                <th>Qty on Hand</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStock.map(s => (
                                <tr key={s._id}>
                                    <td className="font-mono text-xs text-orange-400">{s.itemId?.code || '-'}</td>
                                    <td className="font-bold text-white">{s.itemId?.name || 'Unknown Item'}</td>
                                    <td className="text-dim">{s.storeId?.name || 'General Store'}</td>
                                    <td className="font-bold text-xl">{s.qty.toLocaleString()}</td>
                                    <td>{getStatusBadge(s.qty)}</td>
                                    <td className="text-xs text-dim">{new Date(s.updatedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {filteredStock.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="empty-state">No inventory records found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Stock;
