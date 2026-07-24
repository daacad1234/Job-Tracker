package com.jobboard.service;

import com.jobboard.dto.request.CompanyRequest;
import com.jobboard.dto.response.CompanyResponse;

import java.util.List;

public interface CompanyService {
    CompanyResponse create(CompanyRequest request, Long ownerId);
    CompanyResponse getById(Long id);

    /**
     * @param includeAllStatuses when true (admin callers), returns companies of every
     *                           status; otherwise only APPROVED companies are returned.
     */
    List<CompanyResponse> getAll(boolean includeAllStatuses);
    List<CompanyResponse> getMine(Long ownerId);
    CompanyResponse update(Long id, CompanyRequest request, Long requesterId, String requesterRole);
    void delete(Long id, Long requesterId, String requesterRole);

    CompanyResponse approve(Long id);
    CompanyResponse reject(Long id);
}
