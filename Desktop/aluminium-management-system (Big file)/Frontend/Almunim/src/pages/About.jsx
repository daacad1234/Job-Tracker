import { FiMail, FiPhone, FiMapPin, FiInfo } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";

export default function About() {
  return (
    <DashboardLayout title="About & Contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <FiInfo className="text-blue-600 text-xl" />
            <h2 className="font-semibold text-slate-800">About Almunim</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Almunim is an Aluminium Management System built for tracking
            products, customers, and sales for an aluminium supply business.
            The system manages profiles such as sheets, rods, window frames,
            door frames, and channel profiles, along with stock levels and
            customer orders.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            This project was developed for the CA235 React Web Development
            course at Jamhuriya University of Science and Technology (JUST).
            The backend is built with C# ASP.NET Core Web API using ADO.NET,
            backed by a SQL Server database. The frontend is built with React,
            Vite, and Tailwind CSS.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Frontend</p>
              <p className="text-sm font-semibold text-slate-800">React + Vite + Tailwind</p>
            </div>
            <div className="bg-emerald-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Backend</p>
              <p className="text-sm font-semibold text-slate-800">ASP.NET Core + ADO.NET</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-3">Contact</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <FiMail className="text-blue-600" />
              <span>support@almunim.so</span>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="text-blue-600" />
              <span>+252 61 500 0000</span>
            </div>
            <div className="flex items-center gap-3">
              <FiMapPin className="text-blue-600" />
              <span>Mogadishu, Somalia</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Jamhuriya University of Science and Technology (JUST)
            <br />
            CA235 — React Web Development
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
