import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Search, TrendingDown, Package, Database } from 'lucide-react';

const Stock = () => {
    const { user } = useAuth();
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => { fetchStock(); }, []);

    const fetchStock = async () => {
        try {
            const params = user?.storeId ? { storeId: user.storeId } : {};
            const response = await api.get('/stock', { params });
            setStock(response.data.stock || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch stock data');
        } finally { setLoading(false); }
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
            <header className="flex-between-vibrant mb-8">
                <div>
                    <h1 className="page-title">Inventory Intelligence</h1>
                    <p className="page-subtitle">Real-time stock monitoring across all enterprise stores</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/50" size={20} />
                        <input
                            type="text"
                            className="vibrant-input pl-12 w-80"
                            placeholder="Search SKU or Store..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="vibrant-metrics">
                <div className="glass-card stat-vibrant-card">
                    <div className="icon-box-vibrant orange"><Package size={28} /></div>
                    <div>
                        <h3 className="stat-label-vibrant">Total Unique Items</h3>
                        <p className="stat-value-vibrant">{new Set(stock.map(s => s.itemId?._id)).size}</p>
                    </div>
                </div>
                <div className="glass-card stat-vibrant-card">
                    <div className="icon-box-vibrant blue"><Database size={28} /></div>
                    <div>
                        <h3 className="stat-label-vibrant">Total Qty on Hand</h3>
                        <p className="stat-value-vibrant">{stock.reduce((acc, s) => acc + s.qty, 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="glass-card stat-vibrant-card">
                    <div className="icon-box-vibrant red"><TrendingDown size={28} /></div>
                    <div>
                        <h3 className="stat-label-vibrant">Low Stock Alerts</h3>
                        <p className="stat-value-vibrant">{stock.filter(s => s.qty < 10).length}</p>
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
                                    <td className="font-semibold">{s.itemId?.name || 'Unknown Item'}</td>
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
