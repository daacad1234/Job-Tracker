import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiDownload } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/api";

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    customerId: "",
    productId: "",
    fromDate: "",
    toDate: "",
  });

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
      setError(err.message || "Could not load report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const getCustomerName = (id) =>
    customers.find((c) => String(c.customerId || c.customerID) === String(id))?.customerName ||
    `#${id}`;
  const getProductName = (id) =>
    products.find((p) => String(p.productId || p.productID) === String(id))?.profileName ||
    `#${id}`;

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const custId = s.customerID ?? s.customerId;
      const prodId = s.productID ?? s.productId;
      const saleDate = s.saleDate ? new Date(s.saleDate) : null;

      if (filters.customerId && String(custId) !== String(filters.customerId)) return false;
      if (filters.productId && String(prodId) !== String(filters.productId)) return false;
      if (filters.fromDate && saleDate && saleDate < new Date(filters.fromDate)) return false;
      if (filters.toDate && saleDate && saleDate > new Date(filters.toDate + "T23:59:59")) return false;
      return true;
    });
  }, [sales, filters]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);
  const totalQty = filteredSales.reduce((sum, s) => sum + Number(s.qty || 0), 0);

  const handleExportCsv = () => {
    const header = "SaleID,Customer,Product,Qty,TotalPrice,Date\n";
    const rows = filteredSales
      .map((s) => {
        const id = s.saleID || s.saleId;
        const custId = s.customerID ?? s.customerId;
        const prodId = s.productID ?? s.productId;
        const date = s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "";
        return `${id},"${getCustomerName(custId)}","${getProductName(prodId)}",${s.qty},${s.totalPrice},${date}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sales_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => setFilters({ customerId: "", productId: "", fromDate: "", toDate: "" });

  return (
    <DashboardLayout title="Reports">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">Filter Sales Report</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Customer</label>
            <select name="customerId" value={filters.customerId} onChange={handleChange} className="input-field">
              <option value="">All customers</option>
              {customers.map((c) => (
                <option key={c.customerId || c.customerID} value={c.customerId || c.customerID}>
                  {c.customerName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Product</label>
            <select name="productId" value={filters.productId} onChange={handleChange} className="input-field">
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p.productId || p.productID} value={p.productId || p.productID}>
                  {p.profileName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">From Date</label>
            <input type="date" name="fromDate" value={filters.fromDate} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">To Date</label>
            <input type="date" name="toDate" value={filters.toDate} onChange={handleChange} className="input-field" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
          <button onClick={handleExportCsv} className="btn-accent flex items-center gap-2">
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="card">
          <p className="text-sm text-gray-500">Filtered Sales</p>
          <p className="text-2xl font-bold text-slate-800">{filteredSales.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Filtered Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500">Loading report…</p>
        ) : filteredSales.length === 0 ? (
          <p className="text-sm text-gray-500">No sales match the selected filters.</p>
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
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => {
                const id = s.saleID || s.saleId;
                return (
                  <tr key={id}>
                    <td className="table-cell">#{id}</td>
                    <td className="table-cell">{getCustomerName(s.customerID ?? s.customerId)}</td>
                    <td className="table-cell">{getProductName(s.productID ?? s.productId)}</td>
                    <td className="table-cell">{s.qty}</td>
                    <td className="table-cell font-medium text-slate-800">${Number(s.totalPrice).toFixed(2)}</td>
                    <td className="table-cell">{s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "-"}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="table-cell font-semibold" colSpan={3}>Total</td>
                <td className="table-cell font-semibold">{totalQty}</td>
                <td className="table-cell font-semibold">${totalRevenue.toFixed(2)}</td>
                <td className="table-cell"></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
