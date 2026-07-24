import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/api";

const emptyForm = { username: "", password: "", roleId: "" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, rolesRes] = await Promise.all([api.get("/Users"), api.get("/Roles")]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      setError(err.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingId(u.userId || u.userID);
    setForm({ username: u.username || "", password: "", roleId: u.roleId ?? u.roleID ?? "" });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.username.trim() || !form.roleId) {
      toast.error("Username and role are required.");
      return false;
    }
    if (!editingId && !form.password.trim()) {
      toast.error("Password is required for a new user.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const payload = {
      username: form.username,
      roleId: Number(form.roleId),
      ...(form.password ? { password: form.password } : {}),
    };

    try {
      if (editingId) {
        await api.put(`/Users/${editingId}`, { ...payload, userId: editingId });
        toast.success("User updated");
      } else {
        await api.post("/Users", payload);
        toast.success("User added");
      }
      setShowModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.message || "Could not save user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/Users/${id}`);
      toast.success("User deleted");
      loadAll();
    } catch (err) {
      toast.error(err.message || "Could not delete user.");
    }
  };

  const getRoleName = (roleId) =>
    roles.find((r) => String(r.roleId || r.roleID) === String(roleId))?.roleName || "-";

  const filtered = users.filter((u) => u.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Users">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 justify-center">
          <FiPlus /> Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No users found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Username</th>
                <th className="table-header">Role</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const id = u.userId || u.userID;
                return (
                  <tr key={id}>
                    <td className="table-cell font-medium text-slate-800">{u.username}</td>
                    <td className="table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                        {getRoleName(u.roleId ?? u.roleID)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(u)} className="text-blue-600 hover:text-blue-800">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(id)} className="text-red-500 hover:text-red-700">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit User" : "Add User"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. mohamed_sales"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password {editingId && <span className="text-xs text-gray-400">(leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
              <select name="roleId" value={form.roleId} onChange={handleChange} className="input-field">
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r.roleId || r.roleID} value={r.roleId || r.roleID}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-accent">
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
