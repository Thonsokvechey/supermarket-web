import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, UserPlus, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { extractErrorMessage } from '../../utils/formatters';
import { API_BASE_URL } from '../../services/apiClient';

export const LoginPage: React.FC = () => {
  const { login, backendOnline } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Quick Bootstrap Admin Account state (for fresh database)
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [newUsername, setNewUsername] = useState('admin');
  const [newEmail, setNewEmail] = useState('admin@supermarket.kh');
  const [newPassword, setNewPassword] = useState('admin123');
  const [bootstrapMsg, setBootstrapMsg] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ usernameOrEmail, password });
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBootstrapAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBootstrapMsg(null);
    setBootstrapping(true);
    try {
      // Ensure ADMIN role exists or ignore if already exists
      try {
        await authService.createRole({
          name: 'ADMIN',
          description: 'System Administrator with full access',
          permissionKeys: [
            'USER_READ',
            'USER_WRITE',
            'ROLE_MANAGE',
            'BRANCH_MANAGE',
            'FINANCE_MANAGE',
            'POS_ACCESS',
            'INVENTORY_MANAGE',
          ],
        });
      } catch {
        // Role might already exist
      }

      await authService.createUser({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        isActive: true,
        roleNames: ['ADMIN'],
      });

      setUsernameOrEmail(newUsername);
      setPassword(newPassword);
      setBootstrapMsg(`Admin account "${newUsername}" created on backend! You can now sign in.`);
      setShowBootstrap(false);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create admin user.'));
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-950 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xl flex items-center justify-center">
                S
              </div>
              <div>
                <h1 className="text-lg font-bold">SuperMarket ERP</h1>
                <p className="text-xs text-slate-400">Sign in to your account</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                backendOnline
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {backendOnline ? 'API Connected' : 'API Offline'}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {bootstrapMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{bootstrapMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin or admin@supermarket.kh"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowBootstrap((v) => !v)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showBootstrap ? 'Hide Admin Setup' : 'First time? Create Admin Account'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Continue to Dashboard →
              </button>
            </div>

            {showBootstrap && (
              <form
                onSubmit={handleBootstrapAdmin}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <p className="text-xs text-slate-600">
                  Creates an <strong>ADMIN</strong> role and user via{' '}
                  <code className="text-slate-800">POST {API_BASE_URL}/users</code>:
                </p>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <button
                  type="submit"
                  disabled={bootstrapping}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  {bootstrapping ? 'Creating on Backend...' : 'Create Admin User on Backend'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

