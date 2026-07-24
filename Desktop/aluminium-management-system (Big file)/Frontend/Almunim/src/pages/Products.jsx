import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/api";

const emptyForm = {
  profileName: "",
  color: "",
  thicknessMM: "",
  pricePerMeter: "",
  stockQty: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("profileName");
  const [sortAsc, setSortAsc] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/Products");
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.productId || product.productID);
    setForm({
      profileName: product.profileName || "",
      color: product.color || "",
      thicknessMM: product.thicknessMM ?? "",
      pricePerMeter: product.pricePerMeter ?? "",
      stockQty: product.stockQty ?? "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.profileName.trim() || !form.color.trim()) {
      toast.error("Profile name and color are required.");
      return false;
    }
    if (Number(form.thicknessMM) <= 0 || Number(form.pricePerMeter) <= 0) {
      toast.error("Thickness and price must be greater than 0.");
      return false;
    }
    if (Number(form.stockQty) < 0) {
      toast.error("Stock quantity cannot be negative.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const payload = {
      profileName: form.profileName,
      color: form.color,
      thicknessMM: Number(form.thicknessMM),
      pricePerMeter: Number(form.pricePerMeter),
      stockQty: Number(form.stockQty),
    };

    try {
      if (editingId) {
        await api.put(`/Products/${editingId}`, { ...payload, productId: editingId });
        toast.success("Product updated");
      } else {
        await api.post("/Products", payload);
        toast.success("Product added");
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/Products/${id}`);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Could not delete product.");
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = products
    .filter((p) =>
      `${p.profileName} ${p.color}`.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  return (
    <DashboardLayout title="Products">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 justify-center">
          <FiPlus /> Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500">Loading products…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No products found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header cursor-pointer" onClick={() => toggleSort("profileName")}>
                  Profile Name
                </th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort("color")}>
                  Color
                </th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort("thicknessMM")}>
                  Thickness (mm)
                </th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort("pricePerMeter")}>
                  Price / Meter
                </th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort("stockQty")}>
                  Stock
                </th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const id = p.productId || p.productID;
                return (
                  <tr key={id}>
                    <td className="table-cell font-medium text-slate-800">{p.profileName}</td>
                    <td className="table-cell">{p.color}</td>
                    <td className="table-cell">{p.thicknessMM}</td>
                    <td className="table-cell">${Number(p.pricePerMeter).toFixed(2)}</td>
                    <td className="table-cell">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.stockQty < 50
                            ? "bg-red-100 text-red-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {p.stockQty}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
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
        <Modal title={editingId ? "Edit Product" : "Add Product"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Profile Name</label>
              <input
                name="profileName"
                value={form.profileName}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Sliding Window Frame"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Black"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Thickness (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  name="thicknessMM"
                  value={form.thicknessMM}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Price / Meter</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerMeter"
                  value={form.pricePerMeter}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Stock Quantity</label>
              <input
                type="number"
                name="stockQty"
                value={form.stockQty}
                onChange={handleChange}
                className="input-field"
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
