import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiHome, FiCheckCircle, FiClock, FiDownload, FiEye,
  FiGrid, FiPlus, FiRefreshCcw, FiUsers,
} from 'react-icons/fi';
import api, { extractErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const PIPELINE_STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'HIRED'];
const STATUS_LABELS = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted', INTERVIEW_SCHEDULED: 'Interview Scheduled', INTERVIEWED: 'Interviewed',
  OFFERED: 'Offered', HIRED: 'Hired', REJECTED: 'Rejected', OPEN: 'Open', CLOSED: 'Closed',
};

function getStatusIndex(status) {
  const index = PIPELINE_STAGES.indexOf(status);
  return index >= 0 ? index : 0;
}

export default function EmployerDashboard() {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [applicationsByJob, setApplicationsByJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    website: '',
    description: '',
    industry: '',
    email: '',
    phone: '',
    location: '',
    logoUrl: '',
    bannerUrl: '',
    socialLinks: '',
  });
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    skills: '',
    benefits: '',
    location: '',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    remoteType: 'ON_SITE',
    salaryMin: '',
    salaryMax: '',
    deadline: '',
    companyId: '',
    categoryId: '',
  });
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll({ silent = false } = {}) {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const [companiesRes, categoriesRes] = await Promise.allSettled([
        api.get('/companies/mine').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] })),
      ]);

      const nextCompanies = Array.isArray(companiesRes.value?.data)
        ? companiesRes.value.data
        : companiesRes.value?.data?.content || [];
      const nextCategories = Array.isArray(categoriesRes.value?.data)
        ? categoriesRes.value.data
        : categoriesRes.value?.data?.content || [];

      setCompanies(nextCompanies);
      setCategories(nextCategories);

      if (nextCompanies.length === 0) {
        setJobs([]);
        setApplicationsByJob({});
        setSelectedJobId(null);
        return;
      }

      const jobLists = await Promise.allSettled(
        nextCompanies.map((company) => api.get(`/jobs/company/${company.id}`).catch(() => ({ data: [] }))),
      );
      const nextJobs = jobLists.flatMap((entry) => entry.value?.data || []);
      setJobs(nextJobs);

      const appMap = {};
      await Promise.all(
        nextJobs.map(async (job) => {
          try {
            const { data } = await api.get(`/applications/job/${job.id}`);
            appMap[job.id] = Array.isArray(data) ? data : data.content || [];
          } catch {
            appMap[job.id] = [];
          }
        }),
      );
      setApplicationsByJob(appMap);

      setSelectedJobId((current) => {
        if (current && nextJobs.some((job) => job.id === current)) return current;
        return nextJobs[0]?.id ?? null;
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const stats = useMemo(() => {
    const openJobs = jobs.filter((job) => job.status === 'OPEN').length;
    const closedJobs = jobs.filter((job) => job.status === 'CLOSED').length;
    const totalApplications = Object.values(applicationsByJob).reduce((sum, items) => sum + items.length, 0);
    const shortlisted = Object.values(applicationsByJob).flat().filter((item) => item.status === 'SHORTLISTED').length;
    const interviews = Object.values(applicationsByJob).flat().filter((item) => item.status === 'INTERVIEW_SCHEDULED' || item.status === 'INTERVIEWED').length;
    const hired = Object.values(applicationsByJob).flat().filter((item) => item.status === 'HIRED').length;

    return [
      { label: 'Active jobs', value: openJobs, icon: FiBriefcase },
      { label: 'Closed jobs', value: closedJobs, icon: FiCheckCircle },
      { label: 'Applications received', value: totalApplications, icon: FiUsers },
      { label: 'Shortlisted candidates', value: shortlisted, icon: FiGrid },
      { label: 'Interviews', value: interviews, icon: FiClock },
      { label: 'Hired candidates', value: hired, icon: FiHome },
    ];
  }, [jobs, applicationsByJob]);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) || jobs[0] || null, [jobs, selectedJobId]);
  const selectedApplications = useMemo(() => (selectedJob ? applicationsByJob[selectedJob.id] || [] : []), [applicationsByJob, selectedJob]);

  const pipelineProgress = useMemo(() => {
    const anyRejected = selectedApplications.some((app) => app.status === 'REJECTED');
    const furthestIndex = selectedApplications.reduce((highest, app) => {
      if (app.status === 'REJECTED') return highest;
      return Math.max(highest, getStatusIndex(app.status));
    }, -1);
    return { anyRejected, furthestIndex };
  }, [selectedApplications]);

  function resetCompanyForm() {
    setCompanyForm({
      name: '',
      website: '',
      description: '',
      industry: '',
      email: '',
      phone: '',
      location: '',
      logoUrl: '',
      bannerUrl: '',
      socialLinks: '',
    });
    setEditingCompanyId(null);
  }

  function resetJobForm() {
    setJobForm({
      title: '',
      description: '',
      responsibilities: '',
      requirements: '',
      skills: '',
      benefits: '',
      location: '',
      employmentType: 'FULL_TIME',
      experienceLevel: 'MID',
      remoteType: 'ON_SITE',
      salaryMin: '',
      salaryMax: '',
      deadline: '',
      companyId: companies[0]?.id ? String(companies[0].id) : '',
      categoryId: '',
    });
    setEditingJobId(null);
  }

  function startCompanyEdit(company) {
    setEditingCompanyId(company.id);
    setCompanyForm({
      name: company.name || '',
      website: company.website || '',
      description: company.description || '',
      industry: company.industry || '',
      email: company.email || '',
      phone: company.phone || '',
      location: company.location || '',
      logoUrl: company.logoUrl || '',
      bannerUrl: company.bannerUrl || '',
      socialLinks: company.socialLinks || '',
    });
    setShowCompanyForm(true);
  }

  function startJobEdit(job) {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      responsibilities: job.responsibilities || '',
      requirements: job.requirements || '',
      skills: job.skills || '',
      benefits: job.benefits || '',
      location: job.location || '',
      employmentType: job.employmentType || 'FULL_TIME',
      experienceLevel: job.experienceLevel || 'MID',
      remoteType: job.remoteType || 'ON_SITE',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      deadline: job.deadline || '',
      companyId: job.companyId ? String(job.companyId) : '',
      categoryId: job.categoryId ? String(job.categoryId) : '',
    });
    setShowJobForm(true);
  }

  async function handleCreateOrUpdateCompany(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...companyForm,
        socialLinks: companyForm.socialLinks || null,
      };
      if (editingCompanyId) {
        await api.put(`/companies/${editingCompanyId}`, payload);
      } else {
        await api.post('/companies', payload);
      }
      setSuccess(editingCompanyId ? 'Company profile updated.' : 'Company profile created.');
      resetCompanyForm();
      setShowCompanyForm(false);
      loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleCreateOrUpdateJob(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...jobForm,
        companyId: Number(jobForm.companyId),
        categoryId: Number(jobForm.categoryId),
        salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : null,
        salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : null,
        deadline: jobForm.deadline || null,
      };
      if (editingJobId) {
        await api.put(`/jobs/${editingJobId}`, payload);
      } else {
        await api.post('/jobs', payload);
      }
      setSuccess(editingJobId ? 'Job updated.' : 'Job posted.');
      resetJobForm();
      setShowJobForm(false);
      loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleCloseJob(id) {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/jobs/${id}/close`);
      setSuccess('Job closed.');
      loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handlePublishJob(id) {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/jobs/${id}/publish`);
      setSuccess('Job published.');
      loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleDeleteJob(id) {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/jobs/${id}`);
      setSuccess('Job removed.');
      loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleApplicationStatus(applicationId, jobId, status) {
    setError('');
    setSuccess('');
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      setApplicationsByJob((prev) => ({
        ...prev,
        [jobId]: (prev[jobId] || []).map((item) => (item.id === applicationId ? { ...item, status } : item)),
      }));
      setSuccess('Application stage updated.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading your dashboard…" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-[0_25px_60px_-24px_rgba(15,23,42,0.85)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-100">
              Employer control center
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Turn hiring into a polished, high-signal workflow.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              Manage your company profile, post roles, and move applicants through a modern ATS pipeline without leaving the dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">
              <p className="font-semibold">Hiring pulse</p>
              <p className="mt-1 text-slate-300">{companies.length} company profile{companies.length === 1 ? '' : 's'} · {jobs.length} role{jobs.length === 1 ? '' : 's'} in motion</p>
            </div>
            <button
              type="button"
              onClick={() => loadAll({ silent: true })}
              disabled={refreshing}
              title="Refresh dashboard data"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 hover:bg-white/20 disabled:opacity-50"
            >
              <FiRefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

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
                <p className="mt-4 font-display text-2xl font-semibold">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
      {success && <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">Company profile</h2>
              <p className="mt-1 text-sm text-slate-500">Keep your employer brand polished and up to date.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetCompanyForm();
                setShowCompanyForm((value) => !value);
              }}
              className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              {showCompanyForm ? 'Cancel' : '+ Add company'}
            </button>
          </div>

          {showCompanyForm && (
            <form onSubmit={handleCreateOrUpdateCompany} className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <input required placeholder="Company name" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <input placeholder="Website" value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <input placeholder="Email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <input placeholder="Phone" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <input placeholder="Location" value={companyForm.location} onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <input placeholder="Industry" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <input placeholder="Logo URL" value={companyForm.logoUrl} onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <input placeholder="Banner URL" value={companyForm.bannerUrl} onChange={(e) => setCompanyForm({ ...companyForm, bannerUrl: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <textarea placeholder="Short company description" rows={3} value={companyForm.description} onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <input placeholder="Social links" value={companyForm.socialLinks} onChange={(e) => setCompanyForm({ ...companyForm, socialLinks: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:col-span-2">
                {editingCompanyId ? 'Save changes' : 'Create company'}
              </button>
            </form>
          )}

          <div className="mt-5 space-y-3">
            {companies.length === 0 && !showCompanyForm ? (
              <EmptyState title="No company profile yet" message="Create your first company profile to start posting open roles." />
            ) : (
              companies.map((company) => (
                <div key={company.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{company.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{company.description || 'A polished company profile helps applicants trust your brand.'}</p>
                      {company.website && <p className="mt-2 text-sm text-slate-600">{company.website}</p>}
                    </div>
                    <button type="button" onClick={() => startCompanyEdit(company)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white">
                      Edit profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">Job management</h2>
              <p className="mt-1 text-sm text-slate-500">Create, refine, publish, close, and review roles from one place.</p>
            </div>
            <button
              type="button"
              disabled={companies.length === 0}
              onClick={() => {
                resetJobForm();
                setShowJobForm((value) => !value);
              }}
              className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-45"
            >
              {showJobForm ? 'Cancel' : <><FiPlus className="mr-1 inline h-4 w-4" /> Post job</>}
            </button>
          </div>

          {showJobForm && (
            <form onSubmit={handleCreateOrUpdateJob} className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <input required placeholder="Job title" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <textarea required placeholder="Description" rows={3} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <textarea placeholder="Responsibilities" rows={3} value={jobForm.responsibilities} onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <textarea placeholder="Requirements" rows={2} value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <textarea placeholder="Skills" rows={2} value={jobForm.skills} onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <textarea placeholder="Benefits" rows={2} value={jobForm.benefits} onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 sm:col-span-2" />
              <input required placeholder="Location" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <select value={jobForm.employmentType} onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400">
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
              <select value={jobForm.experienceLevel} onChange={(e) => setJobForm({ ...jobForm, experienceLevel: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400">
                <option value="ENTRY">Entry</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
              </select>
              <select value={jobForm.remoteType} onChange={(e) => setJobForm({ ...jobForm, remoteType: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400">
                <option value="ON_SITE">Onsite</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
              <input type="number" placeholder="Min salary" value={jobForm.salaryMin} onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <input type="number" placeholder="Max salary" value={jobForm.salaryMax} onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <input type="date" value={jobForm.deadline} onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" />
              <select required value={jobForm.companyId} onChange={(e) => setJobForm({ ...jobForm, companyId: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400">
                <option value="">Select company</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
              <select required value={jobForm.categoryId} onChange={(e) => setJobForm({ ...jobForm, categoryId: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400">
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:col-span-2">
                {editingJobId ? 'Save changes' : 'Post job'}
              </button>
            </form>
          )}

          <div className="mt-5 space-y-3">
            {jobs.length === 0 && !showJobForm ? (
              <EmptyState title="No roles yet" message="Post your first role and start tracking applications immediately." />
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <StatusBadge status={job.status || 'OPEN'} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{job.companyName || 'Company'} · {job.location || 'Location TBD'} · {job.applicationCount ?? (applicationsByJob[job.id]?.length || 0)} applicant{(job.applicationCount ?? (applicationsByJob[job.id]?.length || 0)) === 1 ? '' : 's'}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{job.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => startJobEdit(job)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white">Edit</button>
                      {job.status === 'OPEN' ? (
                        <button type="button" onClick={() => handleCloseJob(job.id)} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100">Close</button>
                      ) : (
                        <button type="button" onClick={() => handlePublishJob(job.id)} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100">Publish</button>
                      )}
                      <button type="button" onClick={() => handleDeleteJob(job.id)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100">Delete</button>
                      <Link to={`/employer/jobs/${job.id}/applicants`} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white">Applicants</Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">Application pipeline</h2>
            <p className="mt-1 text-sm text-slate-500">Move each candidate through a clear stage-based hiring journey.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelectedJobId(job.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${selectedJob?.id === job.id ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                {job.title}
              </button>
            ))}
          </div>
        </div>

        {selectedJob ? (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {PIPELINE_STAGES.map((stage, index) => {
                const isActive = index <= pipelineProgress.furthestIndex;
                return (
                  <div
                    key={stage}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {STATUS_LABELS[stage]}
                  </div>
                );
              })}
              {pipelineProgress.anyRejected && (
                <div className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  {STATUS_LABELS.REJECTED}
                </div>
              )}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Candidate</th>
                    <th className="px-4 py-3 font-semibold">Stage</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {selectedApplications.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-slate-500">
                        No applicants have reached this role yet.
                      </td>
                    </tr>
                  ) : (
                    selectedApplications.map((application) => (
                      <tr key={application.id}>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">{application.applicantName || application.applicant?.fullName || 'Applicant'}</div>
                          <div className="mt-1 text-slate-500">{application.applicantEmail || application.applicant?.email || 'No email provided'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={application.status || 'APPLIED'} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <a href={application.resumeUrl || '#'} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                              <FiEye className="mr-1 inline h-4 w-4" /> CV
                            </a>
                            <a href={application.resumeUrl || '#'} target="_blank" rel="noreferrer" download className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                              <FiDownload className="mr-1 inline h-4 w-4" /> Download
                            </a>
                            <button type="button" onClick={() => handleApplicationStatus(application.id, selectedJob.id, 'SHORTLISTED')} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Shortlist</button>
                            <button type="button" onClick={() => handleApplicationStatus(application.id, selectedJob.id, 'INTERVIEW_SCHEDULED')} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Schedule</button>
                            <button type="button" onClick={() => handleApplicationStatus(application.id, selectedJob.id, 'OFFERED')} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Offer</button>
                            <button type="button" onClick={() => handleApplicationStatus(application.id, selectedJob.id, 'HIRED')} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100">Hire</button>
                            <button type="button" onClick={() => handleApplicationStatus(application.id, selectedJob.id, 'REJECTED')} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-6">
            <EmptyState title="No active roles selected" message="Create or choose a role to begin reviewing applicants." />
          </div>
        )}
      </section>
    </div>
  );
}