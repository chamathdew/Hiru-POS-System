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
        <div className="page-container fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Analytics Overview</h1>
                    <p className="page-subtitle">Real-time performance metrics</p>
                </div>
                <div className="user-profile">
                    <span className="hidden-mobile" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Welcome, Admin</span>
                    <div className="user-avatar">AD</div>
                </div>
            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card glass-panel-hover">
                            <div className={`stat-icon-wrapper ${stat.color}`}>
                                <Icon size={24} />
                            </div>
                            <div className="stat-info">
                                <h3 className="stat-label">{stat.label}</h3>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="recent-activity">
                <h2 className="section-title">
                    <Package size={20} className="text-orange" />
                    Recent System Logs
                </h2>
                <ul className="activity-list">
                    <li className="activity-item">
                        <span className="activity-dot orange"></span>
                        <div className="activity-content">
                            <p className="activity-text">Inventory Stock-In: <strong>New items received at Colombo Store</strong></p>
                            <span className="activity-time">Just Now</span>
                        </div>
                    </li>
                    <li className="activity-item">
                        <span className="activity-dot blue"></span>
                        <div className="activity-content">
                            <p className="activity-text">Supplies: <strong>Updated pricing for 'Item Batch #401'</strong></p>
                            <span className="activity-time">24 minutes ago</span>
                        </div>
                    </li>
                    <li className="activity-item">
                        <span className="activity-dot green"></span>
                        <div className="activity-content">
                            <p className="activity-text">Department Transfer: <strong>Hardware items moved to Storage</strong></p>
                            <span className="activity-time">2 hours ago</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
