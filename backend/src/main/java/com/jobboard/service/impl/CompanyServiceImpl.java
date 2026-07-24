package com.jobboard.service.impl;

import com.jobboard.dto.request.CompanyRequest;
import com.jobboard.dto.response.CompanyResponse;
import com.jobboard.exception.ResourceNotFoundException;
import com.jobboard.exception.UnauthorizedActionException;
import com.jobboard.model.Company;
import com.jobboard.model.CompanyStatus;
import com.jobboard.model.Role;
import com.jobboard.model.User;
import com.jobboard.repository.CompanyRepository;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CompanyResponse create(CompanyRequest request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + ownerId));

        Company company = Company.builder()
                .name(request.getName())
                .description(request.getDescription())
                .website(request.getWebsite())
                .logoUrl(request.getLogoUrl())
                .owner(owner)
                .status(CompanyStatus.PENDING)
                .build();

        return toResponse(companyRepository.save(company));
    }

    // NOTE: reads below are annotated @Transactional(readOnly = true) because the
    // owner relation on Company is lazily fetched. Without an open transaction/session
    // here, accessing company.getOwner().getId()/getFullName() inside toResponse()
    // throws LazyInitializationException once the repository call returns (open-in-view
    // is disabled in application.properties), which surfaced to the frontend as a
    // generic 500 "An unexpected error occurred".
    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getAll(boolean includeAllStatuses) {
        List<Company> companies = includeAllStatuses
                ? companyRepository.findAll()
                : companyRepository.findByStatus(CompanyStatus.APPROVED);
        return companies.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getMine(Long ownerId) {
        return companyRepository.findByOwnerId(ownerId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public CompanyResponse update(Long id, CompanyRequest request, Long requesterId, String requesterRole) {
        Company company = findOrThrow(id);
        assertOwnerOrAdmin(company, requesterId, requesterRole);

        company.setName(request.getName());
        company.setDescription(request.getDescription());
        company.setWebsite(request.getWebsite());
        company.setLogoUrl(request.getLogoUrl());

        return toResponse(companyRepository.save(company));
    }

    @Override
    @Transactional
    public void delete(Long id, Long requesterId, String requesterRole) {
        Company company = findOrThrow(id);
        assertOwnerOrAdmin(company, requesterId, requesterRole);
        companyRepository.delete(company);
    }

    @Override
    @Transactional
    public CompanyResponse approve(Long id) {
        Company company = findOrThrow(id);
        company.setStatus(CompanyStatus.APPROVED);
        return toResponse(companyRepository.save(company));
    }

    @Override
    @Transactional
    public CompanyResponse reject(Long id) {
        Company company = findOrThrow(id);
        company.setStatus(CompanyStatus.REJECTED);
        return toResponse(companyRepository.save(company));
    }

    private void assertOwnerOrAdmin(Company company, Long requesterId, String requesterRole) {
        boolean isOwner = company.getOwner().getId().equals(requesterId);
        boolean isAdmin = Role.ADMIN.name().equals(requesterRole);
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedActionException("You do not own this company profile");
        }
    }

    private Company findOrThrow(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + id));
    }

    private CompanyResponse toResponse(Company c) {
        return CompanyResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .website(c.getWebsite())
                .logoUrl(c.getLogoUrl())
                .ownerId(c.getOwner().getId())
                .ownerName(c.getOwner().getFullName())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
