import { BarChart, DollarSign, Package, Users } from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const stats = [
        { label: 'Total Sales', value: 'Rs. 1,234,567', icon: DollarSign, color: 'orange' },
        { label: 'Active Orders', value: '45', icon: Package, color: 'blue' },
        { label: 'Total Customers', value: '1,234', icon: Users, color: 'green' },
        { label: 'Pending Requests', value: '12', icon: BarChart, color: 'red' },
    ];

    return (
        <div className="fade-up">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Overview</h1>
                    <p className="page-subtitle">Real-time business performance snapshot</p>
                </div>
                <div className="profile-chip">
                    <span className="hide-on-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Administrator</span>
                    <div className="profile-icon">AD</div>
                </div>
            </header>

            <div className="metrics-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="metric-card">
                            <div className="metric-head">
                                <div className={`metric-icon-box ${stat.color}`}>
                                    <Icon size={18} />
                                </div>
                                <span className="metric-label">{stat.label}</span>
                            </div>
                            <p className="metric-value">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="activity-panel">
                <h2 className="log-title">
                    <Package size={18} />
                    Live Activity Stream
                </h2>
                <div className="log-list">
                    <div className="log-item">
                        <span className="log-dot orange"></span>
                        <div className="log-info">
                            <p className="log-text">New stock entry received at <strong>Colombo Branch</strong></p>
                            <span className="log-time">Just Now</span>
                        </div>
                    </div>
                    <div className="log-item">
                        <span className="log-dot blue"></span>
                        <div className="log-info">
                            <p className="log-text">Price adjustment made for <strong>Cement 50kg</strong></p>
                            <span className="log-time">24 mins ago</span>
                        </div>
                    </div>
                    <div className="log-item">
                        <span className="log-dot green"></span>
                        <div className="log-info">
                            <p className="log-text">Inventory transfer: <strong>Department A to Main Store</strong></p>
                            <span className="log-time">2 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
