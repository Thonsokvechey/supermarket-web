import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Boxes,
  Truck,
  ShoppingCart,
  Store,
  Landmark,
  BarChart3,
  LogOut,
  LogIn,
  RefreshCw,
  Building2,
  Coins,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../services/apiClient';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/pos', label: 'POS Terminal', icon: Store },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/purchasing', label: 'Purchasing', icon: ShoppingCart },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/finance', label: 'Finance & Branches', icon: Landmark },
  { to: '/auth-management', label: 'Users & Roles', icon: ShieldCheck },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export const MainLayout: React.FC = () => {
  const {
    user,
    branches,
    activeBranch,
    setActiveBranch,
    usdToKhrRate,
    backendOnline,
    logout,
    refreshFinanceContext,
  } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-xs">
            S
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white leading-tight">
              SuperMarket
            </div>
            <div className="text-xs text-slate-400">ERP & POS System</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              {backendOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              Backend API
            </span>
            <button
              type="button"
              onClick={refreshFinanceContext}
              title={`Connected to ${API_BASE_URL} - Click to refresh`}
              className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                backendOnline
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              <span>{backendOnline ? 'Online :7777' : 'Offline'}</span>
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {user ? (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-400 truncate">
                  {user.roles?.length ? Array.from(user.roles).join(', ') : 'Authenticated'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Account</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-500">Branch:</span>
              {branches.length > 0 ? (
                <select
                  value={activeBranch?.id || ''}
                  onChange={(e) => {
                    const found = branches.find((b) => b.id === e.target.value);
                    if (found) setActiveBranch(found);
                  }}
                  className="bg-transparent font-semibold text-slate-900 focus:outline-none text-xs cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id || b.code} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-semibold text-slate-800">Main Branch (MAIN)</span>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>1 USD = {usdToKhrRate.toLocaleString()} ៛ (KHR)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              API: <code className="text-slate-700 font-mono">{API_BASE_URL}</code>
            </span>
            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                  {user.username}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

