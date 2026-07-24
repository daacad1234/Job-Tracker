package com.jobboard.service;

import com.jobboard.dto.request.JobRequest;
import com.jobboard.dto.response.JobResponse;

import java.util.List;

public interface JobService {
    JobResponse create(JobRequest request, Long requesterId, String requesterRole);
    JobResponse getById(Long id);
    List<JobResponse> search(Long categoryId, String location, String keyword, boolean isAdmin);
    List<JobResponse> getByCompany(Long companyId);
    JobResponse update(Long id, JobRequest request, Long requesterId, String requesterRole);
    void delete(Long id, Long requesterId, String requesterRole);
    JobResponse closeJob(Long id, Long requesterId, String requesterRole);
}
