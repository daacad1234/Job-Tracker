package com.jobboard.service;

import com.jobboard.dto.request.ApplicationRequest;
import com.jobboard.dto.request.ApplicationStatusUpdateRequest;
import com.jobboard.dto.response.ApplicationResponse;

import java.util.List;

public interface ApplicationService {
    ApplicationResponse apply(ApplicationRequest request, Long applicantId);
    List<ApplicationResponse> getAll();
    List<ApplicationResponse> getMyApplications(Long applicantId);
    List<ApplicationResponse> getApplicationsForJob(Long jobId, Long requesterId, String requesterRole);
    ApplicationResponse updateStatus(Long applicationId, ApplicationStatusUpdateRequest request,
                                      Long requesterId, String requesterRole);
    void withdraw(Long applicationId, Long applicantId);
}
