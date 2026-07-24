package com.jobboard.service.impl;

import com.jobboard.dto.request.JobRequest;
import com.jobboard.dto.response.JobResponse;
import com.jobboard.exception.ResourceNotFoundException;
import com.jobboard.exception.UnauthorizedActionException;
import com.jobboard.model.*;
import com.jobboard.repository.ApplicationRepository;
import com.jobboard.repository.CategoryRepository;
import com.jobboard.repository.CompanyRepository;
import com.jobboard.repository.JobVacancyRepository;
import com.jobboard.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobVacancyRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final CategoryRepository categoryRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional
    public JobResponse create(JobRequest request, Long requesterId, String requesterRole) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + request.getCompanyId()));

        assertCompanyOwnerOrAdmin(company, requesterId, requesterRole);

        // A company must be approved by an admin before it can post jobs.
        // Admins themselves can bypass this (e.g. to seed data or help an employer).
        boolean isAdmin = Role.ADMIN.name().equals(requesterRole);
        if (!isAdmin && company.getStatus() != CompanyStatus.APPROVED) {
            throw new UnauthorizedActionException(
                    "Your company profile is still pending admin approval. You can post jobs once it's approved.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + request.getCategoryId()));

        JobVacancy job = JobVacancy.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .location(request.getLocation())
                .employmentType(request.getEmploymentType())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .deadline(request.getDeadline())
                .company(company)
                .category(category)
                .status(JobStatus.OPEN)
                .build();

        return toResponse(jobRepository.save(job));
    }

    // NOTE: all reads below are @Transactional(readOnly = true). JobVacancy.company
    // and JobVacancy.category are LAZY relations; toResponse() dereferences both.
    // Without an open transaction here (open-in-view is disabled), that throws
    // LazyInitializationException the moment the repository call returns, which
    // was surfacing to the frontend as a generic 500 on every /api/jobs request.
    @Override
    @Transactional(readOnly = true)
    public JobResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> search(Long categoryId, String location, String keyword, boolean isAdmin) {
        List<JobVacancy> results = isAdmin
                ? jobRepository.searchAdmin(categoryId, location, keyword)
                : jobRepository.search(categoryId, location, keyword);
        return results.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getByCompany(Long companyId) {
        return jobRepository.findByCompanyId(companyId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public JobResponse update(Long id, JobRequest request, Long requesterId, String requesterRole) {
        JobVacancy job = findOrThrow(id);
        assertCompanyOwnerOrAdmin(job.getCompany(), requesterId, requesterRole);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + request.getCategoryId()));

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setLocation(request.getLocation());
        job.setEmploymentType(request.getEmploymentType());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setDeadline(request.getDeadline());
        job.setCategory(category);

        return toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    public void delete(Long id, Long requesterId, String requesterRole) {
        JobVacancy job = findOrThrow(id);
        assertCompanyOwnerOrAdmin(job.getCompany(), requesterId, requesterRole);
        jobRepository.delete(job);
    }

    @Override
    @Transactional
    public JobResponse closeJob(Long id, Long requesterId, String requesterRole) {
        JobVacancy job = findOrThrow(id);
        assertCompanyOwnerOrAdmin(job.getCompany(), requesterId, requesterRole);
        job.setStatus(JobStatus.CLOSED);
        return toResponse(jobRepository.save(job));
    }

    private void assertCompanyOwnerOrAdmin(Company company, Long requesterId, String requesterRole) {
        boolean isOwner = company.getOwner().getId().equals(requesterId);
        boolean isAdmin = Role.ADMIN.name().equals(requesterRole);
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedActionException("You do not manage this company's job postings");
        }
    }

    private JobVacancy findOrThrow(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + id));
    }

    private JobResponse toResponse(JobVacancy j) {
        long count = applicationRepository.findByJobId(j.getId()).size();
        return JobResponse.builder()
                .id(j.getId())
                .title(j.getTitle())
                .description(j.getDescription())
                .requirements(j.getRequirements())
                .location(j.getLocation())
                .employmentType(j.getEmploymentType())
                .salaryMin(j.getSalaryMin())
                .salaryMax(j.getSalaryMax())
                .status(j.getStatus())
                .deadline(j.getDeadline())
                .postedAt(j.getPostedAt())
                .companyId(j.getCompany().getId())
                .companyName(j.getCompany().getName())
                .categoryId(j.getCategory().getId())
                .categoryName(j.getCategory().getName())
                .applicationCount(count)
                .build();
    }
}
