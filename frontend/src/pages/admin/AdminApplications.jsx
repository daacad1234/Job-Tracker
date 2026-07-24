import { useEffect, useState } from 'react';
import api, { extractErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const STATUSES = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  function load() {
    setLoading(true);
    setError('');
    api.get('/applications')
      .then(({ data }) => setApplications(Array.isArray(data) ? data : data.content || []))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(applicationId, status) {
    setSavingId(applicationId);
    setError('');
    try {
      const { data } = await api.put(`/applications/${applicationId}/status`, { status });
      setApplications((prev) => prev.map((a) => (a.id === applicationId ? data : a)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Manage applications</h1>
        <p className="mt-1 text-sm text-slate-500">Track the ATS pipeline and review application outcomes from one place.</p>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

        {loading ? (
          <LoadingSpinner label="Loading applications…" />
        ) : applications.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No applications yet" message="Applicants will appear here as soon as they apply to active roles." />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {applications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.applicantName || 'Applicant'}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.applicantEmail}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.jobTitle || 'Job title unavailable'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status || 'PENDING'} />
                    <select
                      value={item.status}
                      disabled={savingId === item.id}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 disabled:opacity-60"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
