import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiLayout, FiUsers, FiGrid, FiUserCheck, FiBriefcase, FiArchive, FiLayers, FiFileText, FiChevronLeft } from 'react-icons/fi';

const links = [
  { to: '/admin', label: 'Overview', icon: FiLayout },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/employers', label: 'Employers', icon: FiGrid },
  { to: '/admin/applicants', label: 'Applicants', icon: FiUserCheck },
  { to: '/admin/companies', label: 'Companies', icon: FiBriefcase },
  { to: '/admin/jobs', label: 'Jobs', icon: FiArchive },
  { to: '/admin/categories', label: 'Categories', icon: FiLayers },
  { to: '/admin/applications', label: 'Applications', icon: FiFileText },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:w-72">
          <Link to="/" className="flex items-center gap-2 text-slate-900">
            <span className="rounded-xl bg-slate-900 p-2 text-white">
              <FiChevronLeft className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-semibold">Admin workspace</span>
          </Link>

          <nav className="mt-6 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
