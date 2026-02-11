import { Store, Package, Users, ShoppingCart } from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const stats = [
        { label: 'Total Stores', value: '12', icon: Store, color: 'orange' },
        { label: 'Active Items', value: '850', icon: Package, color: 'blue' },
        { label: 'Suppliers', value: '45', icon: Users, color: 'green' },
        { label: 'Sales Orders', value: '2.5k', icon: ShoppingCart, color: 'red' },
    ];

    return (
        <div className="fade-in">
            <header className="flex-between-vibrant" style={{ marginBottom: '3.5rem' }}>
                <div>
                    <h1 className="page-title">Executive Overview</h1>
                    <p className="page-subtitle">Monitoring real-time operational performance</p>
                </div>
                <div className="top-bar-user">
                    <div className="avatar-vibrant">AD</div>
                    <div>
                        <p style={{ fontSize: '1rem', fontWeight: 700 }}>System Admin</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Administrator</p>
                    </div>
                </div>
            </header>

            <div className="vibrant-metrics">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="glass-card stat-vibrant-card">
                            <div className={`icon-box-vibrant ${stat.color}`}>
                                <Icon size={28} />
                            </div>
                            <div>
                                <h3 className="stat-label-vibrant">{stat.label}</h3>
                                <p className="stat-value-vibrant">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="glass-card activity-glass-panel">
                <h2 className="activity-header-vibrant">
                    <Package size={26} className="text-orange" />
                    Operational Activity Stream
                </h2>
                <div className="activity-stream">
                    <div className="activity-row">
                        <span className="activity-glow-dot orange"></span>
                        <div className="activity-info">
                            <p className="activity-desc">Inventory Update: <strong>New materials received at Main Store</strong></p>
                            <span className="activity-ts">System Log • Just Now</span>
                        </div>
                    </div>
                    <div className="activity-row">
                        <span className="activity-glow-dot blue"></span>
                        <div className="activity-info">
                            <p className="activity-desc">Supplier Connect: <strong>Price negotiation completed with Batch 401</strong></p>
                            <span className="activity-ts">Logistics • 24 minutes ago</span>
                        </div>
                    </div>
                    <div className="activity-row">
                        <span className="activity-glow-dot green"></span>
                        <div className="activity-info">
                            <p className="activity-desc">Internal Transfer: <strong>Requested hardware moved to Construction Dept.</strong></p>
                            <span className="activity-ts">Operations • 2 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
