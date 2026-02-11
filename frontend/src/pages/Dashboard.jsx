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
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="page-title">Dashboard</h1>
                <div className="user-profile">
                    <span className="user-name">Welcome, Admin</span>
                    <div className="user-avatar">A</div>
                </div>
            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card glass-card">
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

            <div className="recent-activity glass-card">
                <h2 className="section-title">Recent Activity</h2>
                <ul className="activity-list">
                    <li className="activity-item">
                        <span className="activity-dot orange"></span>
                        <div className="activity-content">
                            <p className="activity-text">New order received from <strong>Store A</strong></p>
                            <span className="activity-time">2 mins ago</span>
                        </div>
                    </li>
                    <li className="activity-item">
                        <span className="activity-dot blue"></span>
                        <div className="activity-content">
                            <p className="activity-text">Stock updated for <strong>Item XYZ</strong></p>
                            <span className="activity-time">1 hour ago</span>
                        </div>
                    </li>
                    <li className="activity-item">
                        <span className="activity-dot green"></span>
                        <div className="activity-content">
                            <p className="activity-text">New user registered</p>
                            <span className="activity-time">3 hours ago</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
