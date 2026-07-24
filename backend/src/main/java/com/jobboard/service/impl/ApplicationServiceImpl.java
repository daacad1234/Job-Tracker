package com.jobboard.service.impl;

import com.jobboard.dto.request.ApplicationRequest;
import com.jobboard.dto.request.ApplicationStatusUpdateRequest;
import com.jobboard.dto.response.ApplicationResponse;
import com.jobboard.exception.DuplicateResourceException;
import com.jobboard.exception.ResourceNotFoundException;
import com.jobboard.exception.UnauthorizedActionException;
import com.jobboard.model.*;
import com.jobboard.repository.ApplicationRepository;
import com.jobboard.repository.JobVacancyRepository;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobVacancyRepository jobRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ApplicationResponse apply(ApplicationRequest request, Long applicantId) {
        JobVacancy job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + request.getJobId()));

        User applicant = userRepository.findById(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + applicantId));

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new UnauthorizedActionException("This job posting is closed and no longer accepting applications");
        }

        if (applicationRepository.existsByJobIdAndApplicantId(job.getId(), applicantId)) {
            throw new DuplicateResourceException("You have already applied to this job");
        }

        Application application = Application.builder()
                .job(job)
                .applicant(applicant)
                .resumeUrl(request.getResumeUrl())
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        return toResponse(applicationRepository.save(application));
    }

    // NOTE: all reads below are @Transactional(readOnly = true). Application.job and
    // Application.applicant are LAZY relations that toResponse() dereferences; without
    // an open transaction here (open-in-view is disabled) that throws
    // LazyInitializationException, which is what turned every /api/applications call
    // into a generic 500 "An unexpected error occurred".
    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAll() {
        return applicationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(Long applicantId) {
        return applicationRepository.findByApplicantId(applicantId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForJob(Long jobId, Long requesterId, String requesterRole) {
        JobVacancy job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + jobId));

        assertJobOwnerOrAdmin(job, requesterId, requesterRole);

        return applicationRepository.findByJobId(jobId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatusUpdateRequest request,
                                             Long requesterId, String requesterRole) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + applicationId));

        assertJobOwnerOrAdmin(application.getJob(), requesterId, requesterRole);

        application.setStatus(request.getStatus());
        return toResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional
    public void withdraw(Long applicationId, Long applicantId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + applicationId));

        if (!application.getApplicant().getId().equals(applicantId)) {
            throw new UnauthorizedActionException("You can only withdraw your own applications");
        }

        applicationRepository.delete(application);
    }

    private void assertJobOwnerOrAdmin(JobVacancy job, Long requesterId, String requesterRole) {
        boolean isOwner = job.getCompany().getOwner().getId().equals(requesterId);
        boolean isAdmin = Role.ADMIN.name().equals(requesterRole);
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedActionException("You do not manage the job this application belongs to");
        }
    }

    private ApplicationResponse toResponse(Application a) {
        return ApplicationResponse.builder()
                .id(a.getId())
                .resumeUrl(a.getResumeUrl())
                .coverLetter(a.getCoverLetter())
                .status(a.getStatus())
                .appliedAt(a.getAppliedAt())
                .jobId(a.getJob().getId())
                .jobTitle(a.getJob().getTitle())
                .applicantId(a.getApplicant().getId())
                .applicantName(a.getApplicant().getFullName())
                .applicantEmail(a.getApplicant().getEmail())
                .build();
    }
}
