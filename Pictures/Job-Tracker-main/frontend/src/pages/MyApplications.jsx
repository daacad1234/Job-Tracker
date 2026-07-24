import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { extractErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api.get('/applications/my').then((res) => setApplications(res.data)).finally(() => setLoading(false));
  }

  async function handleWithdraw(id) {
    setError('');
    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading your applications…" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">My applications</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">Track where each application stands.</p>

      {error && <p className="mt-4 rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>}

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          message="Browse open positions and apply to get started."
          action={
            <Link to="/" className="rounded-md bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-light)]">
              Browse jobs
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="pin-card flex items-center justify-between rounded-lg border border-[var(--color-ink)]/10 bg-[var(--color-card)] p-5 shadow-sm">
              <div>
                <Link to={`/jobs/${app.jobId}`} className="font-display font-semibold text-[var(--color-ink)] hover:underline">
                  {app.jobTitle}
                </Link>
                <p className="mt-1 font-mono text-xs text-[var(--color-ink-soft)]">
                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
                {app.status === 'PENDING' && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    className="text-sm text-[var(--color-danger)] hover:underline"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
