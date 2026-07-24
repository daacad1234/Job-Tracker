import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiGrid, FiArchive, FiFileText, FiLayers,
  FiUsers, FiUserCheck, FiAlertCircle, FiClock,
} from 'react-icons/fi';
import api, { extractErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const managementCards = [
  { title: 'Manage users', description: 'Review signups, roles, and access controls.', href: '/admin/users', icon: FiUsers, badge: 'Protected' },
  { title: 'Manage companies', description: 'Approve pending company profiles.', href: '/admin/companies', icon: FiBriefcase, badge: 'Profiles' },
  { title: 'Manage jobs', description: 'Moderate postings and close inactive roles.', href: '/admin/jobs', icon: FiArchive, badge: 'Listings' },
  { title: 'Manage categories', description: 'Keep job taxonomy clean and searchable.', href: '/admin/categories', icon: FiLayers, badge: 'Taxonomy' },
  { title: 'Manage applications', description: 'Monitor candidate progress and hiring outcomes.', href: '/admin/applications', icon: FiFileText, badge: 'ATS' },
];

function formatValue(value) {
  return Number.isFinite(value) ? value.toLocaleString() : '—';
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [usersRes, companiesRes, jobsRes, applicationsRes] = await Promise.all([
          api.get('/users'),
          api.get('/companies'),
          api.get('/jobs'),
          api.get('/applications'),
        ]);

        if (cancelled) return;

        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : []);
        setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
        setApplications(Array.isArray(applicationsRes.data) ? applicationsRes.data : []);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const totalEmployers = users.filter((u) => u.role === 'EMPLOYER').length;
  const totalApplicants = users.filter((u) => u.role === 'APPLICANT').length;
  const pendingCompanies = companies.filter((c) => (c.status || 'PENDING') === 'PENDING').length;
  const openJobs = jobs.filter((j) => j.status === 'OPEN').length;

  const stats = [
    { label: 'Total users', value: users.length, icon: FiUsers },
    { label: 'Employers', value: totalEmployers, icon: FiGrid },
    { label: 'Applicants', value: totalApplicants, icon: FiUserCheck },
    { label: 'Companies', value: companies.length, icon: FiBriefcase },
    { label: 'Open jobs', value: openJobs, icon: FiArchive },
    { label: 'Applications', value: applications.length, icon: FiFileText },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-[0_25px_60px_-24px_rgba(15,23,42,0.85)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
              Admin control center
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Command your hiring platform with clarity.
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">
              Live data pulled directly from the database — users, companies, jobs, and applications.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">
            <p className="font-semibold">Live overview</p>
            <p className="mt-1 text-slate-300">{loading ? 'Loading…' : error ? 'Data failed to load' : 'Synced just now'}</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-300/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-100">
            <FiAlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8"><LoadingSpinner label="Loading dashboard…" /></div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-200">{item.label}</p>
                    <div className="rounded-xl bg-white/10 p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 font-display text-2xl font-semibold">{formatValue(item.value)}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {!loading && pendingCompanies > 0 && (
        <Link
          to="/admin/companies"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
        >
          <FiClock className="h-4 w-4 shrink-0" />
          {pendingCompanies} company profile{pendingCompanies === 1 ? '' : 's'} waiting on your approval →
        </Link>
      )}

      <section className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">Management workspace</h2>
            <p className="mt-1 text-sm text-slate-500">Jump into the operational modules that keep the platform healthy.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
            Role-aware access
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {managementCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.href} className="block">
                <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-slate-900 p-2 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="rounded-full bg-slate-200/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
