import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import JobBoard from './pages/JobBoard';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyApplications from './pages/MyApplications';
import SavedJobs from './pages/SavedJobs';
import EmployerDashboard from './pages/EmployerDashboard';
import ApplicantsReview from './pages/ApplicantsReview';
import AdminCategories from './pages/AdminCategories';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import About from './pages/About';

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">404</h1>
      <p className="mt-2 text-ink-soft">This page isn't pinned to the board.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<JobBoard />} />
              <Route path="/about" element={<About />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/my-applications"
                element={
                  <PrivateRoute roles={['APPLICANT']}>
                    <MyApplications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/saved-jobs"
                element={
                  <PrivateRoute roles={['APPLICANT']}>
                    <SavedJobs />
                  </PrivateRoute>
                }
              />

              <Route
                path="/employer"
                element={
                  <PrivateRoute roles={['EMPLOYER', 'ADMIN']}>
                    <EmployerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/jobs/:jobId/applicants"
                element={
                  <PrivateRoute roles={['EMPLOYER', 'ADMIN']}>
                    <ApplicantsReview />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="employers" element={<AdminDashboard />} />
                <Route path="applicants" element={<AdminDashboard />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="applications" element={<AdminApplications />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
