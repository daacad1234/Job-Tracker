import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-white">
            TB
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            The Board
          </span>
        </Link>

        <nav className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide">
          <Link to="/" className="rounded px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink">
            Jobs
          </Link>
          <Link to="/about" className="rounded px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink">
            About
          </Link>

          {user?.role === 'APPLICANT' && (
            <>
              <Link to="/my-applications" className="rounded px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink">
                My Applications
              </Link>
              <Link to="/saved-jobs" className="rounded px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink">
                Saved
              </Link>
            </>
          )}

          {user?.role === 'EMPLOYER' && (
            <Link to="/employer" className="rounded px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink">
              Employer Dashboard
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="rounded px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink">
              Admin
            </Link>
          )}

          {user ? (
            <div className="ml-3 flex items-center gap-3 border-l border-ink/10 pl-3 normal-case tracking-normal">
              <span className="hidden text-sm text-ink-soft sm:inline">
                {user.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-white hover:bg-ink/85"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-3 flex items-center gap-2 normal-case tracking-normal">
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-light"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
