import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'APPLICANT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password, form.role);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="pin-card rounded-lg border border-[var(--color-ink)]/10 bg-[var(--color-card)] p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Create your account</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Choose "Job seeker" to apply, or "Employer" to post vacancies.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-ink)]">Full name</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full rounded-md border border-[var(--color-ink)]/15 px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-ink)]">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-[var(--color-ink)]/15 px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-ink)]">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-[var(--color-ink)]/15 px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-ink)]">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'APPLICANT', label: 'Job seeker' },
                { value: 'EMPLOYER', label: 'Employer' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm({ ...form, role: opt.value })}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                    form.role === opt.value
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-ink)]/15 text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--color-primary)] py-2.5 font-medium text-white hover:bg-[var(--color-primary-light)] disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-ink-soft)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
