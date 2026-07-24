import { useEffect, useState } from 'react';
import api, { extractErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', website: '', logoUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api.get('/companies/mine')
      .then(({ data }) => setCompanies(data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/companies', form);
      setForm({ name: '', description: '', website: '', logoUrl: '' });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">My companies</h1>
      <p className="mt-1 text-ink-soft">Create a company profile before posting jobs under it.</p>

      <form onSubmit={handleCreate} className="mt-6 space-y-4 rounded-lg border border-ink/10 bg-card p-6 shadow-sm">
        <h2 className="font-display text-base font-semibold text-ink">Add a company</h2>
        {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Website</label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Logo URL</label>
            <input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              className="w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create company'}
        </button>
      </form>

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">Your companies</h2>
      {loading ? (
        <LoadingSpinner />
      ) : companies.length === 0 ? (
        <div className="mt-4"><EmptyState title="No companies yet" message="Add one above to get started." /></div>
      ) : (
        <div className="mt-4 space-y-3">
          {companies.map((c) => (
            <div key={c.id} className="rounded-lg border border-ink/10 bg-card p-4 shadow-sm">
              <p className="font-display font-semibold text-ink">{c.name}</p>
              {c.description && <p className="mt-1 text-sm text-ink-soft">{c.description}</p>}
              {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-primary hover:underline">{c.website}</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
