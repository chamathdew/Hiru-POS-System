import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Store,
    Building2,
    Users,
    Package,
    FileText,
    Send,
    ClipboardList,
    BarChart,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/stores', label: 'Stores', icon: Store },
        { path: '/departments', label: 'Departments', icon: Building2 },
        { path: '/suppliers', label: 'Suppliers', icon: Users },
        { path: '/items', label: 'Items', icon: Package },
        { path: '/grns', label: 'GRNs', icon: FileText },
        { path: '/requests', label: 'Requests', icon: Send },
        { path: '/issues', label: 'Issues', icon: ClipboardList },
        { path: '/stock', label: 'Stock', icon: BarChart },
        { path: '/reports', label: 'Reports', icon: FileText },
    ];

    return (
        <div className="sidebar-container glass-card">
            <div className="sidebar-header">
                <img src={logo} alt="Hiru Logo" className="sidebar-logo-img" />
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={logout}>
                    <LogOut size={24} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
