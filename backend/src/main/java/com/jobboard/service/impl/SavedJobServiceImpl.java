package com.jobboard.service.impl;

import com.jobboard.dto.response.JobResponse;
import com.jobboard.dto.response.SavedJobResponse;
import com.jobboard.exception.DuplicateResourceException;
import com.jobboard.exception.ResourceNotFoundException;
import com.jobboard.model.JobVacancy;
import com.jobboard.model.SavedJob;
import com.jobboard.model.User;
import com.jobboard.repository.JobVacancyRepository;
import com.jobboard.repository.SavedJobRepository;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.SavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedJobServiceImpl implements SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobVacancyRepository jobRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SavedJobResponse save(Long jobId, Long userId) {
        if (savedJobRepository.existsByJobIdAndUserId(jobId, userId)) {
            throw new DuplicateResourceException("Job already saved");
        }

        JobVacancy job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id " + jobId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        SavedJob savedJob = SavedJob.builder().job(job).user(user).build();
        return toResponse(savedJobRepository.save(savedJob));
    }

    @Override
    @Transactional
    public void unsave(Long jobId, Long userId) {
        SavedJob savedJob = savedJobRepository.findByJobIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved job not found"));
        savedJobRepository.delete(savedJob);
    }

    // @Transactional(readOnly = true) is required here because toResponse() dereferences
    // the lazily-fetched SavedJob.job (and its own company/category relations); without
    // an open transaction (open-in-view is disabled) this throws LazyInitializationException.
    @Override
    @Transactional(readOnly = true)
    public List<SavedJobResponse> getMine(Long userId) {
        return savedJobRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    private SavedJobResponse toResponse(SavedJob s) {
        JobVacancy j = s.getJob();
        JobResponse jobResponse = JobResponse.builder()
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
                .applicationCount(0)
                .build();

        return SavedJobResponse.builder()
                .id(s.getId())
                .job(jobResponse)
                .savedAt(s.getSavedAt())
                .build();
    }
}
