import { useEffect, useState } from 'react';
import api, { extractErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const ROLES = ['APPLICANT', 'EMPLOYER', 'ADMIN'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  function load() {
    setLoading(true);
    setError('');
    api.get('/users')
      .then(({ data }) => setUsers(Array.isArray(data) ? data : data.content || []))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRoleChange(userId, role) {
    setSavingId(userId);
    setError('');
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? data : u)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(userId) {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    setSavingId(userId);
    setError('');
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">Manage users</h1>
            <p className="mt-1 text-sm text-slate-500">Review account roles and admin access for platform users.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
            Protected module
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        {loading ? (
          <LoadingSpinner label="Loading users…" />
        ) : users.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No users found" message="The backend has not returned any users yet." />
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((user) => {
                  const isSelf = currentUser && currentUser.id === user.id;
                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{user.fullName || 'Unnamed user'}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={savingId === user.id || isSelf}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 disabled:opacity-60"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={savingId === user.id || isSelf}
                          onClick={() => handleDelete(user.id)}
                          title={isSelf ? "You can't delete your own account" : 'Delete user'}
                          className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
