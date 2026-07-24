import { useEffect, useState } from 'react';
import api, { extractErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api.get('/categories').then(({ data }) => setCategories(data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/categories', { name });
      setName('');
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">Job categories</h1>
      <p className="mt-1 text-ink-soft">Categories power the filter on the job board — keep the list tidy.</p>

      <form onSubmit={handleCreate} className="mt-6 flex gap-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Design"
          className="flex-1 rounded-md border border-ink/15 bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {error && <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No categories yet" message="Add your first one above." />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 rounded-lg border border-ink/10 bg-card">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-ink">{c.name}</span>
              <button onClick={() => handleDelete(c.id)} className="text-sm text-danger hover:underline">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
