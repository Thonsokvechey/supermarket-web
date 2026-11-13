import React, { useCallback, useEffect, useState } from 'react';
import {
  UserPlus,
  ShieldPlus,
  RefreshCw,
  Edit3,
  KeyRound,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { authService } from '../../services/authService';
import type { RoleResponse, UserResponse } from '../../types';
import { extractErrorMessage, formatDateTime, isUserActive } from '../../utils/formatters';

export const AuthManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userActive, setUserActive] = useState(true);
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);
  const [savingUser, setSavingUser] = useState(false);

  // Role Modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [rolePermissionsInput, setRolePermissionsInput] = useState(
    'USER_READ, USER_WRITE, POS_ACCESS, INVENTORY_MANAGE'
  );
  const [savingRole, setSavingRole] = useState(false);

  // Permission Update Modal state
  const [permModalRole, setPermModalRole] = useState<RoleResponse | null>(null);
  const [permKeysInput, setPermKeysInput] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [uList, rList] = await Promise.all([
        authService.getAllUsers(),
        authService.getAllRoles(),
      ]);
      setUsers(uList);
      setRoles(rList);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load users and roles from backend'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openCreateUser = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setUserActive(true);
    setSelectedRoleNames([]);
    setUserModalOpen(true);
  };

  const openEditUser = (u: UserResponse) => {
    setEditingUser(u);
    setUsername(u.username);
    setEmail(u.email || '');
    setPassword('');
    setUserActive(isUserActive(u));
    setSelectedRoleNames(Array.from(u.roles || []));
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    setError(null);
    try {
      if (editingUser) {
        await authService.updateUser(editingUser.id, {
          username,
          email,
          password: password.trim() ? password : undefined,
          isActive: userActive,
          roleNames: selectedRoleNames,
        });
      } else {
        await authService.createUser({
          username,
          email: email.trim() || undefined,
          password,
          isActive: userActive,
          roleNames: selectedRoleNames,
        });
      }
      setUserModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save user'));
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRole(true);
    setError(null);
    try {
      const keys = rolePermissionsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      await authService.createRole({
        name: roleName,
        description: roleDesc,
        permissionKeys: keys,
      });
      setRoleModalOpen(false);
      setRoleName('');
      setRoleDesc('');
      await fetchAll();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create role'));
    } finally {
      setSavingRole(false);
    }
  };

  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permModalRole) return;
    setSavingRole(true);
    setError(null);
    try {
      const keys = permKeysInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      await authService.assignPermissions(permModalRole.id, {
        permissionKeys: keys,
      });
      setPermModalRole(null);
      await fetchAll();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to assign permissions'));
    } finally {
      setSavingRole(false);
    }
  };

  const toggleRoleSelection = (name: string) => {
    setSelectedRoleNames((prev) =>
      prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users, Roles & Permissions"
        subtitle="Connected directly to Spring Boot /users and /roles endpoints"
        actions={
          <>
            <button
              type="button"
              onClick={fetchAll}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <ShieldPlus className="w-3.5 h-3.5" />
              <span>New Role</span>
            </button>
            <button
              type="button"
              onClick={openCreateUser}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New User</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">System Users ({users.length})</h2>
          <span className="text-xs text-slate-500">GET / POST / PUT /users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Roles</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {loading ? 'Loading users from backend...' : 'No users found. Create your first user!'}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const active = isUserActive(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-semibold text-slate-900">{u.username}</td>
                      <td className="py-3 px-4 text-slate-600">{u.email || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {active ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles && u.roles.length > 0 ? (
                            Array.from(u.roles).map((r) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">No roles</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {formatDateTime(u.lastLoginAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditUser(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles & Permissions Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Roles & Permissions ({roles.length})</h2>
          <span className="text-xs text-slate-500">GET / POST /roles & PUT /roles/:id/permissions</span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.length === 0 ? (
            <div className="col-span-full text-center py-6 text-slate-400 text-sm">
              No roles configured yet. Click "New Role" to create one.
            </div>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900">{role.name}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setPermModalRole(role);
                        setPermKeysInput(
                          role.permissions?.map((p) => p.permissionKey).join(', ') || ''
                        );
                      }}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Permissions</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {role.description || 'No description'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((perm) => (
                        <span
                          key={perm.id}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-mono"
                        >
                          {perm.permissionKey}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.username}` : 'Create New User'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {editingUser ? 'New Password (leave blank to keep current)' : 'Password (min 6 chars) *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign Roles</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => {
                const checked = selectedRoleNames.includes(r.name);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRoleSelection(r.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      checked
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {r.name}
                  </button>
                );
              })}
              {roles.length === 0 && (
                <span className="text-xs text-slate-400">
                  No roles available yet. Create a role first.
                </span>
              )}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={userActive}
              onChange={(e) => setUserActive(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Account is Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingUser}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              {savingUser ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Create New Role"
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. ADMIN, CASHIER, MANAGER"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="Role responsibilities"
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Permission Keys (comma-separated)
            </label>
            <textarea
              rows={3}
              value={rolePermissionsInput}
              onChange={(e) => setRolePermissionsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRoleModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingRole}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              {savingRole ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Permissions Modal */}
      <Modal
        isOpen={Boolean(permModalRole)}
        onClose={() => setPermModalRole(null)}
        title={`Permissions for ${permModalRole?.name || ''}`}
      >
        <form onSubmit={handleUpdatePermissions} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Permission Keys (comma-separated)
            </label>
            <textarea
              rows={4}
              value={permKeysInput}
              onChange={(e) => setPermKeysInput(e.target.value)}
              placeholder="USER_READ, USER_WRITE, POS_ACCESS, FINANCE_MANAGE"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPermModalRole(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingRole}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              {savingRole ? 'Updating...' : 'Save Permissions'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

