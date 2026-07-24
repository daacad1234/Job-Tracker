import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/api";

const emptyForm = { customerId: "", productId: "", qty: "" };

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [salesRes, customersRes, productsRes] = await Promise.all([
        api.get("/Sales"),
        api.get("/Customers"),
        api.get("/Products"),
      ]);
      setSales(salesRes.data || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      setError(err.message || "Could not load sales data.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectedProduct = products.find(
    (p) => String(p.productId || p.productID) === String(form.productId)
  );
  const estimatedTotal =
    selectedProduct && form.qty
      ? (Number(selectedProduct.pricePerMeter) * Number(form.qty)).toFixed(2)
      : "0.00";

  const validate = () => {
    if (!form.customerId || !form.productId) {
      toast.error("Please select a customer and a product.");
      return false;
    }
    if (!form.qty || Number(form.qty) <= 0) {
      toast.error("Quantity must be greater than 0.");
      return false;
    }
    if (selectedProduct && Number(form.qty) > selectedProduct.stockQty) {
      toast.error(`Only ${selectedProduct.stockQty} units in stock.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const payload = {
      customerId: Number(form.customerId),
      productId: Number(form.productId),
      qty: Number(form.qty),
      totalPrice: Number(estimatedTotal),
    };

    try {
      await api.post("/Sales", payload);
      toast.success("Sale recorded");
      setShowModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.message || "Could not record sale.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale record?")) return;
    try {
      await api.delete(`/Sales/${id}`);
      toast.success("Sale deleted");
      loadAll();
    } catch (err) {
      toast.error(err.message || "Could not delete sale.");
    }
  };

  const getCustomerName = (id) =>
    customers.find((c) => String(c.customerId || c.customerID) === String(id))?.customerName ||
    `#${id}`;
  const getProductName = (id) =>
    products.find((p) => String(p.productId || p.productID) === String(id))?.profileName ||
    `#${id}`;

  const filtered = sales.filter((s) => {
    const text = `${getCustomerName(s.customerID ?? s.customerId)} ${getProductName(
      s.productID ?? s.productId
    )}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout title="Sales">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 justify-center">
          <FiPlus /> Record Sale
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500">Loading sales…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No sales found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Sale ID</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Product</th>
                <th className="table-header">Qty</th>
                <th className="table-header">Total</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const id = s.saleID || s.saleId;
                return (
                  <tr key={id}>
                    <td className="table-cell">#{id}</td>
                    <td className="table-cell">{getCustomerName(s.customerID ?? s.customerId)}</td>
                    <td className="table-cell">{getProductName(s.productID ?? s.productId)}</td>
                    <td className="table-cell">{s.qty}</td>
                    <td className="table-cell font-medium text-slate-800">
                      ${Number(s.totalPrice).toFixed(2)}
                    </td>
                    <td className="table-cell">
                      {s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="table-cell">
                      <button onClick={() => handleDelete(id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="Record Sale" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Customer</label>
              <select name="customerId" value={form.customerId} onChange={handleChange} className="input-field">
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.customerId || c.customerID} value={c.customerId || c.customerID}>
                    {c.customerName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Product</label>
              <select name="productId" value={form.productId} onChange={handleChange} className="input-field">
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.productId || p.productID} value={p.productId || p.productID}>
                    {p.profileName} ({p.color}) — ${p.pricePerMeter}/m
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                name="qty"
                value={form.qty}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600">
              Estimated Total: <span className="font-semibold text-slate-800">${estimatedTotal}</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-accent">
                {saving ? "Saving..." : "Record Sale"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
