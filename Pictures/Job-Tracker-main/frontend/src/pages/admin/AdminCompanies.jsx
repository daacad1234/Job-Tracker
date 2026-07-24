import { useEffect, useState } from 'react';
import api, { extractErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  function load() {
    setLoading(true);
    setError('');
    api.get('/companies')
      .then(({ data }) => setCompanies(Array.isArray(data) ? data : data.content || []))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleModerate(id, action) {
    setSavingId(id);
    setError('');
    try {
      const { data } = await api.patch(`/companies/${id}/${action}`);
      setCompanies((prev) => prev.map((c) => (c.id === id ? data : c)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  const visible = filter === 'ALL' ? companies : companies.filter((c) => (c.status || 'PENDING') === filter);
  const pendingCount = companies.filter((c) => (c.status || 'PENDING') === 'PENDING').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">Manage companies</h1>
            <p className="mt-1 text-sm text-slate-500">Approve new company profiles before they can post jobs publicly.</p>
          </div>
          {pendingCount > 0 && (
            <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
              {pendingCount} awaiting review
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                filter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        {loading ? (
          <LoadingSpinner label="Loading companies…" />
        ) : visible.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No companies found" message="Companies employers create will show up here for approval." />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {visible.map((company) => {
              const status = company.status || 'PENDING';
              return (
                <div key={company.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{company.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{company.description || 'No description provided.'}</p>
                      <p className="mt-1 text-xs text-slate-400">Owner: {company.ownerName || '—'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
                      {status}
                    </span>
                  </div>

                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-medium text-slate-700 hover:text-slate-900">
                      Visit website →
                    </a>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={savingId === company.id || status === 'APPROVED'}
                      onClick={() => handleModerate(company.id, 'approve')}
                      className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={savingId === company.id || status === 'REJECTED'}
                      onClick={() => handleModerate(company.id, 'reject')}
                      className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
