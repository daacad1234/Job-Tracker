import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/api";

const emptyForm = { customerName: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/Customers");
      setCustomers(res.data || []);
    } catch (err) {
      setError(err.message || "Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingId(c.customerId || c.customerID);
    setForm({
      customerName: c.customerName || "",
      email: c.email || "",
      phone: c.phone || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.customerName.trim() || !form.phone.trim()) {
      toast.error("Customer name and phone are required.");
      return false;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/Customers/${editingId}`, { ...form, customerId: editingId });
        toast.success("Customer updated");
      } else {
        await api.post("/Customers", form);
        toast.success("Customer added");
      }
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      toast.error(err.message || "Could not save customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.delete(`/Customers/${id}`);
      toast.success("Customer deleted");
      loadCustomers();
    } catch (err) {
      toast.error(err.message || "Could not delete customer.");
    }
  };

  const filtered = customers.filter((c) =>
    `${c.customerName} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Customers">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 justify-center">
          <FiPlus /> Add Customer
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500">Loading customers…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No customers found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const id = c.customerId || c.customerID;
                return (
                  <tr key={id}>
                    <td className="table-cell font-medium text-slate-800">{c.customerName}</td>
                    <td className="table-cell">{c.email || "-"}</td>
                    <td className="table-cell">{c.phone}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(c)} className="text-blue-600 hover:text-blue-800">
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
        <Modal title={editingId ? "Edit Customer" : "Add Customer"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Sahal Construction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. info@sahal.so"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. +252615111111"
              />
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
