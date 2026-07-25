import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const values = [
  {
    title: 'Find jobs easily',
    text: 'Job seekers can search for open jobs and read the full job details.',
  },
  {
    title: 'Apply and track',
    text: 'After applying, job seekers can check the status of each application.',
  },
  {
    title: 'Hire in one place',
    text: 'Employers can post jobs, view applicants, and manage their hiring process.',
  },
];

export default function About() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="overflow-hidden rounded-2xl bg-[var(--color-ink)] px-6 py-12 text-white shadow-lg sm:px-12 sm:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">About The Board</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          Find jobs. Apply easily. Hire the right people.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
          The Board is a simple job website. Job seekers can find and apply for jobs.
          Employers can post jobs and review applications in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] hover:brightness-105">
            Browse jobs
          </Link>
          {!user && (
            <Link to="/register" className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Create an account
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-5 py-10 md:grid-cols-2 md:py-14">
        <article className="pin-card rounded-xl border border-[var(--color-ink)]/10 bg-[var(--color-card)] p-7 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-primary)]">Our vision</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-[var(--color-ink)]">
            Make it easier for everyone to find good work.
          </h2>
          <p className="mt-4 leading-7 text-[var(--color-ink-soft)]">
            We want every person to have a clear way to discover jobs, show their skills, and find new opportunities.
          </p>
        </article>

        <article className="pin-card rounded-xl border border-[var(--color-ink)]/10 bg-[var(--color-card)] p-7 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-primary)]">Our mission</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-[var(--color-ink)]">
            Make job applications and hiring simple for everyone.
          </h2>
          <p className="mt-4 leading-7 text-[var(--color-ink-soft)]">
            We give job seekers and employers one easy place to post jobs, apply for jobs, and follow each step.
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-[var(--color-ink)]/10 bg-[var(--color-card)] p-7 sm:p-9">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-primary)]">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-[var(--color-ink)]">Everything you need in one job board</h2>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {values.map((value, index) => (
            <article key={value.title} className="rounded-lg bg-[var(--color-paper)] p-5">
              <span className="font-mono text-sm font-bold text-[var(--color-accent)]">0{index + 1}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-[var(--color-ink)]">{value.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{value.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
