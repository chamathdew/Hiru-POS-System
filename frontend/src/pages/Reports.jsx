import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, PieChart, BarChart3, Filter, Calendar } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [stores, setStores] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [items, setItems] = useState([]);

    const [filters, setFilters] = useState({
        storeId: user?.storeId || '',
        departmentId: '',
        from: '',
        to: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const params = user?.storeId ? { storeId: user.storeId } : {};
            const [storeRes, deptRes, itemRes] = await Promise.all([
                api.get('/stores'),
                api.get('/departments', { params }),
                api.get('/items')
            ]);
            setStores(storeRes.data.stores || []);
            setDepartments(deptRes.data.departments || []);
            setItems(itemRes.data.items || []);

            if (user?.storeId) {
                setFilters(prev => ({ ...prev, storeId: user.storeId }));
            }
        } catch (err) {
            console.error('Failed to fetch filter data', err);
        }
    };

    const generateReport = async () => {
        if (!filters.storeId) {
            alert('Please select a store first');
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/reports/department-consumption', { params: filters });
            setReportData(res.data.data || []);
        } catch (err) {
            alert('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const columns = [
            { header: 'Item Name', key: 'itemName' },
            { header: 'GRN No', key: 'grnNo' },
            { header: 'Quantity', key: 'qty' },
            { header: 'Value (LKR)', key: 'value' }
        ];

        exportToPDF('Department Consumption Report', columns, reportData, 'consumption_report.pdf');
    };

    const handleExportExcel = () => {
        const dataToExport = reportData.map(r => ({
            Item: r.itemName,
            'GRN No': r.grnNo,
            Quantity: r.qty,
            'Value (LKR)': r.value
        }));
        exportToExcel(dataToExport, 'consumption_report.xlsx');
    };

    return (
        <div className="fade-in">
            <header className="flex-between-vibrant" style={{ marginBottom: '3rem' }}>
                <div>
                    <h1 className="page-title">Intelligence & Reports</h1>
                    <p className="page-subtitle">Analyze operational data and generate compliance documents</p>
                </div>
            </header>

            <div className="glass-card mb-8 p-8">
                <div className="flex items-center gap-3 mb-6 text-orange-400 font-bold text-lg">
                    <Filter size={22} /> Report Configuration
                </div>
                <div className="grid grid-cols-4 gap-6">
                    <div className="vibrant-form-group mb-0">
                        <label className="vibrant-label">Store</label>
                        <select
                            className="vibrant-input"
                            value={filters.storeId}
                            onChange={(e) => setFilters({ ...filters, storeId: e.target.value })}
                        >
                            <option value="">Select Store</option>
                            {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="vibrant-form-group mb-0">
                        <label className="vibrant-label">Department</label>
                        <select
                            className="vibrant-input"
                            value={filters.departmentId}
                            onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="vibrant-form-group mb-0">
                        <label className="vibrant-label">From Date</label>
                        <input
                            type="date"
                            className="vibrant-input"
                            value={filters.from}
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                        />
                    </div>
                    <div className="vibrant-form-group mb-0">
                        <label className="vibrant-label">To Date</label>
                        <input
                            type="date"
                            className="vibrant-input"
                            value={filters.to}
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                        />
                    </div>
                </div>
                <button
                    className="btn-primary mt-8 w-full"
                    onClick={generateReport}
                    disabled={loading}
                    style={{ justifyContent: 'center' }}
                >
                    {loading ? 'Processing...' : 'Generate Consumption Report'}
                </button>
            </div>

            {reportData.length > 0 && (
                <div className="glass-card fade-in overflow-hidden">
                    <div className="p-8 border-bottom border-white/5 flex-between-vibrant">
                        <div className="flex items-center gap-3">
                            <FileText className="text-orange-400" />
                            <h2 className="text-xl font-bold">Report Results</h2>
                        </div>
                        <div className="flex gap-4">
                            <button className="btn-secondary" onClick={handleExportExcel}>
                                <Download size={18} /> Excel
                            </button>
                            <button className="btn-primary" onClick={handleExportPDF}>
                                <Download size={18} /> PDF
                            </button>
                        </div>
                    </div>
                    <div className="table-vibrant-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>GRN Reference</th>
                                    <th>Quantity Used</th>
                                    <th>Value (LKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="font-bold underline text-orange-400">
                                            {row.itemName}
                                        </td>
                                        <td>{row.grnNo}</td>
                                        <td>{row.qty}</td>
                                        <td className="font-bold text-white">Rs. {row.value.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && reportData.length === 0 && (
                <div className="glass-card p-20 text-center">
                    <PieChart size={60} className="mx-auto mb-6 text-white/10" />
                    <h2 className="text-2xl font-bold mb-2">No Report Data</h2>
                    <p className="text-dim text-lg">Configure the filters above and click generate to see analytics.</p>
                </div>
            )}
        </div>
    );
};

export default Reports;
