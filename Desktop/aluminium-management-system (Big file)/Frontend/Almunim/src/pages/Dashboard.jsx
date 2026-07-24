import { useEffect, useState } from "react";
import { FiBox, FiUsers, FiShoppingCart, FiDollarSign } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/api";

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    sales: 0,
    revenue: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, customersRes, salesRes] = await Promise.all([
        api.get("/Products"),
        api.get("/Customers"),
        api.get("/Sales"),
      ]);

      const sales = salesRes.data || [];
      const revenue = sales.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);

      setStats({
        products: (productsRes.data || []).length,
        customers: (customersRes.data || []).length,
        sales: sales.length,
        revenue,
      });

      setRecentSales(
        [...sales]
          .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
          .slice(0, 5)
      );
    } catch (err) {
      setError(err.message || "Could not load dashboard data. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FiBox />}
          label="Total Products"
          value={loading ? "…" : stats.products}
          color="bg-blue-600"
        />
        <StatCard
          icon={<FiUsers />}
          label="Total Customers"
          value={loading ? "…" : stats.customers}
          color="bg-slate-800"
        />
        <StatCard
          icon={<FiShoppingCart />}
          label="Total Sales"
          value={loading ? "…" : stats.sales}
          color="bg-emerald-500"
        />
        <StatCard
          icon={<FiDollarSign />}
          label="Revenue"
          value={loading ? "…" : `$${stats.revenue.toFixed(2)}`}
          color="bg-blue-600"
        />
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Recent Sales</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : recentSales.length === 0 ? (
          <p className="text-sm text-gray-500">No sales recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Sale ID</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.saleID || s.saleId}>
                    <td className="table-cell">#{s.saleID || s.saleId}</td>
                    <td className="table-cell">{s.customerName || s.customerID}</td>
                    <td className="table-cell">{s.qty}</td>
                    <td className="table-cell">${Number(s.totalPrice).toFixed(2)}</td>
                    <td className="table-cell">
                      {s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
